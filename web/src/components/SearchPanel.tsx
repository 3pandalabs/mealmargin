"use client";

import { Search, X } from "lucide-react";
import { PLATFORM_BY_ID } from "@/lib/platforms";
import { cn, rupees } from "@/lib/format";
import type { MenuItem, Restaurant } from "@/lib/types";
import { Card, CardHeading } from "./ui/Card";
import { Chip, DietMark } from "./ui/Chip";

// One search box over both restaurants and dishes, because people arrive with
// either in mind ("Biryani Junction" or "paneer butter masala").

export function SearchPanel({
  query,
  onQuery,
  restaurants,
  dishMatches,
  selectedId,
  onSelectRestaurant,
  onSelectDish,
}: {
  query: string;
  onQuery: (next: string) => void;
  restaurants: Restaurant[];
  dishMatches: { item: MenuItem; restaurant: Restaurant }[];
  selectedId: string;
  onSelectRestaurant: (id: string) => void;
  onSelectDish: (restaurantId: string, itemId: string) => void;
}) {
  return (
    <Card>
      <CardHeading
        title="Search"
        hint="A restaurant name, a cuisine, a city, or a dish."
        right={
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {restaurants.length} kitchen{restaurants.length === 1 ? "" : "s"}
          </span>
        }
      />
      <div className="px-4 py-4 sm:px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Paneer butter masala, biryani, Bandra…"
            aria-label="Search restaurants and dishes"
            className="w-full rounded-xl border border-line bg-page py-2.5 pl-9 pr-9 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {query && dishMatches.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Matching dishes
            </p>
            {dishMatches.slice(0, 5).map(({ item, restaurant }) => (
              <button
                key={`${restaurant.id}-${item.id}`}
                type="button"
                onClick={() => onSelectDish(restaurant.id, item.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-left transition hover:border-ink/25"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <DietMark veg={item.veg} vegan={item.vegan} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.name}</span>
                    <span className="block truncate text-xs text-muted">
                      {restaurant.name} · {restaurant.area}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted">
                  from {rupees(item.basePrice)}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 space-y-2">
          {restaurants.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
              Nothing matches that. Try a cuisine (&ldquo;biryani&rdquo;), a city, or clear the
              dietary filter.
            </p>
          ) : null}
          {restaurants.map((restaurant) => (
            <RestaurantRow
              key={restaurant.id}
              restaurant={restaurant}
              selected={restaurant.id === selectedId}
              onSelect={() => onSelectRestaurant(restaurant.id)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function RestaurantRow({
  restaurant,
  selected,
  onSelect,
}: {
  restaurant: Restaurant;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left transition",
        selected ? "border-accent bg-accent/5" : "border-line hover:border-ink/25",
      )}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{restaurant.name}</span>
            {restaurant.pureVeg ? (
              <Chip color="#0f8a3d" title="Pure vegetarian kitchen — no shared non-veg prep">
                Pure veg
              </Chip>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {restaurant.cuisines.join(" · ")} — {restaurant.area}, {restaurant.city}
          </span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-muted">★ {restaurant.rating}</span>
      </span>
      <span className="mt-2 flex flex-wrap gap-1">
        {(["swiggy", "zomato", "ondc"] as const).map((platformId) => {
          const platform = PLATFORM_BY_ID[platformId];
          const listed = restaurant.listedOn.includes(platformId);
          return (
            <Chip
              key={platformId}
              color={listed ? platform.color : undefined}
              title={listed ? `Listed on ${platform.name}` : `Not listed on ${platform.name}`}
              className={listed ? "" : "line-through opacity-60"}
            >
              {platform.name}
            </Chip>
          );
        })}
      </span>
    </button>
  );
}
