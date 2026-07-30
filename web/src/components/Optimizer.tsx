"use client";

import { useEffect, useMemo, useState } from "react";
import { RESTAURANTS } from "@/lib/restaurants";
import { quoteAll, type QuoteContext } from "@/lib/pricing";
import { buildAdvice, crossoverSegments, rank } from "@/lib/recommend";
import { percent, rupees } from "@/lib/format";
import type { BankId, DietMode, PlatformId } from "@/lib/types";
import { AdviceBanner } from "./AdviceBanner";
import { CartPanel } from "./CartPanel";
import { ComparisonGrid } from "./ComparisonGrid";
import { ControlPanel } from "./ControlPanel";
import { CrossoverBar } from "./CrossoverBar";
import { MenuPanel } from "./MenuPanel";
import { SearchPanel } from "./SearchPanel";
import { Card } from "./ui/Card";

// The single stateful component. Everything below it is presentational, and
// everything it computes comes from the pure functions in src/lib — so the
// interesting logic stays testable without rendering anything.

const PREFS_KEY = "mealmargin.prefs.v1";

const NO_MEMBERSHIPS: Record<PlatformId, boolean> = {
  swiggy: false,
  zomato: false,
  ondc: false,
};

// A seeded cart, so the first thing a visitor sees is a filled-in comparison
// rather than three empty columns and a dead end.
const SEED_RESTAURANT = "annapurna";
const SEED_CART: Record<string, number> = {
  "annapurna-paneer-butter-masala": 1,
  "annapurna-tandoori-roti": 2,
  "annapurna-jeera-rice": 1,
};

interface Prefs {
  diet: DietMode;
  distanceKm: number;
  peak: boolean;
  memberships: Record<PlatformId, boolean>;
  banks: BankId[];
}

const DEFAULT_PREFS: Prefs = {
  diet: "all",
  distanceKm: 4,
  peak: false,
  memberships: NO_MEMBERSHIPS,
  banks: [],
};

export function Optimizer() {
  const [query, setQuery] = useState("");
  const [restaurantId, setRestaurantId] = useState(SEED_RESTAURANT);
  const [cart, setCart] = useState<Record<string, number>>(SEED_CART);
  // One object rather than five pieces of state: they are saved, restored and
  // read as a unit, and restoring them individually meant five setState calls
  // in one effect.
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const { diet, distanceKm, peak, memberships, banks } = prefs;

  const patchPrefs = (patch: Partial<Prefs>) =>
    setPrefs((previous) => ({ ...previous, ...patch }));

  // Preferences persist; the cart deliberately does not. Restoring after mount
  // rather than during render keeps the server-rendered markup and the first
  // client render identical, which is what avoids a hydration mismatch — so
  // this setState in an effect is the point, not an oversight.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PREFS_KEY);
      if (!stored) return;
      const saved = JSON.parse(stored) as Partial<Prefs>;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      setPrefs({
        diet: saved.diet ?? DEFAULT_PREFS.diet,
        distanceKm:
          typeof saved.distanceKm === "number" ? saved.distanceKm : DEFAULT_PREFS.distanceKm,
        peak: typeof saved.peak === "boolean" ? saved.peak : DEFAULT_PREFS.peak,
        memberships: { ...NO_MEMBERSHIPS, ...saved.memberships },
        banks: Array.isArray(saved.banks) ? saved.banks : [],
      });
    } catch {
      // A corrupt or unreadable preferences blob is not worth surfacing —
      // the defaults are perfectly usable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Private-mode storage failures are not worth interrupting anyone over.
    }
  }, [prefs]);

  const restaurant = useMemo(
    () => RESTAURANTS.find((r) => r.id === restaurantId) ?? RESTAURANTS[0],
    [restaurantId],
  );

  const matchesDiet = useMemo(
    () => (veg: boolean, vegan: boolean) => (diet === "vegan" ? vegan : diet === "veg" ? veg : true),
    [diet],
  );

  const filteredRestaurants = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return RESTAURANTS.filter((entry) => {
      const dietOk = entry.items.some((item) => matchesDiet(item.veg, item.vegan));
      if (!dietOk) return false;
      if (!needle) return true;
      const haystack = [
        entry.name,
        entry.tagline,
        entry.city,
        entry.area,
        ...entry.cuisines,
        ...entry.items.map((item) => item.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, matchesDiet]);

  const dishMatches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return RESTAURANTS.flatMap((entry) =>
      entry.items
        .filter(
          (item) =>
            matchesDiet(item.veg, item.vegan) &&
            (item.name.toLowerCase().includes(needle) ||
              item.category.toLowerCase().includes(needle)),
        )
        .map((item) => ({ item, restaurant: entry })),
    ).sort((a, b) => a.item.basePrice - b.item.basePrice);
  }, [query, matchesDiet]);

  const lines = useMemo(
    () =>
      restaurant.items
        .map((item) => ({ item, quantity: cart[item.id] ?? 0 }))
        .filter((line) => line.quantity > 0),
    [restaurant, cart],
  );

  const { baseSubtotal, itemCount, packagingBase } = useMemo(
    () =>
      lines.reduce(
        (acc, { item, quantity }) => ({
          baseSubtotal: acc.baseSubtotal + item.basePrice * quantity,
          itemCount: acc.itemCount + quantity,
          packagingBase: acc.packagingBase + item.packagingCost * quantity,
        }),
        { baseSubtotal: 0, itemCount: 0, packagingBase: 0 },
      ),
    [lines],
  );

  const ctx: QuoteContext = useMemo(
    () => ({
      restaurant,
      baseSubtotal,
      itemCount,
      packagingBase,
      distanceKm,
      peak,
      memberships,
      banks,
    }),
    [restaurant, baseSubtotal, itemCount, packagingBase, distanceKm, peak, memberships, banks],
  );

  const ranked = useMemo(() => rank(quoteAll(ctx)), [ctx]);
  const segments = useMemo(() => crossoverSegments(ctx), [ctx]);
  const advice = useMemo(() => buildAdvice(ctx, ranked, segments), [ctx, ranked, segments]);

  const setQuantity = (itemId: string, quantity: number) =>
    setCart((previous) => {
      const next = { ...previous };
      if (quantity <= 0) delete next[itemId];
      else next[itemId] = quantity;
      return next;
    });

  const selectRestaurant = (id: string) => {
    setRestaurantId(id);
    // A cart is scoped to one kitchen — you cannot check out across two.
    setCart({});
  };

  const selectDish = (nextRestaurantId: string, itemId: string) => {
    if (nextRestaurantId !== restaurantId) {
      setRestaurantId(nextRestaurantId);
      setCart({ [itemId]: 1 });
    } else {
      setQuantity(itemId, (cart[itemId] ?? 0) + 1);
    }
  };

  // Switching to veg or vegan drops anything in the cart that no longer
  // qualifies, rather than quietly pricing food the filter says you don't eat.
  const changeDiet = (next: DietMode) => {
    patchPrefs({ diet: next });
    setCart((previous) => {
      const kept: Record<string, number> = {};
      for (const [itemId, quantity] of Object.entries(previous)) {
        const item = restaurant.items.find((entry) => entry.id === itemId);
        if (!item) continue;
        const ok = next === "vegan" ? item.vegan : next === "veg" ? item.veg : true;
        if (ok) kept[itemId] = quantity;
      }
      return kept;
    });
  };

  return (
    <div className="space-y-4">
      <AdviceBanner advice={advice} />

      {itemCount > 0 && ranked.best ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Cheapest checkout" value={rupees(ranked.best.total)} sub={ranked.best.platform.name} />
          <Stat
            label="Spread across apps"
            value={rupees(ranked.spread)}
            sub={`${percent(ranked.spreadPercent, 1)} of the dearest cart`}
          />
          <Stat
            label="Kitchen price"
            value={rupees(baseSubtotal)}
            sub={`${itemCount} item${itemCount === 1 ? "" : "s"} before commission, fees and GST`}
          />
        </div>
      ) : null}

      <ComparisonGrid ranked={ranked} itemCount={itemCount} />

      <CrossoverBar segments={segments} baseSubtotal={baseSubtotal} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <SearchPanel
            query={query}
            onQuery={setQuery}
            restaurants={filteredRestaurants}
            dishMatches={dishMatches}
            selectedId={restaurant.id}
            onSelectRestaurant={selectRestaurant}
            onSelectDish={selectDish}
          />
          <ControlPanel
            diet={diet}
            onDiet={changeDiet}
            distanceKm={distanceKm}
            onDistance={(next) => patchPrefs({ distanceKm: next })}
            peak={peak}
            onPeak={(next) => patchPrefs({ peak: next })}
            memberships={memberships}
            onMembership={(platform, next) =>
              setPrefs((previous) => ({
                ...previous,
                memberships: { ...previous.memberships, [platform]: next },
              }))
            }
            banks={banks}
            onBanks={(next) => patchPrefs({ banks: next })}
          />
        </div>

        <div className="space-y-4">
          <CartPanel
            lines={lines}
            baseSubtotal={baseSubtotal}
            itemCount={itemCount}
            onClear={() => setCart({})}
          />
          <MenuPanel restaurant={restaurant} diet={diet} cart={cart} onQuantity={setQuantity} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </Card>
  );
}
