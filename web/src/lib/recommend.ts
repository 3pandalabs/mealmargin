import { CHANNEL_BY_ID, DRIVE_MINUTES_PER_KM, WALK_MINUTES_PER_KM } from "./channels";
import { BANKS } from "./channels";
import { quoteAll, resolveLines, servesAll, type Quote, type ResolvedLine } from "./pricing";
import { rupees } from "./format";
import { restaurantsIn } from "./restaurants";
import type { BankId, CartLine, ChannelId, Fulfillment, Restaurant } from "./types";

// Turns a locality plus a meal into the two things a person actually wants:
// where to buy it, and how much walking there instead saves.

/** Beyond this, "walk there" stops being advice and starts being a joke. */
const WALKABLE_KM = 2.5;

export interface Preferences {
  fulfillment: Fulfillment;
  peak: boolean;
  memberships: Record<ChannelId, boolean>;
  banks: BankId[];
  usePromos: boolean;
}

export interface RestaurantResult {
  restaurant: Restaurant;
  /** This kitchen's own prices for the meal. Kept on the result because the
   *  cart-size sweep and the membership-breakeven check both need to re-quote
   *  the same basket, and re-deriving them from the restaurant twice invites
   *  the two paths to drift. */
  lines: ResolvedLine[];
  /** All four channels, in fixed order, priced for the chosen fulfillment. */
  quotes: Quote[];
  /** Available ones, cheapest first. */
  ranked: Quote[];
  best?: Quote;
  /** Cheapest channel that will actually bring it to you. */
  bestDelivered?: Quote;
  /** Cost of collecting it yourself. */
  pickup?: Quote;
  pickupSaving: number;
  pickupSavingPercent: number;
  walkMinutes: number;
  driveMinutes: number;
  /** Whether suggesting the walk is sensible at all. A 3.8 km kitchen is a
   *  46-minute walk — true, and useless as advice, so the UI shows the drive
   *  instead rather than quoting a number nobody will act on. */
  walkable: boolean;
}

export interface BestChoice {
  restaurant: Restaurant;
  quote: Quote;
}

export interface Advice {
  tone: "win" | "info";
  headline: string;
  detail: string;
  footnotes: string[];
}

export interface Comparison {
  results: RestaurantResult[];
  /** Kitchens in this locality that do not serve the whole meal. */
  skipped: { restaurant: Restaurant; missing: string[] }[];
  best?: BestChoice;
  /** Best vs worst across every kitchen and channel — the headline number. */
  spread: number;
  advice: Advice;
}

function scaleLines(lines: ResolvedLine[], factor: number): ResolvedLine[] {
  return lines.map((line) => ({
    ...line,
    counterPrice: Math.round(line.counterPrice * factor),
    packagingCost: Math.round(line.packagingCost * factor),
  }));
}

function evaluate(
  restaurant: Restaurant,
  lines: ResolvedLine[],
  prefs: Preferences,
): RestaurantResult {
  const base = {
    restaurant,
    lines,
    peak: prefs.peak,
    memberships: prefs.memberships,
    banks: prefs.banks,
    usePromos: prefs.usePromos,
  };

  const quotes = quoteAll({ ...base, fulfillment: prefs.fulfillment });
  const ranked = quotes.filter((quote) => quote.available).sort((a, b) => a.total - b.total);

  // The savings card always compares like for like: cheapest *delivered* under
  // delivery pricing against the counter. Computing it from whatever mode the
  // UI happens to be in would make the number jump when you flip the toggle,
  // which is exactly when someone is looking at it.
  const deliveryQuotes = quoteAll({ ...base, fulfillment: "delivery" });
  const bestDelivered = deliveryQuotes
    .filter((quote) => quote.available && quote.channel.supportsDelivery)
    .sort((a, b) => a.total - b.total)[0];
  const pickup = deliveryQuotes.find((quote) => quote.channel.id === "pickup" && quote.available);

  const pickupSaving = bestDelivered && pickup ? bestDelivered.total - pickup.total : 0;
  const pickupSavingPercent =
    bestDelivered && bestDelivered.total > 0 ? (pickupSaving / bestDelivered.total) * 100 : 0;

  return {
    restaurant,
    lines,
    quotes,
    ranked,
    best: ranked[0],
    bestDelivered,
    pickup,
    pickupSaving,
    pickupSavingPercent,
    walkMinutes: Math.round(restaurant.distanceKm * WALK_MINUTES_PER_KM),
    driveMinutes: Math.max(3, Math.round(restaurant.distanceKm * DRIVE_MINUTES_PER_KM)),
    walkable: restaurant.distanceKm <= WALKABLE_KM,
  };
}

export function compare(
  localityId: string,
  cart: CartLine[],
  prefs: Preferences,
): Comparison {
  const kitchens = restaurantsIn(localityId);
  const lines = cart.filter((line) => line.quantity > 0);

  if (lines.length === 0) {
    return {
      results: [],
      skipped: [],
      spread: 0,
      advice: {
        tone: "info",
        headline: "Build your meal",
        detail:
          "Add the dishes you actually want — say one kadhai paneer and three tandoori roti — and every kitchen near you that serves all of them gets priced four ways.",
        footnotes: [],
      },
    };
  }

  const results: RestaurantResult[] = [];
  const skipped: { restaurant: Restaurant; missing: string[] }[] = [];

  for (const restaurant of kitchens) {
    if (!servesAll(restaurant, lines)) {
      const missing = lines
        .filter((line) => !restaurant.menu.some((entry) => entry.dishId === line.dishId))
        .map((line) => line.dishId);
      skipped.push({ restaurant, missing });
      continue;
    }
    const resolved = resolveLines(restaurant, lines);
    if (!resolved) continue;
    results.push(evaluate(restaurant, resolved, prefs));
  }

  results.sort((a, b) => (a.best?.total ?? Infinity) - (b.best?.total ?? Infinity));

  const everyTotal = results.flatMap((result) => result.ranked.map((quote) => quote.total));
  const spread = everyTotal.length > 1 ? Math.max(...everyTotal) - Math.min(...everyTotal) : 0;

  const topResult = results[0];
  const best: BestChoice | undefined =
    topResult && topResult.best ? { restaurant: topResult.restaurant, quote: topResult.best } : undefined;

  return {
    results,
    skipped,
    best,
    spread,
    advice: buildAdvice(results, best, spread, prefs),
  };
}

/**
 * Fixed per-order fees are a bigger share of a small bill than a large one, so
 * "pickup saves you X%" is only true at a given cart size. This re-prices the
 * same meal at a smaller and a larger value to say so honestly, rather than
 * quoting one percentage as if it were a constant.
 */
function savingPercentAt(result: RestaurantResult, targetSubtotal: number, prefs: Preferences): number {
  const actual = result.pickup?.counterSubtotal ?? 0;
  if (actual <= 0) return 0;
  const scaled = scaleLines(result.lines, targetSubtotal / actual);
  if (scaled.length === 0) return 0;

  const base = {
    restaurant: result.restaurant,
    lines: scaled,
    peak: prefs.peak,
    memberships: prefs.memberships,
    banks: prefs.banks,
    usePromos: prefs.usePromos,
    fulfillment: "delivery" as const,
  };
  const quotes = quoteAll(base);
  const delivered = quotes
    .filter((quote) => quote.available && quote.channel.supportsDelivery)
    .sort((a, b) => a.total - b.total)[0];
  const pickup = quotes.find((quote) => quote.channel.id === "pickup" && quote.available);
  if (!delivered || !pickup || delivered.total === 0) return 0;
  return ((delivered.total - pickup.total) / delivered.total) * 100;
}

function buildAdvice(
  results: RestaurantResult[],
  best: BestChoice | undefined,
  spread: number,
  prefs: Preferences,
): Advice {
  const footnotes: string[] = [];

  if (results.length === 0 || !best) {
    return {
      tone: "info",
      headline: "No kitchen near you serves that whole meal",
      detail:
        "Every comparison here prices the complete basket at one kitchen, because splitting an order across two restaurants means paying two sets of fees. Drop an item, or try another locality.",
      footnotes: [],
    };
  }

  const top = results[0];
  const channelName =
    best.quote.channel.id === "pickup" ? "collecting it yourself" : `${best.quote.channel.name}`;

  const reasons: string[] = [];
  if (best.quote.channel.id === "pickup") {
    reasons.push(
      `no commission inside the price, no platform fee and no rider — ${rupees(
        top.pickupSaving,
      )} less than having it delivered`,
    );
  } else {
    if (best.quote.deliveryWaived)
      reasons.push(`delivery is waived by ${best.quote.channel.membership?.name}`);
    if (best.quote.couponDiscount > 0 && best.quote.appliedCoupon)
      reasons.push(`${best.quote.appliedCoupon.code} takes off ${rupees(best.quote.couponDiscount)}`);
    if (best.quote.memberDiscount > 0)
      reasons.push(`the member discount takes off ${rupees(best.quote.memberDiscount)}`);
    if (best.quote.bankDiscount > 0 && best.quote.appliedBank) {
      const bank = BANKS.find((entry) => entry.id === best.quote.appliedBank?.bank)?.short ?? "card";
      reasons.push(`your ${bank} offer adds ${rupees(best.quote.bankDiscount)}`);
    }
  }

  // Pickup economics, stated at two cart sizes so the percentage is honest.
  const bestPickup = [...results].sort((a, b) => b.pickupSavingPercent - a.pickupSavingPercent)[0];
  if (bestPickup && bestPickup.pickupSaving > 0) {
    const small = savingPercentAt(bestPickup, 250, prefs);
    const large = savingPercentAt(bestPickup, 1200, prefs);
    if (small > 0 && large > 0) {
      footnotes.push(
        `Fees hit small orders hardest: at ${bestPickup.restaurant.name}, collecting yourself saves about ${Math.round(
          small,
        )}% on a ₹250 basket but only ${Math.round(
          large,
        )}% on a ₹1,200 one — the platform and delivery fees are flat, so they matter less the more food you buy.`,
      );
    }
    footnotes.push(
      `Best pickup deal nearby: ${bestPickup.restaurant.name}, ${rupees(
        bestPickup.pickupSaving,
      )} saved (${Math.round(bestPickup.pickupSavingPercent)}%) — ${bestPickup.restaurant.distanceKm} km, ${
        bestPickup.walkable
          ? `about ${bestPickup.walkMinutes} min on foot`
          : `about ${bestPickup.driveMinutes} min to drive`
      }.`,
    );
  }

  // The opposite case, and worth saying outright rather than showing a negative
  // saving: a large enough app coupon really can beat the counter.
  const couponBeatsCounter = results.filter((result) => result.pickupSaving < 0);
  if (prefs.usePromos && couponBeatsCounter.length > 0 && best.quote.channel.id !== "pickup") {
    footnotes.push(
      `At ${couponBeatsCounter.length} of these kitchens an app promo currently beats the counter — that is what a capped percentage coupon does to a small bill. Switch promo codes off to see the structural comparison without one.`,
    );
  }

  for (const quote of top.quotes) {
    if (!quote.available && quote.unavailableReason) footnotes.push(`${quote.unavailableReason}.`);
    if (quote.promoRunnerUp) footnotes.push(`${quote.channel.name}: dropped ${quote.promoRunnerUp}.`);
  }

  // Membership breakeven, but only for a pass that is currently switched off.
  for (const quote of top.ranked) {
    const membership = quote.channel.membership;
    if (!membership || prefs.memberships[quote.channel.id]) continue;
    const withMember = quoteAll({
      restaurant: top.restaurant,
      lines: top.lines,
      fulfillment: prefs.fulfillment,
      peak: prefs.peak,
      banks: prefs.banks,
      usePromos: prefs.usePromos,
      memberships: { ...prefs.memberships, [quote.channel.id]: true },
    }).find((entry) => entry.channel.id === quote.channel.id);
    if (!withMember) continue;
    const saving = quote.total - withMember.total;
    if (saving > 0) {
      const orders = Math.ceil(membership.monthlyCost / saving);
      footnotes.push(
        `${membership.name} would save ${rupees(saving)} on this order; the pass costs ${rupees(
          membership.monthlyCost,
        )}/month, so it pays for itself in ${orders} order${orders === 1 ? "" : "s"} like this one.`,
      );
    }
  }

  return {
    tone: "win",
    headline: `${best.restaurant.name} — ${rupees(best.quote.total)} ${
      best.quote.channel.id === "pickup" ? "if you collect it" : `via ${best.quote.channel.name}`
    }`,
    detail:
      reasons.length > 0
        ? `Cheapest of ${results.length} kitchen${results.length === 1 ? "" : "s"} nearby, ${rupees(
            spread,
          )} below the dearest way to buy the same meal. It wins because ${reasons.join("; ")}.`
        : `Cheapest of ${results.length} kitchen${
            results.length === 1 ? "" : "s"
          } nearby by ${channelName}, ${rupees(spread)} below the dearest way to buy the same meal.`,
    footnotes,
  };
}

export { CHANNEL_BY_ID };
