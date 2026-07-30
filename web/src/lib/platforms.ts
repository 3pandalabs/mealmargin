import type { BankId, Platform, PlatformId } from "./types";

// The three channels, and the fee structures that make them differ.
//
// Sourcing note, because these numbers are the whole product: they are modelled
// from what the apps publicly charge as of mid-2026 — roughly 25-30% restaurant
// commission on Swiggy/Zomato against 3-5% on the ONDC network, a platform fee
// in the ₹15-₹18 range, 5% GST on food and 18% GST on the fees. They are
// deliberately *representative rather than live*: nothing here is scraped, and
// a real checkout will differ by a few rupees. The relationships between the
// columns are the point, not the absolute totals.

export const PLATFORMS: Platform[] = [
  {
    id: "swiggy",
    name: "Swiggy",
    channel: "Swiggy app",
    blurb: "Deepest restaurant catalogue and the fastest fleet, paid for by the highest commission of the three.",
    color: "#fc8019",
    tint: "rgba(252, 128, 25, 0.12)",
    commission: 0.28,
    platformFee: 15,
    handlingFee: 6,
    packagingMultiplier: 1,
    delivery: { baseFare: 29, includedKm: 2, perKm: 9, cap: 95 },
    surge: { deliveryMultiplier: 1.6, extraFee: 20 },
    membership: {
      id: "swiggy-one",
      name: "Swiggy One",
      freeDeliveryMinOrder: 199,
      freeDeliveryMaxKm: 7,
      discountPercent: 10,
      discountCap: 50,
      monthlyCost: 99,
    },
    stackMemberWithCoupon: false,
  },
  {
    id: "zomato",
    name: "Zomato",
    channel: "Zomato app",
    blurb: "Slightly lower commission than Swiggy, a higher platform fee, and the most aggressive coupon engine.",
    color: "#e23744",
    tint: "rgba(226, 55, 68, 0.12)",
    commission: 0.26,
    platformFee: 18,
    handlingFee: 5,
    packagingMultiplier: 1.1,
    delivery: { baseFare: 27, includedKm: 2, perKm: 10, cap: 99 },
    surge: { deliveryMultiplier: 1.55, extraFee: 22 },
    membership: {
      id: "zomato-gold",
      name: "Zomato Gold",
      freeDeliveryMinOrder: 199,
      freeDeliveryMaxKm: 7,
      discountPercent: 10,
      discountCap: 100,
      monthlyCost: 129,
    },
    stackMemberWithCoupon: false,
  },
  {
    id: "ondc",
    name: "ONDC",
    channel: "Paytm / Magicpin",
    blurb: "An open network, not an app: restaurants pay 3-5% instead of ~28%, so menu prices are close to dine-in. Nobody subsidises the rider, though.",
    color: "#1d4ed8",
    tint: "rgba(29, 78, 216, 0.12)",
    commission: 0.04,
    platformFee: 0,
    handlingFee: 0,
    packagingMultiplier: 1,
    // No captive fleet to subsidise, so the logistics quote is passed through
    // close to cost: cheaper food, dearer delivery. This is the trade-off the
    // whole comparison turns on.
    delivery: { baseFare: 35, includedKm: 2, perKm: 12, cap: 120 },
    // Third-party logistics reprice less aggressively than an in-house fleet.
    surge: { deliveryMultiplier: 1.35, extraFee: 10 },
    membership: null,
    stackMemberWithCoupon: true,
  },
];

export const PLATFORM_BY_ID: Record<PlatformId, Platform> = PLATFORMS.reduce(
  (acc, platform) => {
    acc[platform.id] = platform;
    return acc;
  },
  {} as Record<PlatformId, Platform>,
);

export const GST_ON_FOOD = 0.05;
export const GST_ON_FEES = 0.18;

export const BANKS: { id: BankId; name: string; short: string }[] = [
  { id: "hdfc", name: "HDFC Bank Credit Card", short: "HDFC" },
  { id: "icici", name: "ICICI Bank Credit Card", short: "ICICI" },
  { id: "sbi", name: "SBI Card", short: "SBI" },
  { id: "amazonpay", name: "Amazon Pay Balance / ICICI AmazonPay", short: "Amazon Pay" },
  { id: "onecard", name: "OneCard", short: "OneCard" },
];
