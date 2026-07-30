"use client";

import type { Ranked } from "@/lib/recommend";
import { cn } from "@/lib/format";
import { PlatformColumn } from "./PlatformColumn";

// Written out rather than interpolated: Tailwind scans source text, so a
// template-built class name would never make it into the stylesheet.
const ORDER_CLASSES = ["order-1", "order-2", "order-3", "order-4"];

// Three columns side by side on desktop, stacked on mobile, cheapest first on
// mobile so the answer is above the fold on a phone. On desktop the order stays
// Swiggy / Zomato / ONDC, because a stable column order is what makes repeated
// comparisons scannable.

export function ComparisonGrid({ ranked, itemCount }: { ranked: Ranked; itemCount: number }) {
  const bestTotal = ranked.best?.total ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ranked.quotes.map((quote) => {
        const rankIndex = ranked.available.findIndex((q) => q.platform.id === quote.platform.id);
        return (
          <div
            key={quote.platform.id}
            // Cheapest first when stacked; source order restored at lg.
            className={cn(ORDER_CLASSES[rankIndex === -1 ? 3 : rankIndex], "lg:order-none")}
          >
            <PlatformColumn
              quote={quote}
              isBest={quote.available && quote.platform.id === ranked.best?.platform.id && itemCount > 0}
              deltaToBest={quote.total - bestTotal}
              itemCount={itemCount}
            />
          </div>
        );
      })}
    </div>
  );
}
