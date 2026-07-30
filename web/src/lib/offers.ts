import type { BankOffer, Coupon } from "./types";

// Promo codes, in the shape the auto-matcher consumes. Percent-off-capped is
// how essentially every Indian food coupon is written, so `percent` + `cap` +
// `minOrder` covers the field.
//
// **There are no coupons on the pickup channel, and that is not an oversight.**
// Platform promo codes exist to move orders onto a platform; a counter has no
// reason to issue one. Pickup wins on structure — no commission, no platform
// fee, no rider — not on discounts, and letting it borrow a coupon it could
// never actually use would flatter it.
//
// A coupon and a membership discount do NOT stack on Swiggy or Zomato (see
// `stackMemberWithCoupon` in channels.ts). The engine applies whichever is
// worth more and says so, which is the most common way people overpay: paying
// ₹99/month for a pass and then still reaching for a coupon that would have
// been better alone.

export const COUPONS: Coupon[] = [
  {
    code: "SWIGGYIT",
    channel: "swiggy",
    label: "50% off up to ₹100",
    percent: 50,
    cap: 100,
    minOrder: 149,
  },
  {
    code: "TRYNEW",
    channel: "swiggy",
    label: "40% off up to ₹80 at a restaurant you haven't tried",
    percent: 40,
    cap: 80,
    minOrder: 199,
    caveat: "Restaurant must be one you have not ordered from before",
  },
  {
    code: "PARTY",
    channel: "swiggy",
    label: "20% off up to ₹150 on large orders",
    percent: 20,
    cap: 150,
    minOrder: 749,
  },
  {
    code: "ZOMATOSTEAL",
    channel: "zomato",
    label: "60% off up to ₹120",
    percent: 60,
    cap: 120,
    minOrder: 199,
  },
  {
    code: "EATBIG",
    channel: "zomato",
    label: "25% off up to ₹200 on large orders",
    percent: 25,
    cap: 200,
    minOrder: 699,
  },
  {
    code: "WELCOME50",
    channel: "zomato",
    label: "50% off up to ₹100",
    percent: 50,
    cap: 100,
    minOrder: 149,
    caveat: "First order on the account",
  },
  {
    code: "ONDCFOOD",
    channel: "ondc",
    label: "₹75 off (100% up to ₹75)",
    percent: 100,
    cap: 75,
    minOrder: 249,
  },
  {
    code: "MAGICSAVE",
    channel: "ondc",
    label: "15% off up to ₹60",
    percent: 15,
    cap: 60,
    minOrder: 149,
  },
];

// Bank and wallet offers apply to the amount actually payable and DO stack on
// top of a coupon — that is the trick behind "net effective price". Minimums
// here are on the payable amount, not the food line.
//
// The two `pickup` entries are card *dining* offers, which are a real thing at
// the counter and rarer than app offers. Including them keeps the comparison
// fair in both directions: pickup should not win because the model forgot that
// a card can save you money there too.
export const BANK_OFFERS: BankOffer[] = [
  {
    id: "hdfc-swiggy",
    bank: "hdfc",
    channel: "swiggy",
    label: "₹100 off on HDFC credit cards",
    amount: 100,
    minOrder: 399,
  },
  {
    id: "hdfc-zomato",
    bank: "hdfc",
    channel: "zomato",
    label: "10% off up to ₹75 on HDFC credit cards",
    percent: 10,
    cap: 75,
    minOrder: 299,
  },
  {
    id: "hdfc-pickup",
    bank: "hdfc",
    channel: "pickup",
    label: "10% dining discount up to ₹100 on HDFC credit cards",
    percent: 10,
    cap: 100,
    minOrder: 499,
  },
  {
    id: "icici-zomato",
    bank: "icici",
    channel: "zomato",
    label: "15% off up to ₹150 on ICICI credit cards",
    percent: 15,
    cap: 150,
    minOrder: 499,
  },
  {
    id: "icici-swiggy",
    bank: "icici",
    channel: "swiggy",
    label: "10% off up to ₹60 on ICICI credit cards",
    percent: 10,
    cap: 60,
    minOrder: 249,
  },
  {
    id: "sbi-swiggy",
    bank: "sbi",
    channel: "swiggy",
    label: "₹75 off on SBI Card",
    amount: 75,
    minOrder: 349,
  },
  {
    id: "sbi-ondc",
    bank: "sbi",
    channel: "ondc",
    label: "5% cashback up to ₹50 on SBI Card",
    percent: 5,
    cap: 50,
    minOrder: 199,
  },
  {
    id: "sbi-pickup",
    bank: "sbi",
    channel: "pickup",
    label: "5% dining cashback up to ₹60 on SBI Card",
    percent: 5,
    cap: 60,
    minOrder: 399,
  },
  {
    id: "amazonpay-ondc",
    bank: "amazonpay",
    channel: "ondc",
    label: "₹80 cashback on Amazon Pay",
    amount: 80,
    minOrder: 249,
  },
  {
    id: "amazonpay-zomato",
    bank: "amazonpay",
    channel: "zomato",
    label: "₹50 cashback on Amazon Pay",
    amount: 50,
    minOrder: 299,
  },
  {
    id: "onecard-swiggy",
    bank: "onecard",
    channel: "swiggy",
    label: "5% off up to ₹100 on OneCard",
    percent: 5,
    cap: 100,
    minOrder: 199,
  },
  {
    id: "onecard-ondc",
    bank: "onecard",
    channel: "ondc",
    label: "₹60 off on OneCard",
    amount: 60,
    minOrder: 349,
  },
];
