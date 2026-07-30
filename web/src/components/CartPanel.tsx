"use client";

import { Trash2 } from "lucide-react";
import { rupees } from "@/lib/format";
import type { MenuItem } from "@/lib/types";
import { Card, CardHeading } from "./ui/Card";

export function CartPanel({
  lines,
  baseSubtotal,
  itemCount,
  onClear,
}: {
  lines: { item: MenuItem; quantity: number }[];
  baseSubtotal: number;
  itemCount: number;
  onClear: () => void;
}) {
  return (
    <Card>
      <CardHeading
        title="Cart"
        hint="Priced at the kitchen's own rates — every column marks this up differently."
        right={
          lines.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs text-muted transition hover:border-ink/25 hover:text-ink"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          ) : null
        }
      />
      <div className="px-4 py-4 sm:px-5">
        {lines.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
            Empty. Add a dish from the menu — the three columns below fill in as soon as there is
            something to price.
          </p>
        ) : (
          <>
            <ul className="space-y-1.5">
              {lines.map(({ item, quantity }) => (
                <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="tabular-nums text-muted">{quantity}×</span> {item.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{rupees(item.basePrice * quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-sm font-semibold">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
              <span className="text-base font-semibold tabular-nums">{rupees(baseSubtotal)}</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
