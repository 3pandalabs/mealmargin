import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,234 — Indian digit grouping, no paise. Every price in this app is whole
 *  rupees, because every real checkout rounds there too. */
export function rupees(value: number): string {
  return inr.format(Math.round(value));
}

export function percent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}
