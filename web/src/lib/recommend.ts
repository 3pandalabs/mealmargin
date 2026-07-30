import { BANKS, PLATFORM_BY_ID } from "./platforms";
import { quoteAll, type Quote, type QuoteContext } from "./pricing";
import { rupees } from "./format";
import type { PlatformId } from "./types";

// Turns a set of quotes into the two things a person actually wants: which
// column to tap, and why the answer would be different for a different cart.

export interface Ranked {
  quotes: Quote[];
  available: Quote[];
  best?: Quote;
  runnerUp?: Quote;
  worst?: Quote;
  /** Best vs worst available column — the headline number. */
  spread: number;
  spreadPercent: number;
}

export function rank(quotes: Quote[]): Ranked {
  const available = quotes.filter((q) => q.available).sort((a, b) => a.total - b.total);
  const best = available[0];
  const runnerUp = available[1];
  const worst = available[available.length - 1];
  const spread = best && worst ? worst.total - best.total : 0;
  const spreadPercent = worst && worst.total > 0 ? (spread / worst.total) * 100 : 0;
  return { quotes, available, best, runnerUp, worst, spread, spreadPercent };
}

export interface CrossoverSegment {
  fromSubtotal: number;
  toSubtotal: number;
  winner: PlatformId;
}

export const SWEEP_MIN = 100;
export const SWEEP_MAX = 2400;
const SWEEP_STEP = 20;
/** Bands narrower than this are coupon-threshold noise, not advice. */
const MIN_BAND = SWEEP_STEP * 4;

/**
 * Slides the cart value across a range, keeping the composition fixed, and
 * records which platform wins in each band. This is what turns "ONDC is
 * cheaper" into "ONDC is cheaper below ₹430", which is the only form of that
 * claim that is actually true.
 */
export function crossoverSegments(ctx: QuoteContext): CrossoverSegment[] {
  if (ctx.itemCount === 0 || ctx.baseSubtotal <= 0) return [];

  const packagingPerRupee = ctx.packagingBase / ctx.baseSubtotal;
  const segments: CrossoverSegment[] = [];

  for (let subtotal = SWEEP_MIN; subtotal <= SWEEP_MAX; subtotal += SWEEP_STEP) {
    const probe: QuoteContext = {
      ...ctx,
      baseSubtotal: subtotal,
      packagingBase: Math.round(subtotal * packagingPerRupee),
    };
    const winner = rank(quoteAll(probe)).best?.platform.id;
    if (!winner) continue;

    const last = segments[segments.length - 1];
    if (last && last.winner === winner) {
      last.toSubtotal = subtotal;
    } else {
      segments.push({ fromSubtotal: last?.toSubtotal ?? SWEEP_MIN, toSubtotal: subtotal, winner });
    }
  }

  if (segments.length > 0) segments[segments.length - 1].toSubtotal = SWEEP_MAX;
  return smooth(segments);
}

/**
 * Coupon minimums make the raw sweep flicker: a platform can win a single ₹20
 * step and lose the next. Absorbing those slivers into whichever neighbour is
 * wider keeps the bands contiguous — which matters, because the crossover bar
 * renders them as adjacent widths and a gap would draw as a hole.
 */
function smooth(input: CrossoverSegment[]): CrossoverSegment[] {
  const segments = input.map((segment) => ({ ...segment }));

  for (;;) {
    if (segments.length < 2) break;
    let narrowest = 0;
    for (let i = 1; i < segments.length; i += 1) {
      if (width(segments[i]) < width(segments[narrowest])) narrowest = i;
    }
    if (width(segments[narrowest]) >= MIN_BAND) break;

    const before = segments[narrowest - 1];
    const after = segments[narrowest + 1];
    const target =
      !before ? after : !after ? before : width(after) > width(before) ? after : before;
    target.fromSubtotal = Math.min(target.fromSubtotal, segments[narrowest].fromSubtotal);
    target.toSubtotal = Math.max(target.toSubtotal, segments[narrowest].toSubtotal);
    segments.splice(narrowest, 1);
  }

  // Absorption can leave two neighbours with the same winner.
  return segments.reduce<CrossoverSegment[]>((acc, segment) => {
    const last = acc[acc.length - 1];
    if (last && last.winner === segment.winner) last.toSubtotal = segment.toSubtotal;
    else acc.push(segment);
    return acc;
  }, []);
}

const width = (segment: CrossoverSegment) => segment.toSubtotal - segment.fromSubtotal;

export interface Advice {
  tone: "win" | "tie" | "info";
  headline: string;
  detail: string;
  /** Extra lines: membership breakeven, stacking losses, unlisted platforms. */
  footnotes: string[];
}

/** `segments` is passed in rather than recomputed: the caller already needs it
 *  for the crossover bar, and the sweep is the most expensive thing here. */
export function buildAdvice(ctx: QuoteContext, ranked: Ranked, segments: CrossoverSegment[]): Advice {
  const footnotes: string[] = [];

  if (ctx.itemCount === 0) {
    return {
      tone: "info",
      headline: "Add something to the cart",
      detail:
        "Fees are per-order, not per-item, so the cheapest platform genuinely changes with cart size. Pick a dish and the three columns will fill in.",
      footnotes: [],
    };
  }

  const { best, runnerUp, spread } = ranked;
  if (!best) {
    return {
      tone: "info",
      headline: "Nothing to compare",
      detail: "This restaurant is not listed on any of the three channels.",
      footnotes: [],
    };
  }

  // What actually won it: name the mechanism, not just the platform.
  const reasons: string[] = [];
  if (best.platform.id === "ondc") {
    reasons.push(
      `its menu price is ${rupees(
        (runnerUp?.menuSubtotal ?? best.menuSubtotal) - best.menuSubtotal,
      )} lower before a single discount, because the network takes ${Math.round(
        best.platform.commission * 100,
      )}% instead of ~26-28%`,
    );
  }
  if (best.deliveryWaived) reasons.push(`delivery is waived by ${best.platform.membership?.name}`);
  if (best.couponDiscount > 0 && best.appliedCoupon)
    reasons.push(`${best.appliedCoupon.code} takes off ${rupees(best.couponDiscount)}`);
  if (best.memberDiscount > 0) reasons.push(`the member discount takes off ${rupees(best.memberDiscount)}`);
  if (best.bankDiscount > 0 && best.appliedBank) {
    const bankName = BANKS.find((bank) => bank.id === best.appliedBank?.bank)?.short ?? "card";
    reasons.push(`your ${bankName} offer adds ${rupees(best.bankDiscount)}`);
  }

  // The widest losing band, not the first — the first can be a sliver near the
  // bottom of the sweep, which is true but not useful.
  const otherBand = segments
    .filter((s) => s.winner !== best.platform.id)
    .sort((a, b) => b.toSubtotal - b.fromSubtotal - (a.toSubtotal - a.fromSubtotal))[0];
  if (otherBand) {
    const otherName = PLATFORM_BY_ID[otherBand.winner].name;
    const band =
      otherBand.fromSubtotal <= SWEEP_MIN
        ? `under ${rupees(otherBand.toSubtotal)}`
        : otherBand.toSubtotal >= SWEEP_MAX
          ? `above ${rupees(otherBand.fromSubtotal)}`
          : `between ${rupees(otherBand.fromSubtotal)} and ${rupees(otherBand.toSubtotal)}`;
    footnotes.push(
      `Cart-size flip: ${otherName} wins ${band} of menu value — fixed per-order fees dominate a small cart, capped percentage discounts dominate a large one.`,
    );
  }

  for (const quote of ranked.quotes) {
    if (!quote.available) footnotes.push(`${quote.unavailableReason}.`);
    if (quote.promoRunnerUp) footnotes.push(`${quote.platform.name}: dropped ${quote.promoRunnerUp}.`);
  }

  // Membership breakeven, but only when the pass is currently switched off —
  // otherwise it is advice about a decision already made.
  for (const quote of ranked.available) {
    const membership = quote.platform.membership;
    if (!membership || ctx.memberships[quote.platform.id]) continue;
    const withMember = quoteAll({
      ...ctx,
      memberships: { ...ctx.memberships, [quote.platform.id]: true },
    }).find((q) => q.platform.id === quote.platform.id);
    if (!withMember) continue;
    const saving = quote.total - withMember.total;
    if (saving > 0) {
      footnotes.push(
        `${membership.name} would save ${rupees(saving)} on this order alone; the pass costs ${rupees(
          membership.monthlyCost,
        )}/month, so it pays for itself in ${Math.ceil(membership.monthlyCost / saving)} order${
          Math.ceil(membership.monthlyCost / saving) === 1 ? "" : "s"
        } like this one.`,
      );
    }
  }

  if (spread <= 5) {
    return {
      tone: "tie",
      headline: `All three land within ${rupees(spread)} — order wherever you like`,
      detail:
        "At this cart value the commission gap and the fee structures cancel out. Pick on delivery time or restaurant rating instead of price.",
      footnotes,
    };
  }

  return {
    tone: "win",
    headline: `${best.platform.name} wins by ${rupees(spread)} — pay ${rupees(best.total)}`,
    detail:
      reasons.length > 0
        ? `On a cart of ${rupees(ctx.baseSubtotal)} at the kitchen's own prices, ${reasons.join("; ")}.`
        : `On a cart of ${rupees(ctx.baseSubtotal)} at the kitchen's own prices, it is simply the cheapest checkout once fees and taxes land.`,
    footnotes,
  };
}
