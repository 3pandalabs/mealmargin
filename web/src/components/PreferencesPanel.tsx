"use client";

import { Bike, ShoppingBag } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { BANKS, CHANNELS } from "@/lib/channels";
import { cn } from "@/lib/format";
import { Card, CardHeading } from "./ui/Card";
import { Toggle } from "./ui/Toggle";

// Everything that changes the answer without changing the food: how you collect
// it, when you order, and what you hold.

export function FulfillmentToggle() {
  const { fulfillment, setFulfillment } = useComparison();

  const options = [
    {
      value: "delivery" as const,
      label: "Delivery",
      hint: "Rider brings it",
      Icon: Bike,
    },
    {
      value: "pickup" as const,
      label: "Self-pickup",
      hint: "You collect it",
      Icon: ShoppingBag,
    },
  ];

  return (
    <div role="radiogroup" aria-label="Fulfillment" className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const active = fulfillment === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setFulfillment(option.value)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
              active
                ? "border-accent bg-accent/8 shadow-[0_1px_10px_rgba(0,0,0,0.05)]"
                : "border-line bg-card hover:border-ink/25",
            )}
          >
            <option.Icon
              className={cn("h-5 w-5 shrink-0", active ? "text-accent" : "text-muted")}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{option.label}</span>
              <span className="block truncate text-xs text-muted">{option.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PreferencesPanel() {
  const {
    peak,
    setPeak,
    memberships,
    setMembership,
    banks,
    toggleBank,
    fulfillment,
    usePromos,
    setUsePromos,
  } = useComparison();

  return (
    <Card>
      <CardHeading
        title="Your situation"
        hint="What you hold and when you order moves the winner between columns."
      />
      <div className="space-y-5 px-4 py-4 sm:px-5">
        <div className="space-y-2">
          <Label>Ordering window</Label>
          <Toggle
            checked={peak}
            onChange={setPeak}
            label={peak ? "Peak / surge hours" : "Standard hours"}
            hint={
              fulfillment === "pickup"
                ? "No effect while you are collecting it yourself — surge is a rider fee"
                : peak
                  ? "Rain or the 8pm rush: fares multiplied, plus a flat high-demand fee"
                  : "Normal fares — flip this to see the surge structure"
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Promo codes</Label>
          <Toggle
            checked={usePromos}
            onChange={setUsePromos}
            label={usePromos ? "Auto-apply the best promo code" : "Ignore promo codes"}
            hint={
              usePromos
                ? "Assumes you have the best code available on each app"
                : "Structural comparison only — commission, fees and rider, no promotion"
            }
          />
          <p className="text-xs text-muted">
            Worth switching off at least once. Assuming a 60%-off code on every order is not a
            neutral default — it is the single biggest thing that can make an app look cheaper than
            the counter, and most repeat orders don&apos;t have one.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Membership passes</Label>
          {CHANNELS.filter((channel) => channel.membership).map((channel) => (
            <Toggle
              key={channel.id}
              checked={memberships[channel.id]}
              onChange={(next) => setMembership(channel.id, next)}
              label={channel.membership!.name}
              accent={channel.color}
              hint={`Free delivery over ₹${channel.membership!.freeDeliveryMinOrder} within ${channel.membership!.freeDeliveryMaxKm} km, plus ${channel.membership!.discountPercent}% off up to ₹${channel.membership!.discountCap} at partner kitchens`}
            />
          ))}
          <p className="text-xs text-muted">
            Neither the open network nor the counter has a pass to sell. A pass discount and a
            coupon do not stack on Swiggy or Zomato — the engine applies whichever is worth more and
            tells you what it dropped.
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
            Card offers apply to the payable amount and <em>do</em> stack on top of a coupon. Two of
            them are counter dining offers, so the pickup column is not flattered by forgetting that
            a card can save you money there too.
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
