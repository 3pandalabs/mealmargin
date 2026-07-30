"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALITY_ID, LOCALITY_BY_ID } from "@/lib/localities";
import { compare, type Comparison, type Preferences } from "@/lib/recommend";
import type { BankId, CartLine, ChannelId, DietMode, Fulfillment, Locality } from "@/lib/types";

// One context for the whole comparison, because almost every component needs
// some slice of it and the tree is four levels deep in places — a receipt row
// wants the fulfillment mode, a dish chip wants the cart. Prop-drilling that
// through RestaurantBlock → ChannelReceipt → Row was the alternative.
//
// Everything expensive is a useMemo over the pure engine in src/lib, so a
// keystroke in the dish builder re-prices 25 kitchens × 4 channels and the
// cart-size sweep without a network call or a loading state.

const PREFS_KEY = "mealmargin.prefs.v2";

const NO_MEMBERSHIPS: Record<ChannelId, boolean> = {
  swiggy: false,
  zomato: false,
  ondc: false,
  pickup: false,
};

interface StoredPrefs {
  localityId: string;
  fulfillment: Fulfillment;
  peak: boolean;
  memberships: Record<ChannelId, boolean>;
  banks: BankId[];
  diet: DietMode;
  usePromos: boolean;
}

const DEFAULTS: StoredPrefs = {
  localityId: DEFAULT_LOCALITY_ID,
  fulfillment: "delivery",
  peak: false,
  memberships: NO_MEMBERSHIPS,
  banks: [],
  diet: "all",
  usePromos: true,
};

// A meal, not an empty box: the point of the app is invisible until something
// is priced, and this is the exact combination people describe when they
// explain the problem — one gravy and some bread.
const SEED_CART: CartLine[] = [
  { dishId: "kadhai-paneer", quantity: 1 },
  { dishId: "tandoori-roti", quantity: 3 },
];

interface ComparisonValue {
  locality: Locality;
  localityId: string;
  setLocalityId: (id: string) => void;

  cart: CartLine[];
  quantityOf: (dishId: string) => number;
  setQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;

  fulfillment: Fulfillment;
  setFulfillment: (next: Fulfillment) => void;
  peak: boolean;
  setPeak: (next: boolean) => void;
  memberships: Record<ChannelId, boolean>;
  setMembership: (channel: ChannelId, next: boolean) => void;
  banks: BankId[];
  toggleBank: (bank: BankId) => void;
  diet: DietMode;
  setDiet: (next: DietMode) => void;
  usePromos: boolean;
  setUsePromos: (next: boolean) => void;

  comparison: Comparison;
}

const Ctx = createContext<ComparisonValue | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<StoredPrefs>(DEFAULTS);
  const [cart, setCart] = useState<CartLine[]>(SEED_CART);

  // Restore after mount rather than during render: the server and the first
  // client render must produce identical markup, or React throws a hydration
  // mismatch. This setState in an effect is the point, not an oversight.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PREFS_KEY);
      if (!stored) return;
      const saved = JSON.parse(stored) as Partial<StoredPrefs>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      setPrefs({
        localityId: LOCALITY_BY_ID.has(saved.localityId ?? "")
          ? (saved.localityId as string)
          : DEFAULTS.localityId,
        fulfillment: saved.fulfillment === "pickup" ? "pickup" : "delivery",
        peak: typeof saved.peak === "boolean" ? saved.peak : DEFAULTS.peak,
        memberships: { ...NO_MEMBERSHIPS, ...saved.memberships },
        banks: Array.isArray(saved.banks) ? saved.banks : [],
        diet: saved.diet ?? DEFAULTS.diet,
        usePromos: typeof saved.usePromos === "boolean" ? saved.usePromos : DEFAULTS.usePromos,
      });
    } catch {
      // A corrupt preferences blob is not worth surfacing — defaults work.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Private-mode storage failures are not worth interrupting anyone over.
    }
  }, [prefs]);

  const patch = useCallback(
    (next: Partial<StoredPrefs>) => setPrefs((previous) => ({ ...previous, ...next })),
    [],
  );

  const setQuantity = useCallback((dishId: string, quantity: number) => {
    setCart((previous) => {
      if (quantity <= 0) return previous.filter((line) => line.dishId !== dishId);
      const existing = previous.find((line) => line.dishId === dishId);
      if (!existing) return [...previous, { dishId, quantity }];
      return previous.map((line) => (line.dishId === dishId ? { ...line, quantity } : line));
    });
  }, []);

  const enginePrefs: Preferences = useMemo(
    () => ({
      fulfillment: prefs.fulfillment,
      peak: prefs.peak,
      memberships: prefs.memberships,
      banks: prefs.banks,
      usePromos: prefs.usePromos,
    }),
    [prefs.fulfillment, prefs.peak, prefs.memberships, prefs.banks, prefs.usePromos],
  );

  const comparison = useMemo(
    () => compare(prefs.localityId, cart, enginePrefs),
    [prefs.localityId, cart, enginePrefs],
  );

  const value: ComparisonValue = useMemo(
    () => ({
      locality: LOCALITY_BY_ID.get(prefs.localityId) ?? LOCALITY_BY_ID.get(DEFAULT_LOCALITY_ID)!,
      localityId: prefs.localityId,
      setLocalityId: (id) => patch({ localityId: id }),

      cart,
      quantityOf: (dishId) => cart.find((line) => line.dishId === dishId)?.quantity ?? 0,
      setQuantity,
      clearCart: () => setCart([]),

      fulfillment: prefs.fulfillment,
      setFulfillment: (next) => patch({ fulfillment: next }),
      peak: prefs.peak,
      setPeak: (next) => patch({ peak: next }),
      memberships: prefs.memberships,
      setMembership: (channel, next) =>
        setPrefs((previous) => ({
          ...previous,
          memberships: { ...previous.memberships, [channel]: next },
        })),
      banks: prefs.banks,
      toggleBank: (bank) =>
        setPrefs((previous) => ({
          ...previous,
          banks: previous.banks.includes(bank)
            ? previous.banks.filter((entry) => entry !== bank)
            : [...previous.banks, bank],
        })),
      diet: prefs.diet,
      setDiet: (next) => patch({ diet: next }),
      usePromos: prefs.usePromos,
      setUsePromos: (next) => patch({ usePromos: next }),

      comparison,
    }),
    [prefs, cart, comparison, patch, setQuantity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useComparison(): ComparisonValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useComparison must be used inside <ComparisonProvider>");
  return value;
}
