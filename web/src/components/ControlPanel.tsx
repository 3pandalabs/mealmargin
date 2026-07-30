"use client";

import { BANKS, PLATFORMS } from "@/lib/platforms";
import type { BankId, DietMode, PlatformId } from "@/lib/types";
import { cn } from "@/lib/format";
import { Card, CardHeading } from "./ui/Card";
import { Segmented, Toggle } from "./ui/Toggle";

// Everything that changes the answer without changing the food: who you are
// (member, cardholder), where you are (distance), and when you order (surge).

export function ControlPanel({
  diet,
  onDiet,
  distanceKm,
  onDistance,
  peak,
  onPeak,
  memberships,
  onMembership,
  banks,
  onBanks,
}: {
  diet: DietMode;
  onDiet: (next: DietMode) => void;
  distanceKm: number;
  onDistance: (next: number) => void;
  peak: boolean;
  onPeak: (next: boolean) => void;
  memberships: Record<PlatformId, boolean>;
  onMembership: (platform: PlatformId, next: boolean) => void;
  banks: BankId[];
  onBanks: (next: BankId[]) => void;
}) {
  const toggleBank = (bank: BankId) =>
    onBanks(banks.includes(bank) ? banks.filter((b) => b !== bank) : [...banks, bank]);

  return (
    <Card>
      <CardHeading
        title="Your order context"
        hint="These are the inputs that move the winner between columns."
      />
      <div className="space-y-5 px-4 py-4 sm:px-5">
        <div className="space-y-2">
          <Label>Dietary mode</Label>
          <Segmented<DietMode>
            label="Dietary mode"
            value={diet}
            onChange={onDiet}
            options={[
              { value: "all", label: "Everything" },
              { value: "veg", label: "Vegetarian", dot: "#0f8a3d" },
              { value: "vegan", label: "Vegan", dot: "#15803d" },
            ]}
          />
          <p className="text-xs text-muted">
            Restricts the menu and the search results. Pure-veg kitchens are flagged, so a
            no-onion-no-garlic household can rule out a shared fryer at a glance.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label>Delivery distance</Label>
            <span className="text-sm font-semibold tabular-nums">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={distanceKm}
            aria-label="Delivery distance in kilometres"
            onChange={(event) => onDistance(Number(event.target.value))}
          />
          <div className="flex justify-between text-[11px] text-muted">
            <span>1 km</span>
            <span>10 km</span>
          </div>
          <p className="text-xs text-muted">
            Past 7 km both membership passes stop waiving delivery, and ONDC&apos;s unsubsidised
            per-km rate starts to bite.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Ordering window</Label>
          <Toggle
            checked={peak}
            onChange={onPeak}
            label={peak ? "Peak / surge hours" : "Standard hours"}
            hint={
              peak
                ? "Rain or 8pm rush: fares multiplied and a flat high-demand fee added"
                : "Normal fares — flip this to see the surge structure"
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Membership passes</Label>
          {PLATFORMS.map((platform) => (
            <Toggle
              key={platform.id}
              checked={Boolean(platform.membership) && memberships[platform.id]}
              onChange={(next) => onMembership(platform.id, next)}
              label={platform.membership?.name ?? `${platform.name} — no pass`}
              accent={platform.color}
              hint={
                platform.membership
                  ? `Free delivery over ₹${platform.membership.freeDeliveryMinOrder} within ${platform.membership.freeDeliveryMaxKm} km, plus ${platform.membership.discountPercent}% off up to ₹${platform.membership.discountCap} at partner restaurants`
                  : undefined
              }
              disabled={!platform.membership}
              disabledReason="The open network has no subscription tier — nothing to switch on"
            />
          ))}
          <p className="text-xs text-muted">
            A pass discount and a coupon do not stack on Swiggy or Zomato. The engine applies
            whichever is worth more and tells you what it dropped.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Cards &amp; wallets you hold</Label>
          <div className="flex flex-wrap gap-2">
            {BANKS.map((bank) => {
              const active = banks.includes(bank.id);
              return (
                <button
                  key={bank.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleBank(bank.id)}
                  title={bank.name}
                  className={cn(
                    "cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-line text-muted hover:border-ink/25 hover:text-ink",
                  )}
                >
                  {bank.short}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted">
            Bank offers apply to the payable amount and <em>do</em> stack on top of a coupon —
            which is what usually decides the winner once the carts are close.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{children}</span>
  );
}
