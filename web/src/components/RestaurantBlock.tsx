"use client";

import { Footprints, Car, PiggyBank, Star } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import type { RestaurantResult } from "@/lib/recommend";
import { cn, percent, rupees } from "@/lib/format";
import { Card } from "./ui/Card";
import { Chip } from "./ui/Chip";
import { ChannelReceipt } from "./ChannelReceipt";

// One kitchen, priced four ways, with the pickup arithmetic stated outright
// rather than left for the reader to do across two columns.

export function RestaurantBlock({
  result,
  isOverallBest,
}: {
  result: RestaurantResult;
  isOverallBest: boolean;
}) {
  const { fulfillment } = useComparison();
  const { restaurant } = result;
  const bestTotal = result.best?.total ?? 0;

  return (
    <Card
      className={cn("overflow-hidden", isOverallBest ? "ring-2 ring-accent" : "")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-base font-semibold tracking-tight">{restaurant.name}</h3>
            {restaurant.pureVeg ? (
              <Chip color="#0f8a3d" title="Pure vegetarian kitchen">
                Pure veg
              </Chip>
            ) : null}
            {isOverallBest ? (
              <Chip color="#2f7a4f" className="font-semibold">
                Best value nearby
              </Chip>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {restaurant.cuisines.join(" · ")} — {restaurant.tagline}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" aria-hidden="true" /> {restaurant.rating}
            </span>
            <span>{restaurant.distanceKm} km away</span>
            {result.walkable ? (
              <span className="flex items-center gap-1">
                <Footprints className="h-3 w-3" aria-hidden="true" /> {result.walkMinutes} min walk
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3" aria-hidden="true" /> {result.driveMinutes} min drive
            </span>
            <span>~{restaurant.prepMinutes} min to cook</span>
          </p>
        </div>

        {result.best ? (
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Cheapest here
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color: result.best.channel.color }}>
              {rupees(result.best.total)}
            </p>
            <p className="text-[11px] text-muted">{result.best.channel.name}</p>
          </div>
        ) : null}
      </div>

      {result.bestDelivered && result.pickup ? (
        <PickupSavings result={result} fulfillment={fulfillment} />
      ) : null}

      <div className="grid gap-2.5 px-4 py-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-4">
        {result.quotes.map((quote) => (
          <ChannelReceipt
            key={quote.channel.id}
            quote={quote}
            isBest={quote.available && quote.channel.id === result.best?.channel.id}
            deltaToBest={quote.total - bestTotal}
          />
        ))}
      </div>
    </Card>
  );
}

/**
 * The pickup arithmetic, stated in whichever direction it actually points.
 * Showing "you save −₹73" when a coupon beats the counter would be both ugly
 * and dishonest by omission — the interesting fact in that case is that the
 * promo is doing the work, so it says so.
 */
function PickupSavings({
  result,
  fulfillment,
}: {
  result: RestaurantResult;
  fulfillment: "delivery" | "pickup";
}) {
  const delivered = result.bestDelivered;
  const pickup = result.pickup;
  if (!delivered || !pickup) return null;

  const saves = result.pickupSaving > 0;
  const gap = Math.abs(result.pickupSaving);

  if (gap === 0) {
    return (
      <div className="border-b border-line px-4 py-2.5 text-xs text-muted sm:px-5">
        Collecting it yourself costs exactly what delivery does here — the promo on{" "}
        {delivered.channel.name} cancels the fees out.
      </div>
    );
  }

  return (
    <div className={cn("border-b border-line px-4 py-3 sm:px-5", saves ? "bg-accent/8" : "bg-surface")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <PiggyBank
            className={cn("mt-0.5 h-5 w-5 shrink-0", saves ? "text-accent" : "text-muted")}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {saves
                ? `Save ${rupees(gap)} (${percent(result.pickupSavingPercent)}) by collecting it yourself`
                : `Delivery is ${rupees(gap)} cheaper here right now`}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {rupees(delivered.total)} delivered via {delivered.channel.name} vs{" "}
              {rupees(pickup.total)} at the counter.{" "}
              {saves
                ? result.walkable
                  ? `That is ${result.walkMinutes} minutes on foot.`
                  : `That is ${result.driveMinutes} minutes by car — too far to walk.`
                : "An app promo is outweighing the commission and fees on a basket this size."}
            </p>
          </div>
        </div>
        {saves && result.walkable && fulfillment === "delivery" ? (
          <p className="shrink-0 text-xs text-muted">
            ≈ {rupees(Math.round(gap / Math.max(1, result.walkMinutes)))}/min of walking
          </p>
        ) : null}
      </div>
    </div>
  );
}
