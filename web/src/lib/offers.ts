import type { BankOffer, Coupon } from "./types";

// Promo codes, in the shape the auto-matcher consumes. Percent-off-capped is
// how essentially every Indian food coupon is written, so `percent` + `cap` +
// `minOrder` covers the field; a flat-off coupon is just percent 100 with a
// small cap, which is not worth a second code path.
//
// A coupon and a membership discount do NOT stack on Swiggy or Zomato (see
// `stackMemberWithCoupon` in platforms.ts). The engine applies whichever is
// worth more and says so, which is the single most common way people overpay:
// paying ₹99/month for a pass and then still reaching for a coupon that would
// have been better on its own.

export const COUPONS: Coupon[] = [
  {
    code: "SWIGGYIT",
    platform: "swiggy",
    label: "50% off up to ₹100",
    percent: 50,
    cap: 100,
    minOrder: 149,
  },
  {
    code: "TRYNEW",
    platform: "swiggy",
    label: "40% off up to ₹80 on first order from a new restaurant",
    percent: 40,
    cap: 80,
    minOrder: 199,
    caveat: "Restaurant must be one you have not ordered from before",
  },
  {
    code: "PARTY",
    platform: "swiggy",
    label: "20% off up to ₹150 on large orders",
    percent: 20,
    cap: 150,
    minOrder: 749,
  },
  {
    code: "ZOMATOSTEAL",
    platform: "zomato",
    label: "60% off up to ₹120",
    percent: 60,
    cap: 120,
    minOrder: 199,
  },
  {
    code: "EATBIG",
    platform: "zomato",
    label: "25% off up to ₹200 on large orders",
    percent: 25,
    cap: 200,
    minOrder: 699,
  },
  {
    code: "WELCOME50",
    platform: "zomato",
    label: "50% off up to ₹100",
    percent: 50,
    cap: 100,
    minOrder: 149,
    caveat: "First order on the account",
  },
  {
    code: "ONDCFOOD",
    platform: "ondc",
    label: "₹75 off (100% up to ₹75)",
    percent: 100,
    cap: 75,
    minOrder: 249,
  },
  {
    code: "MAGICSAVE",
    platform: "ondc",
    label: "15% off up to ₹60",
    percent: 15,
    cap: 60,
    minOrder: 149,
  },
];

// Bank/wallet offers apply to the amount actually payable at checkout, and DO
// stack on top of a coupon — that is the whole trick behind "net effective
// price". Minimums here are on the payable amount, not the food line.
export const BANK_OFFERS: BankOffer[] = [
  {
    id: "hdfc-swiggy",
    bank: "hdfc",
    platform: "swiggy",
    label: "₹100 off on HDFC credit cards",
    amount: 100,
    minOrder: 399,
  },
  {
    id: "hdfc-zomato",
    bank: "hdfc",
    platform: "zomato",
    label: "10% off up to ₹75 on HDFC credit cards",
    percent: 10,
    cap: 75,
    minOrder: 299,
  },
  {
    id: "icici-zomato",
    bank: "icici",
    platform: "zomato",
    label: "15% off up to ₹150 on ICICI credit cards",
    percent: 15,
    cap: 150,
    minOrder: 499,
  },
  {
    id: "icici-swiggy",
    bank: "icici",
    platform: "swiggy",
    label: "10% off up to ₹60 on ICICI credit cards",
    percent: 10,
    cap: 60,
    minOrder: 249,
  },
  {
    id: "sbi-swiggy",
    bank: "sbi",
    platform: "swiggy",
    label: "₹75 off on SBI Card",
    amount: 75,
    minOrder: 349,
  },
  {
    id: "sbi-ondc",
    bank: "sbi",
    platform: "ondc",
    label: "5% cashback up to ₹50 on SBI Card",
    percent: 5,
    cap: 50,
    minOrder: 199,
  },
  {
    id: "amazonpay-ondc",
    bank: "amazonpay",
    platform: "ondc",
    label: "₹80 cashback on Amazon Pay",
    amount: 80,
    minOrder: 249,
  },
  {
    id: "amazonpay-zomato",
    bank: "amazonpay",
    platform: "zomato",
    label: "₹50 cashback on Amazon Pay",
    amount: 50,
    minOrder: 299,
  },
  {
    id: "onecard-swiggy",
    bank: "onecard",
    platform: "swiggy",
    label: "5% off up to ₹100 on OneCard",
    percent: 5,
    cap: 100,
    minOrder: 199,
  },
  {
    id: "onecard-ondc",
    bank: "onecard",
    platform: "ondc",
    label: "₹60 off on OneCard",
    amount: 60,
    minOrder: 349,
  },
];
