import { CHANNELS, GST_ON_FEES, GST_ON_FOOD } from "./channels";
import { DISH_BY_ID } from "./dishes";
import { BANK_OFFERS, COUPONS } from "./offers";
import type {
  BankId,
  BankOffer,
  CartLine,
  Channel,
  ChannelId,
  Coupon,
  Dish,
  Fulfillment,
  Restaurant,
  RestaurantOffer,
} from "./types";

// The engine. Pure functions, no React, no I/O — so the same code backs the
// comparison grid, the pickup-savings card and the cart-threshold sweep.

/** Round to ₹5 above ₹50, to ₹1 below it. Menus price a ₹12 roti to the rupee
 *  and a ₹235 paneer to the five, and a single rule for both looks wrong. */
function menuRound(value: number): number {
  return value >= 50 ? Math.round(value / 5) * 5 : Math.round(value);
}

/** What this kitchen charges for this dish at its own counter. Every price in
 *  the app derives from this — it is the number the four channels mark up. */
export function counterPriceFor(restaurant: Restaurant, dish: Dish): number | null {
  const entry = restaurant.menu.find((item) => item.dishId === dish.id);
  if (!entry) return null;
  return entry.priceOverride ?? menuRound(dish.counterPrice * restaurant.priceTier);
}

export function packagingCostFor(restaurant: Restaurant, dish: Dish): number {
  const entry = restaurant.menu.find((item) => item.dishId === dish.id);
  return entry?.packagingOverride ?? dish.packagingCost;
}

export function serves(restaurant: Restaurant, dishId: string): boolean {
  return restaurant.menu.some((entry) => entry.dishId === dishId);
}

export function servesAll(restaurant: Restaurant, lines: CartLine[]): boolean {
  return lines.every((line) => serves(restaurant, line.dishId));
}

export interface ResolvedLine {
  dish: Dish;
  quantity: number;
  counterPrice: number;
  packagingCost: number;
}

/** Turns canonical cart lines into this kitchen's actual prices. Returns null
 *  if the kitchen does not serve every dish — a partial basket is not a
 *  comparable quote, and quietly dropping a line would understate its total. */
export function resolveLines(restaurant: Restaurant, lines: CartLine[]): ResolvedLine[] | null {
  const resolved: ResolvedLine[] = [];
  for (const line of lines) {
    const dish = DISH_BY_ID.get(line.dishId);
    if (!dish) return null;
    const counterPrice = counterPriceFor(restaurant, dish);
    if (counterPrice === null) return null;
    resolved.push({
      dish,
      quantity: line.quantity,
      counterPrice,
      packagingCost: packagingCostFor(restaurant, dish),
    });
  }
  return resolved;
}

export interface QuoteContext {
  restaurant: Restaurant;
  lines: ResolvedLine[];
  fulfillment: Fulfillment;
  peak: boolean;
  memberships: Record<ChannelId, boolean>;
  banks: BankId[];
  /**
   * Whether to auto-apply promo codes. Default on, but switchable, because
   * assuming a 60%-off code on every order is not neutral: it is the single
   * biggest thing that can make an app look cheaper than the counter, and most
   * repeat orders do not have one. Turning it off shows the structural
   * comparison — commission, fees, rider — with no promotion in it.
   */
  usePromos: boolean;
  /** Overrides the restaurant's own distance — used by the crossover sweep and
   *  nothing else, so quotes normally reflect the real distance. */
  distanceKmOverride?: number;
}

export type PromoKind = "member" | "coupon" | "both" | "none";

export interface Quote {
  channel: Channel;
  available: boolean;
  unavailableReason?: string;

  counterSubtotal: number;
  menuSubtotal: number;
  /** How much of the menu price is pure channel commission. Zero for pickup. */
  commissionComponent: number;

  restaurantOffer?: RestaurantOffer;
  restaurantDiscount: number;

  packaging: number;
  platformFee: number;
  deliveryBeforeWaiver: number;
  delivery: number;
  deliveryWaived: boolean;
  taxes: number;

  memberDiscount: number;
  couponDiscount: number;
  appliedCoupon?: Coupon;
  promoKind: PromoKind;
  promoRunnerUp?: string;

  bankDiscount: number;
  appliedBank?: BankOffer;

  total: number;
  notes: string[];
}

const round = (value: number) => Math.round(value);

function capped(amount: number, percent: number, cap: number): number {
  return Math.min(round((amount * percent) / 100), cap);
}

export function deliveryFee(channel: Channel, distanceKm: number, peak: boolean): number {
  if (!channel.supportsDelivery) return 0;
  const extraKm = Math.max(0, distanceKm - channel.delivery.includedKm);
  let fee = channel.delivery.baseFare + extraKm * channel.delivery.perKm;
  if (peak) fee = fee * channel.surge.deliveryMultiplier + channel.surge.extraFee;
  return Math.min(round(fee), channel.delivery.cap);
}

function bestRestaurantOffer(
  restaurant: Restaurant,
  channel: Channel,
  foodValue: number,
): { offer?: RestaurantOffer; discount: number } {
  let best: { offer?: RestaurantOffer; discount: number } = { discount: 0 };
  for (const offer of restaurant.offers) {
    if (offer.channel !== channel.id) continue;
    if (foodValue < offer.minOrder) continue;
    const discount = capped(foodValue, offer.percent, offer.cap);
    if (discount > best.discount) best = { offer, discount };
  }
  return best;
}

function bestCoupon(channel: Channel, foodValue: number): { coupon?: Coupon; discount: number } {
  let best: { coupon?: Coupon; discount: number } = { discount: 0 };
  for (const coupon of COUPONS) {
    if (coupon.channel !== channel.id) continue;
    if (foodValue < coupon.minOrder) continue;
    const discount = capped(foodValue, coupon.percent, coupon.cap);
    if (discount > best.discount) best = { coupon, discount };
  }
  return best;
}

function bestBankOffer(
  channel: Channel,
  banks: BankId[],
  payable: number,
): { offer?: BankOffer; discount: number } {
  let best: { offer?: BankOffer; discount: number } = { discount: 0 };
  for (const offer of BANK_OFFERS) {
    if (offer.channel !== channel.id) continue;
    if (!banks.includes(offer.bank)) continue;
    if (payable < offer.minOrder) continue;
    const discount =
      offer.amount !== undefined
        ? Math.min(offer.amount, payable)
        : capped(payable, offer.percent ?? 0, offer.cap ?? 0);
    if (discount > best.discount) best = { offer, discount };
  }
  return best;
}

function emptyQuote(channel: Channel, reason: string): Quote {
  return {
    channel,
    available: false,
    unavailableReason: reason,
    counterSubtotal: 0,
    menuSubtotal: 0,
    commissionComponent: 0,
    restaurantDiscount: 0,
    packaging: 0,
    platformFee: 0,
    deliveryBeforeWaiver: 0,
    delivery: 0,
    deliveryWaived: false,
    taxes: 0,
    memberDiscount: 0,
    couponDiscount: 0,
    promoKind: "none",
    bankDiscount: 0,
    total: 0,
    notes: [],
  };
}

export function quoteFor(channel: Channel, ctx: QuoteContext): Quote {
  const notes: string[] = [];
  const pickup = ctx.fulfillment === "pickup";

  if (!ctx.restaurant.listedOn.includes(channel.id)) {
    return emptyQuote(channel, `${ctx.restaurant.name} is not on ${channel.name}`);
  }

  const itemCount = ctx.lines.reduce((sum, line) => sum + line.quantity, 0);
  if (itemCount === 0) return emptyQuote(channel, "Nothing in the meal yet");

  const counterSubtotal = ctx.lines.reduce(
    (sum, line) => sum + line.counterPrice * line.quantity,
    0,
  );
  const packagingBase = ctx.lines.reduce(
    (sum, line) => sum + line.packagingCost * line.quantity,
    0,
  );

  // 1. Menu price = counter price + this channel's effective commission. For
  //    pickup the commission is zero, which is the whole reason it wins.
  const commissionRate = channel.commission + (ctx.restaurant.markupAdjustment[channel.id] ?? 0);
  const menuSubtotal = round(counterSubtotal * (1 + commissionRate));
  const commissionComponent = menuSubtotal - counterSubtotal;

  // 2. Restaurant-funded offer listed on this channel.
  const { offer: restaurantOffer, discount: restaurantDiscount } = bestRestaurantOffer(
    ctx.restaurant,
    channel,
    menuSubtotal,
  );
  const foodValue = menuSubtotal - restaurantDiscount;

  // 3. Fees. Containers are still needed for takeaway, so packaging survives
  //    pickup; the handling fee does not, because there is no platform.
  const packaging = round(packagingBase * channel.packagingMultiplier) + channel.handlingFee;
  const platformFee = channel.platformFee;

  // 4. Delivery — zero in pickup mode by definition, then the member waiver.
  const distanceKm = ctx.distanceKmOverride ?? ctx.restaurant.distanceKm;
  const deliveryBeforeWaiver = pickup ? 0 : deliveryFee(channel, distanceKm, ctx.peak);
  const membership = channel.membership;
  const memberActive = Boolean(membership) && ctx.memberships[channel.id];
  const deliveryWaived =
    !pickup &&
    memberActive &&
    membership !== null &&
    menuSubtotal >= membership.freeDeliveryMinOrder &&
    distanceKm <= membership.freeDeliveryMaxKm;
  const delivery = deliveryWaived ? 0 : deliveryBeforeWaiver;

  if (!pickup && memberActive && membership && !deliveryWaived) {
    notes.push(
      distanceKm > membership.freeDeliveryMaxKm
        ? `${membership.name} free delivery stops at ${membership.freeDeliveryMaxKm} km — this kitchen is ${distanceKm} km out.`
        : `${membership.name} free delivery needs a ₹${membership.freeDeliveryMinOrder} cart.`,
    );
  }

  // 5. GST: 5% on food, 18% on fees. Two rates on one bill is why a cheaper
  //    basket can still lose at checkout.
  const taxes = round(foodValue * GST_ON_FOOD) + round((packaging + platformFee + delivery) * GST_ON_FEES);

  // 6. Member discount vs coupon — they do not stack on Swiggy or Zomato.
  const rawMemberDiscount =
    memberActive && membership && ctx.restaurant.memberPartner.includes(channel.id)
      ? capped(foodValue, membership.discountPercent, membership.discountCap)
      : 0;
  const { coupon: candidateCoupon, discount: rawCouponDiscount } = ctx.usePromos
    ? bestCoupon(channel, foodValue)
    : { coupon: undefined, discount: 0 };

  let memberDiscount = rawMemberDiscount;
  let couponDiscount = rawCouponDiscount;
  let appliedCoupon = candidateCoupon;
  let promoRunnerUp: string | undefined;

  if (!channel.stackMemberWithCoupon && rawMemberDiscount > 0 && rawCouponDiscount > 0) {
    if (rawMemberDiscount >= rawCouponDiscount) {
      couponDiscount = 0;
      promoRunnerUp = `${candidateCoupon?.code} (₹${rawCouponDiscount}) — cannot stack with ${membership?.name}`;
      appliedCoupon = undefined;
    } else {
      memberDiscount = 0;
      promoRunnerUp = `${membership?.name} discount (₹${rawMemberDiscount}) — cannot stack with a coupon`;
    }
  }

  const promoKind: PromoKind =
    memberDiscount > 0 && couponDiscount > 0
      ? "both"
      : memberDiscount > 0
        ? "member"
        : couponDiscount > 0
          ? "coupon"
          : "none";

  // 7. Card offers apply to the payable amount and stack on top of everything.
  const payableBeforeBank =
    foodValue + packaging + platformFee + delivery + taxes - memberDiscount - couponDiscount;
  const { offer: appliedBank, discount: bankDiscount } = bestBankOffer(
    channel,
    ctx.banks,
    Math.max(0, payableBeforeBank),
  );

  if (channel.id === "pickup") {
    notes.push(
      pickup
        ? "No commission inside the price, no platform fee, no rider. You collect it yourself."
        : "Shown for comparison — switch to Self-pickup to see this as your total.",
    );
  } else if (pickup) {
    notes.push(
      "App takeaway still pays the app's marked-up menu price — only the counter avoids the commission.",
    );
  }

  return {
    channel,
    available: true,
    counterSubtotal,
    menuSubtotal,
    commissionComponent,
    restaurantOffer,
    restaurantDiscount,
    packaging,
    platformFee,
    deliveryBeforeWaiver,
    delivery,
    deliveryWaived,
    taxes,
    memberDiscount,
    couponDiscount,
    appliedCoupon,
    promoKind,
    promoRunnerUp,
    bankDiscount,
    appliedBank,
    total: Math.max(0, round(payableBeforeBank - bankDiscount)),
    notes,
  };
}

export function quoteAll(ctx: QuoteContext): Quote[] {
  return CHANNELS.map((channel) => quoteFor(channel, ctx));
}
