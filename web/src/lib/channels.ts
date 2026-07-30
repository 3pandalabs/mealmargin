import type { BankId, Channel, ChannelId } from "./types";

// The four ways to buy the same meal, and the fee structures that make them
// differ.
//
// Sourcing note, because these numbers are the whole product: they are modelled
// from what the apps publicly charge as of mid-2026 — roughly 25-30% restaurant
// commission on Swiggy/Zomato against 3-5% on the ONDC network and **zero at
// the counter**, a platform fee in the ₹12-₹18 range, 5% GST on food and 18% on
// the fees. They are representative rather than live: nothing is scraped, and a
// real checkout will differ by a few rupees. The relationships between the
// columns are the point.
//
// The fourth channel is the one that changes the answer. Walking in pays the
// kitchen's own price, with no commission inside it, no platform fee and no
// rider — which on a ₹500 order is routinely ₹150-250, more than any coupon in
// offers.ts can produce.

export const CHANNELS: Channel[] = [
  {
    id: "swiggy",
    name: "Swiggy",
    channel: "Swiggy app",
    blurb: "Deepest catalogue and the fastest fleet, paid for by the highest commission of the four.",
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
    supportsDelivery: true,
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
    supportsDelivery: true,
  },
  {
    id: "ondc",
    name: "ONDC",
    channel: "Paytm / Magicpin",
    blurb: "An open network, not an app: kitchens pay 3-5% instead of ~28%, so menu prices sit close to the counter. Nobody subsidises the rider, though.",
    color: "#1d4ed8",
    tint: "rgba(29, 78, 216, 0.12)",
    commission: 0.04,
    platformFee: 0,
    handlingFee: 0,
    packagingMultiplier: 1,
    // No captive fleet to subsidise, so the logistics quote passes through near
    // cost: cheaper food, dearer delivery.
    delivery: { baseFare: 35, includedKm: 2, perKm: 12, cap: 120 },
    surge: { deliveryMultiplier: 1.35, extraFee: 10 },
    membership: null,
    stackMemberWithCoupon: true,
    supportsDelivery: true,
  },
  {
    id: "pickup",
    name: "Direct pickup",
    channel: "At the restaurant counter",
    blurb: "The kitchen's own price, with nothing added: no commission inside the menu price, no platform fee, no rider. You pay with your time instead.",
    color: "#0f8a3d",
    tint: "rgba(15, 138, 61, 0.12)",
    // The whole point. A counter price is the price.
    commission: 0,
    platformFee: 0,
    handlingFee: 0,
    // Takeaway still needs containers — this is not free, and pretending it
    // were would overstate the saving the app exists to measure.
    packagingMultiplier: 1,
    delivery: { baseFare: 0, includedKm: 0, perKm: 0, cap: 0 },
    surge: { deliveryMultiplier: 1, extraFee: 0 },
    membership: null,
    stackMemberWithCoupon: true,
    supportsDelivery: false,
  },
];

export const CHANNEL_BY_ID: Record<ChannelId, Channel> = CHANNELS.reduce(
  (acc, channel) => {
    acc[channel.id] = channel;
    return acc;
  },
  {} as Record<ChannelId, Channel>,
);

export const GST_ON_FOOD = 0.05;
export const GST_ON_FEES = 0.18;

export const BANKS: { id: BankId; name: string; short: string }[] = [
  { id: "hdfc", name: "HDFC Bank Credit Card", short: "HDFC" },
  { id: "icici", name: "ICICI Bank Credit Card", short: "ICICI" },
  { id: "sbi", name: "SBI Card", short: "SBI" },
  { id: "amazonpay", name: "Amazon Pay / ICICI AmazonPay", short: "Amazon Pay" },
  { id: "onecard", name: "OneCard", short: "OneCard" },
];

/**
 * Walking pace for the "is it worth the walk?" line on each restaurant.
 * 12 min/km is an unhurried real-world pace including crossings — deliberately
 * not the 5 min/km a mapping API quotes for empty pavement, because the number
 * exists to help someone decide, not to flatter the saving.
 */
export const WALK_MINUTES_PER_KM = 12;
/** Includes parking and the crawl at either end, so short drives look honest. */
export const DRIVE_MINUTES_PER_KM = 4;
