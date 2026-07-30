"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2, X } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { DISHES, DISH_BY_ID, matchDishes } from "@/lib/dishes";
import { cn, rupees } from "@/lib/format";
import type { Dish } from "@/lib/types";
import { Card, CardHeading } from "./ui/Card";
import { Chip, DietMark } from "./ui/Chip";
import { Segmented } from "./ui/Toggle";

// Step 2: build the exact meal. Dishes here are canonical (see lib/dishes.ts),
// which is what lets one basket be priced at five different kitchens — a cart
// of free-text menu lines could only ever be compared against itself.

export function DishBuilder() {
  const { cart, quantityOf, setQuantity, clearCart, diet, setDiet } = useComparison();
  const [query, setQuery] = useState("");

  const matchesDiet = useMemo(
    () => (dish: Dish) => (diet === "vegan" ? dish.vegan : diet === "veg" ? dish.veg : true),
    [diet],
  );

  const results = useMemo(() => {
    const found = query.trim() ? matchDishes(query) : DISHES.filter((dish) => dish.popular);
    return found.filter(matchesDiet).slice(0, 8);
  }, [query, matchesDiet]);

  const totalItems = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Card>
      <CardHeading
        title="Your meal"
        hint="Search a dish, set the quantity. Spellings are matched, so “kadai” finds Kadhai Paneer."
        right={
          cart.length > 0 ? (
            <button
              type="button"
              onClick={clearCart}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-muted transition hover:border-ink/25 hover:text-ink"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : null
        }
      />

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {cart.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-5 text-center text-sm text-muted">
            Nothing yet. Add a dish below — one kadhai paneer and three tandoori roti is the classic
            test.
          </p>
        ) : (
          <ul className="space-y-2">
            {cart.map((line) => {
              const dish = DISH_BY_ID.get(line.dishId);
              if (!dish) return null;
              return (
                <li
                  key={line.dishId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <DietMark veg={dish.veg} vegan={dish.vegan} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{dish.name}</span>
                      <span className="block truncate text-xs text-muted">{dish.category}</span>
                    </span>
                  </span>
                  <Stepper
                    quantity={line.quantity}
                    onChange={(next) => setQuantity(line.dishId, next)}
                    label={dish.name}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {totalItems > 0 ? (
          <p className="text-xs text-muted">
            {totalItems} item{totalItems === 1 ? "" : "s"}. Only kitchens serving{" "}
            <strong className="font-semibold text-ink">every</strong> dish are compared — splitting
            one meal across two restaurants means paying two sets of fees, which is never the
            cheaper answer.
          </p>
        ) : null}

        <div className="space-y-2 border-t border-line pt-4">
          <Segmented
            label="Dietary mode"
            value={diet}
            onChange={setDiet}
            options={[
              { value: "all", label: "Everything" },
              { value: "veg", label: "Veg", dot: "#0f8a3d" },
              { value: "vegan", label: "Vegan", dot: "#15803d" },
            ]}
          />

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Add a dish — kadhai paneer, roti, biryani…"
              aria-label="Search dishes to add"
              className="w-full rounded-xl border border-line bg-page py-2.5 pl-9 pr-9 text-sm outline-none placeholder:text-muted focus:border-accent"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear dish search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {query.trim() ? "Matches" : "Popular near you"}
          </p>

          <div className="space-y-1.5">
            {results.map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={() => setQuantity(dish.id, quantityOf(dish.id) + 1)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-left transition hover:border-ink/25"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <DietMark veg={dish.veg} vegan={dish.vegan} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{dish.name}</span>
                      {quantityOf(dish.id) > 0 ? <Chip>{quantityOf(dish.id)} added</Chip> : null}
                    </span>
                    <span className="block truncate text-xs text-muted">{dish.description}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-muted">
                    ~{rupees(dish.counterPrice)}
                  </span>
                  <Plus className="h-4 w-4 text-muted" />
                </span>
              </button>
            ))}
            {results.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-3 py-5 text-center text-sm text-muted">
                No dish matches that{diet !== "all" ? ` in ${diet === "vegan" ? "vegan" : "veg"} mode` : ""}.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Stepper({
  quantity,
  onChange,
  label,
}: {
  quantity: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <span className={cn("flex shrink-0 items-center gap-1 rounded-lg border border-line p-0.5")}>
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        onClick={() => onChange(quantity - 1)}
        className="cursor-pointer rounded-md p-1.5 text-muted transition hover:text-ink"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        aria-label={`Add one ${label}`}
        onClick={() => onChange(quantity + 1)}
        className="cursor-pointer rounded-md p-1.5 text-muted transition hover:text-ink"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
