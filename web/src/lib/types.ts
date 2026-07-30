// Shared domain types for the whole app.
//
// Everything here describes a *simulation*. There is no API and no scraping:
// the numbers in src/lib/platforms.ts and src/lib/restaurants.ts are
// hand-modelled from publicly reported fee structures (see the comments there),
// and the engine in src/lib/pricing.ts is a pure function over them. That means
// every figure the UI shows can be traced back to a constant in this folder.

export type PlatformId = "swiggy" | "zomato" | "ondc";

export type DietMode = "all" | "veg" | "vegan";

export type BankId = "hdfc" | "icici" | "sbi" | "amazonpay" | "onecard";

export interface DeliveryModel {
  /** Flat fare covering everything up to `includedKm`. */
  baseFare: number;
  includedKm: number;
  /** Charged per kilometre beyond `includedKm`. */
  perKm: number;
  /** Riders' fees are capped in practice; beyond this the app eats the rest. */
  cap: number;
}

export interface SurgeModel {
  /** Peak/rain multiplier applied to the distance-derived fare. */
  deliveryMultiplier: number;
  /** Flat "high demand" surcharge stacked on top. */
  extraFee: number;
}

export interface Membership {
  id: string;
  name: string;
  /** Free delivery only kicks in above this cart value… */
  freeDeliveryMinOrder: number;
  /** …and only within this radius. */
  freeDeliveryMaxKm: number;
  /** Member-only discount on the food line, at participating restaurants. */
  discountPercent: number;
  discountCap: number;
  monthlyCost: number;
}

export interface Platform {
  id: PlatformId;
  name: string;
  /** What the user is actually ordering through, e.g. "Paytm / Magicpin". */
  channel: string;
  blurb: string;
  /** Hex used for the column accent. Kept out of Tailwind classes so the three
   *  brand colours stay in one place instead of scattered through markup. */
  color: string;
  /** Same hue at low alpha, for column tints and chips. */
  tint: string;
  /** Commission the platform adds on top of the restaurant's own price. This is
   *  the single biggest driver of the difference between the columns. */
  commission: number;
  platformFee: number;
  /** Charged once per order, on top of the restaurant's packaging cost. */
  handlingFee: number;
  /** Platforms let restaurants set packaging fees, but clamp them differently. */
  packagingMultiplier: number;
  delivery: DeliveryModel;
  surge: SurgeModel;
  membership: Membership | null;
  /** Whether a member discount and a coupon can both apply to one order. On
   *  Swiggy and Zomato they cannot — the engine takes whichever is worth more. */
  stackMemberWithCoupon: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  /** The restaurant's own price, before any platform commission. */
  basePrice: number;
  veg: boolean;
  /** Vegan is a strict subset of veg — no paneer, ghee, curd, cheese, cream. */
  vegan: boolean;
  category: string;
  /** Restaurant-set packaging cost per unit, before the platform's multiplier. */
  packagingCost: number;
  popular?: boolean;
}

export interface RestaurantOffer {
  platform: PlatformId;
  label: string;
  percent: number;
  cap: number;
  minOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisines: string[];
  city: string;
  area: string;
  pureVeg: boolean;
  rating: number;
  prepMinutes: number;
  /** Not every kitchen is on every network — the ONDC catalogue is thinner. */
  listedOn: PlatformId[];
  /** Deviation from the platform's headline commission, in percentage points of
   *  markup. A chain with negotiating power pays less than a single outlet. */
  markupAdjustment: Partial<Record<PlatformId, number>>;
  /** Platforms where this restaurant participates in the membership programme. */
  memberPartner: PlatformId[];
  offers: RestaurantOffer[];
  items: MenuItem[];
}

export interface Coupon {
  code: string;
  platform: PlatformId;
  label: string;
  percent: number;
  cap: number;
  minOrder: number;
  /** Shown as a caveat in the UI; still applied, since the user knows whether
   *  they qualify better than we do. */
  caveat?: string;
}

export interface BankOffer {
  id: string;
  bank: BankId;
  platform: PlatformId;
  label: string;
  /** Percent-of-payable offers use `percent` + `cap`; flat ones use `amount`. */
  percent?: number;
  cap?: number;
  amount?: number;
  minOrder: number;
}

export interface CartLine {
  itemId: string;
  quantity: number;
}
