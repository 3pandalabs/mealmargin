import { BANK_OFFERS, COUPONS } from "./offers";
import { GST_ON_FEES, GST_ON_FOOD, PLATFORMS } from "./platforms";
import type {
  BankId,
  BankOffer,
  Coupon,
  Platform,
  PlatformId,
  Restaurant,
  RestaurantOffer,
} from "./types";

// The whole engine. Pure functions, no I/O, no React — so the same code backs
// the comparison grid, the "what if the cart were smaller" sweep, and anything
// that wants to test it.
//
// Deliberately parameterised by `baseSubtotal` + `itemCount` rather than by the
// cart itself: that is what makes the crossover sweep in recommend.ts cheap,
// since it can slide the cart value without inventing fake line items.

export interface QuoteContext {
  restaurant: Restaurant;
  /** Sum of the restaurant's own prices × quantity, before any commission. */
  baseSubtotal: number;
  itemCount: number;
  /** Sum of the restaurant's own packaging cost × quantity. */
  packagingBase: number;
  distanceKm: number;
  peak: boolean;
  memberships: Record<PlatformId, boolean>;
  banks: BankId[];
}

export type PromoKind = "member" | "coupon" | "both" | "none";

export interface Quote {
  platform: Platform;
  available: boolean;
  unavailableReason?: string;

  /** Menu price on this platform: the kitchen's price plus its commission. */
  menuSubtotal: number;
  /** How much of the menu price is pure platform commission. */
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
  /** Set when a member discount and a coupon competed and one had to lose. */
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

/** Distance- and surge-derived rider fee, before any membership waiver. */
export function deliveryFee(platform: Platform, distanceKm: number, peak: boolean): number {
  const extraKm = Math.max(0, distanceKm - platform.delivery.includedKm);
  let fee = platform.delivery.baseFare + extraKm * platform.delivery.perKm;
  if (peak) fee = fee * platform.surge.deliveryMultiplier + platform.surge.extraFee;
  return Math.min(round(fee), platform.delivery.cap);
}

function bestRestaurantOffer(
  restaurant: Restaurant,
  platform: Platform,
  foodValue: number,
): { offer?: RestaurantOffer; discount: number } {
  let best: { offer?: RestaurantOffer; discount: number } = { discount: 0 };
  for (const offer of restaurant.offers) {
    if (offer.platform !== platform.id) continue;
    if (foodValue < offer.minOrder) continue;
    const discount = capped(foodValue, offer.percent, offer.cap);
    if (discount > best.discount) best = { offer, discount };
  }
  return best;
}

/** The auto-matcher: every coupon valid on this platform at this cart value. */
export function eligibleCoupons(platform: Platform, foodValue: number): Coupon[] {
  return COUPONS.filter((coupon) => coupon.platform === platform.id && foodValue >= coupon.minOrder)
    .map((coupon) => ({ coupon, discount: capped(foodValue, coupon.percent, coupon.cap) }))
    .sort((a, b) => b.discount - a.discount)
    .map((entry) => entry.coupon);
}

function bestCoupon(
  platform: Platform,
  foodValue: number,
): { coupon?: Coupon; discount: number } {
  let best: { coupon?: Coupon; discount: number } = { discount: 0 };
  for (const coupon of COUPONS) {
    if (coupon.platform !== platform.id) continue;
    if (foodValue < coupon.minOrder) continue;
    const discount = capped(foodValue, coupon.percent, coupon.cap);
    if (discount > best.discount) best = { coupon, discount };
  }
  return best;
}

function bestBankOffer(
  platform: Platform,
  banks: BankId[],
  payable: number,
): { offer?: BankOffer; discount: number } {
  let best: { offer?: BankOffer; discount: number } = { discount: 0 };
  for (const offer of BANK_OFFERS) {
    if (offer.platform !== platform.id) continue;
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

export function quoteFor(platform: Platform, ctx: QuoteContext): Quote {
  const notes: string[] = [];

  if (!ctx.restaurant.listedOn.includes(platform.id)) {
    return {
      platform,
      available: false,
      unavailableReason: `${ctx.restaurant.name} is not listed on ${platform.name}`,
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
      notes,
    };
  }

  // 1. Menu price = kitchen price + this platform's effective commission.
  const commissionRate = platform.commission + (ctx.restaurant.markupAdjustment[platform.id] ?? 0);
  const menuSubtotal = round(ctx.baseSubtotal * (1 + commissionRate));
  const commissionComponent = menuSubtotal - round(ctx.baseSubtotal);

  // 2. Restaurant-funded offer listed on this platform.
  const { offer: restaurantOffer, discount: restaurantDiscount } = bestRestaurantOffer(
    ctx.restaurant,
    platform,
    menuSubtotal,
  );
  const foodValue = menuSubtotal - restaurantDiscount;

  // 3. Fees. Packaging is restaurant-set but platform-clamped; handling is the
  //    platform's own, and the two appear as one line at checkout.
  const packaging =
    ctx.itemCount > 0
      ? round(ctx.packagingBase * platform.packagingMultiplier) + platform.handlingFee
      : 0;
  const platformFee = ctx.itemCount > 0 ? platform.platformFee : 0;

  // 4. Delivery, then the membership waiver.
  const deliveryBeforeWaiver = ctx.itemCount > 0 ? deliveryFee(platform, ctx.distanceKm, ctx.peak) : 0;
  const memberActive = Boolean(platform.membership) && ctx.memberships[platform.id];
  const membership = platform.membership;
  const deliveryWaived =
    memberActive &&
    membership !== null &&
    menuSubtotal >= membership.freeDeliveryMinOrder &&
    ctx.distanceKm <= membership.freeDeliveryMaxKm;
  const delivery = deliveryWaived ? 0 : deliveryBeforeWaiver;

  if (memberActive && membership && !deliveryWaived && ctx.itemCount > 0) {
    notes.push(
      ctx.distanceKm > membership.freeDeliveryMaxKm
        ? `${membership.name} free delivery stops at ${membership.freeDeliveryMaxKm} km — this order is ${ctx.distanceKm} km out.`
        : `${membership.name} free delivery needs a ₹${membership.freeDeliveryMinOrder} cart.`,
    );
  }

  // 5. GST: 5% on the food line, 18% on the fees. Two different rates on one
  //    bill is the reason a "cheaper" cart can still lose at checkout.
  const taxes = round(foodValue * GST_ON_FOOD) + round((packaging + platformFee + delivery) * GST_ON_FEES);

  // 6. Member discount vs coupon. On Swiggy and Zomato these do not stack, so
  //    the engine keeps the better one and reports what it dropped.
  const rawMemberDiscount =
    memberActive && membership && ctx.restaurant.memberPartner.includes(platform.id)
      ? capped(foodValue, membership.discountPercent, membership.discountCap)
      : 0;
  const { coupon: candidateCoupon, discount: rawCouponDiscount } = bestCoupon(platform, foodValue);

  let memberDiscount = rawMemberDiscount;
  let couponDiscount = rawCouponDiscount;
  let appliedCoupon = candidateCoupon;
  let promoRunnerUp: string | undefined;

  if (!platform.stackMemberWithCoupon && rawMemberDiscount > 0 && rawCouponDiscount > 0) {
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

  // 7. Bank offers apply to the payable amount and stack on top of everything.
  const payableBeforeBank =
    foodValue + packaging + platformFee + delivery + taxes - memberDiscount - couponDiscount;
  const { offer: appliedBank, discount: bankDiscount } = bestBankOffer(
    platform,
    ctx.banks,
    Math.max(0, payableBeforeBank),
  );

  const total = Math.max(0, round(payableBeforeBank - bankDiscount));

  if (platform.id === "ondc" && ctx.itemCount > 0) {
    notes.push("No membership programme on the network — delivery is never waived, it is only ever cheap food.");
  }

  return {
    platform,
    available: true,
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
    total,
    notes,
  };
}

export function quoteAll(ctx: QuoteContext): Quote[] {
  return PLATFORMS.map((platform) => quoteFor(platform, ctx));
}
