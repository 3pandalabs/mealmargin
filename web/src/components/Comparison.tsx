"use client";

import { useComparison } from "@/context/ComparisonContext";
import { rupees } from "@/lib/format";
import { AdviceBanner } from "./AdviceBanner";
import { DishBuilder } from "./DishBuilder";
import { LocationBar } from "./LocationBar";
import { FulfillmentToggle, PreferencesPanel } from "./PreferencesPanel";
import { RestaurantBlock } from "./RestaurantBlock";
import { Card } from "./ui/Card";

// The page body. Inputs first (where, what, how), then the answer, then the
// kitchens ranked cheapest-first — which is the order someone actually asks
// the questions in.

export function Comparison() {
  const { comparison, cart, locality, fulfillment } = useComparison();
  const { results, skipped, best, advice, spread } = comparison;

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="space-y-4">
      <LocationBar />
      <FulfillmentToggle />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-4">
          <DishBuilder />
          <PreferencesPanel />
        </div>

        <div className="space-y-4">
          <AdviceBanner advice={advice} />

          {itemCount > 0 && best ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat
                label="Cheapest overall"
                value={rupees(best.quote.total)}
                sub={`${best.restaurant.name} — ${best.quote.channel.name}`}
              />
              <Stat
                label="Spread across options"
                value={rupees(spread)}
                sub={`Between the cheapest and dearest way to buy this exact meal in ${locality.area}`}
              />
              <Stat
                label="Kitchens compared"
                value={String(results.length)}
                sub={
                  skipped.length > 0
                    ? `${skipped.length} nearby skipped — they don't serve the whole meal`
                    : "Every kitchen near you serves this meal"
                }
              />
            </div>
          ) : null}

          {results.map((result) => (
            <RestaurantBlock
              key={result.restaurant.id}
              result={result}
              isOverallBest={result.restaurant.id === best?.restaurant.id && itemCount > 0}
            />
          ))}

          {itemCount > 0 && results.length === 0 ? (
            <Card className="px-4 py-8 text-center">
              <p className="text-sm font-medium">No kitchen in {locality.area} serves that whole meal</p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted">
                Every quote here prices the complete basket at a single kitchen. Splitting one meal
                across two restaurants means paying two sets of platform, packaging and delivery
                fees, which is never the cheaper answer — so a partial match is not shown as one.
              </p>
            </Card>
          ) : null}

          {skipped.length > 0 ? (
            <p className="px-1 text-xs text-muted">
              Not compared: {skipped.map((entry) => entry.restaurant.name).join(", ")} — nearby, but
              missing at least one dish from your meal.
            </p>
          ) : null}

          {fulfillment === "pickup" && results.length > 0 ? (
            <p className="px-1 text-xs text-muted">
              In pickup mode the apps still charge their marked-up menu price for takeaway; only the
              counter avoids the commission. That gap is usually larger than the delivery fee you
              just saved.
            </p>
          ) : null}
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
