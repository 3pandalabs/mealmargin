"use client";

import { PLATFORM_BY_ID } from "@/lib/platforms";
import { SWEEP_MAX, SWEEP_MIN, type CrossoverSegment } from "@/lib/recommend";
import { rupees } from "@/lib/format";
import { Card, CardHeading } from "./ui/Card";

// "ONDC is cheaper" is only ever true within a band. This bar sweeps the cart
// value with the composition held fixed and shows where the winner flips, with
// a marker for where the current cart sits — the small-vs-large-order advice
// made visual instead of asserted.

export function CrossoverBar({
  segments,
  baseSubtotal,
}: {
  segments: CrossoverSegment[];
  baseSubtotal: number;
}) {
  if (segments.length === 0) return null;

  const span = SWEEP_MAX - SWEEP_MIN;
  const pct = (value: number) => ((value - SWEEP_MIN) / span) * 100;
  const markerAt = Math.min(100, Math.max(0, pct(baseSubtotal)));
  const single = segments.length === 1;

  return (
    <Card>
      <CardHeading
        title="Where the winner flips"
        hint="Same cart composition, slid across cart values. Fixed per-order fees dominate small carts; capped percentage discounts dominate large ones."
      />
      <div className="px-4 py-4 sm:px-5">
        <div className="relative">
          <div className="flex h-8 overflow-hidden rounded-lg border border-line">
            {segments.map((segment) => {
              const platform = PLATFORM_BY_ID[segment.winner];
              const width = Math.max(
                0,
                pct(segment.toSubtotal) - pct(segment.fromSubtotal),
              );
              return (
                <div
                  key={`${segment.winner}-${segment.fromSubtotal}`}
                  className="flex items-center justify-center overflow-hidden text-[10px] font-semibold text-white"
                  style={{ width: `${width}%`, background: platform.color }}
                  title={`${platform.name} is cheapest from ${rupees(segment.fromSubtotal)} to ${rupees(segment.toSubtotal)} of kitchen-price cart value`}
                >
                  <span className="truncate px-1">{platform.name}</span>
                </div>
              );
            })}
          </div>

          {baseSubtotal >= SWEEP_MIN && baseSubtotal <= SWEEP_MAX ? (
            <div
              className="pointer-events-none absolute -top-1 -bottom-1 w-0.5 bg-ink"
              style={{ left: `${markerAt}%` }}
              aria-hidden="true"
            />
          ) : null}
        </div>

        <div className="mt-1.5 flex justify-between text-[11px] text-muted">
          <span>{rupees(SWEEP_MIN)}</span>
          <span className="font-medium text-ink">your cart {rupees(baseSubtotal)}</span>
          <span>{rupees(SWEEP_MAX)}+</span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          {single ? (
            <>
              {PLATFORM_BY_ID[segments[0].winner].name} wins at every cart size for this
              restaurant and these settings — the gap here is structural, not a coupon artefact.
            </>
          ) : (
            <>
              The winner changes {segments.length - 1} time
              {segments.length - 1 === 1 ? "" : "s"} across this range:{" "}
              {segments
                .map(
                  (segment) =>
                    `${PLATFORM_BY_ID[segment.winner].name} ${rupees(segment.fromSubtotal)}–${rupees(segment.toSubtotal)}`,
                )
                .join(", ")}
              . Change the distance, a membership or a card and it redraws.
            </>
          )}
        </p>
      </div>
    </Card>
  );
}
