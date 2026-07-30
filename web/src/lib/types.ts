// Shared domain types for the whole app.
//
// Everything here describes a *simulation*. There is no API and no scraping:
// the numbers in channels.ts / dishes.ts / restaurants.ts are hand-modelled
// from publicly reported fee structures, and the engine in pricing.ts is a pure
// function over them. Every figure the UI shows traces back to a constant in
// this folder.
//
// v2 (2026-07-30) turned the model inside out. v1 asked "given this restaurant,
// which app is cheapest?"; v2 asks the question people actually have: "I am
// here, I want this meal — where and how do I buy it for the least money?"
// That means a locality comes first, a dish is a *canonical* thing that many
// kitchens sell, and walking to the counter is a fourth channel rather than an
// afterthought.

export type ChannelId = "swiggy" | "zomato" | "ondc" | "pickup";

/** Delivery brings rider fees and surge; pickup removes them everywhere. */
export type Fulfillment = "delivery" | "pickup";

export type DietMode = "all" | "veg" | "vegan";

export type BankId = "hdfc" | "icici" | "sbi" | "amazonpay" | "onecard";

export interface Locality {
  id: string;
  /** Full display form, e.g. "Dwarka Sector 6, New Delhi". */
  name: string;
  area: string;
  city: string;
}

export interface DeliveryModel {
  baseFare: number;
  includedKm: number;
  perKm: number;
  cap: number;
}

export interface SurgeModel {
  deliveryMultiplier: number;
  extraFee: number;
}

export interface Membership {
  id: string;
  name: string;
  freeDeliveryMinOrder: number;
  freeDeliveryMaxKm: number;
  discountPercent: number;
  discountCap: number;
  monthlyCost: number;
}

export interface Channel {
  id: ChannelId;
  name: string;
  /** What you are actually ordering through, e.g. "Paytm / Magicpin". */
  channel: string;
  blurb: string;
  color: string;
  tint: string;
  /** Markup added on top of the restaurant's counter price. Zero for pickup —
   *  that is the entire reason pickup wins as often as it does. */
  commission: number;
  platformFee: number;
  handlingFee: number;
  packagingMultiplier: number;
  delivery: DeliveryModel;
  surge: SurgeModel;
  membership: Membership | null;
  /** Whether a member discount and a coupon can both apply to one order. */
  stackMemberWithCoupon: boolean;
  /** False for pickup: there is no rider, so no fulfillment choice to make. */
  supportsDelivery: boolean;
}

/**
 * A dish as a *concept*, not as one restaurant's menu line. This is what makes
 * "1 kadhai paneer + 3 tandoori roti" comparable across five kitchens that each
 * spell and price it differently — the hard problem in a meta-aggregator, and
 * the reason v1's free-text item names could not answer this question.
 */
export interface Dish {
  id: string;
  name: string;
  /** Spellings and near-synonyms people actually type or that menus use. */
  aliases: string[];
  description: string;
  category: string;
  veg: boolean;
  vegan: boolean;
  /** Typical counter price at a mid-tier kitchen — each restaurant scales or
   *  overrides this. Never shown directly; it is the anchor, not a price. */
  counterPrice: number;
  /** Per-unit container cost, before the channel's packaging multiplier. */
  packagingCost: number;
  popular?: boolean;
}

/** One restaurant's listing of one canonical dish. */
export interface MenuEntry {
  dishId: string;
  /** Set when this kitchen's price genuinely departs from its tier — a
   *  speciality it is known for, or a loss-leader. */
  priceOverride?: number;
  /** Set when this kitchen packs the dish unusually (clay handi, steel tin). */
  packagingOverride?: number;
}

export interface RestaurantOffer {
  channel: ChannelId;
  label: string;
  percent: number;
  cap: number;
  minOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  localityId: string;
  tagline: string;
  cuisines: string[];
  pureVeg: boolean;
  rating: number;
  prepMinutes: number;
  /** Distance from the locality centre — drives both the delivery fare and
   *  whether pickup is a realistic suggestion. */
  distanceKm: number;
  /** Multiplier on each dish's canonical counter price. A value dhaba sits
   *  below 1, a hotel restaurant well above it. */
  priceTier: number;
  /** Which channels list this kitchen. `pickup` is always available — you can
   *  always walk in — which is exactly why it is the reliable fallback. */
  listedOn: ChannelId[];
  /** Deviation from the channel's headline commission. Chains negotiate down. */
  markupAdjustment: Partial<Record<ChannelId, number>>;
  memberPartner: ChannelId[];
  offers: RestaurantOffer[];
  menu: MenuEntry[];
}

export interface Coupon {
  code: string;
  channel: ChannelId;
  label: string;
  percent: number;
  cap: number;
  minOrder: number;
  caveat?: string;
}

export interface BankOffer {
  id: string;
  bank: BankId;
  channel: ChannelId;
  label: string;
  percent?: number;
  cap?: number;
  amount?: number;
  minOrder: number;
}

/** A line in the meal the user is building — canonical, not restaurant-bound. */
export interface CartLine {
  dishId: string;
  quantity: number;
}
