"use client";

import { Minus, Plus } from "lucide-react";
import { PLATFORMS } from "@/lib/platforms";
import { rupees } from "@/lib/format";
import type { DietMode, MenuItem, Restaurant } from "@/lib/types";
import { Card, CardHeading } from "./ui/Card";
import { Chip, DietMark } from "./ui/Chip";

// The menu, priced three ways. Showing the per-item platform prices here rather
// than only in the totals is the fastest way to make the commission gap
// concrete: the same dosa is a different price in each column before a single
// fee is added.

export function MenuPanel({
  restaurant,
  diet,
  cart,
  onQuantity,
}: {
  restaurant: Restaurant;
  diet: DietMode;
  cart: Record<string, number>;
  onQuantity: (itemId: string, quantity: number) => void;
}) {
  const items = restaurant.items.filter((item) =>
    diet === "vegan" ? item.vegan : diet === "veg" ? item.veg : true,
  );
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const hiddenCount = restaurant.items.length - items.length;

  return (
    <Card>
      <CardHeading
        title={restaurant.name}
        hint={`${restaurant.tagline} — ${restaurant.area}, ${restaurant.city} · ~${restaurant.prepMinutes} min prep`}
        right={
          restaurant.pureVeg ? (
            <Chip color="#0f8a3d" className="shrink-0">
              Pure veg
            </Chip>
          ) : null
        }
      />
      <div className="px-4 py-4 sm:px-5">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
            Nothing on this menu is {diet === "vegan" ? "vegan" : "vegetarian"}. Switch the dietary
            mode, or pick another kitchen — the pure-veg ones are flagged in the search list.
          </p>
        ) : null}

        {categories.map((category) => (
          <div key={category} className="mb-5 last:mb-0">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {category}
            </p>
            <div className="space-y-2">
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    restaurant={restaurant}
                    quantity={cart[item.id] ?? 0}
                    onQuantity={onQuantity}
                  />
                ))}
            </div>
          </div>
        ))}

        {hiddenCount > 0 ? (
          <p className="mt-2 text-xs text-muted">
            {hiddenCount} item{hiddenCount === 1 ? "" : "s"} hidden by the{" "}
            {diet === "vegan" ? "vegan" : "vegetarian"} filter.
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function MenuRow({
  item,
  restaurant,
  quantity,
  onQuantity,
}: {
  item: MenuItem;
  restaurant: Restaurant;
  quantity: number;
  onQuantity: (itemId: string, quantity: number) => void;
}) {
  return (
    <div className="rounded-xl border border-line px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <DietMark veg={item.veg} vegan={item.vegan} />
            <span className="truncate text-sm font-medium">{item.name}</span>
            {item.popular ? <Chip>Popular</Chip> : null}
            {item.vegan ? (
              <Chip color="#15803d" title="No dairy, ghee or honey">
                Vegan
              </Chip>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-line p-0.5">
          <button
            type="button"
            aria-label={`Remove one ${item.name}`}
            disabled={quantity === 0}
            onClick={() => onQuantity(item.id, Math.max(0, quantity - 1))}
            className="cursor-pointer rounded-md p-1.5 text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-5 text-center text-sm font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label={`Add one ${item.name}`}
            onClick={() => onQuantity(item.id, quantity + 1)}
            className="cursor-pointer rounded-md p-1.5 text-muted transition hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        <span className="text-muted">
          Kitchen price <span className="font-semibold tabular-nums text-ink">{rupees(item.basePrice)}</span>
        </span>
        {PLATFORMS.map((platform) => {
          if (!restaurant.listedOn.includes(platform.id)) return null;
          const rate = platform.commission + (restaurant.markupAdjustment[platform.id] ?? 0);
          return (
            <span key={platform.id} className="flex items-center gap-1 tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: platform.color }} />
              <span className="text-muted">{platform.name}</span>
              <span className="font-semibold">{rupees(item.basePrice * (1 + rate))}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
