"use client";

import { Ban, Check, Info } from "lucide-react";
import type { Quote } from "@/lib/pricing";
import { cn, rupees } from "@/lib/format";
import { Chip } from "./ui/Chip";

// One checkout, itemised. Every line is a line a real cart shows, in the order
// it shows them — the value of the tool is that the same lines are directly
// comparable across four channels that each present them differently.

export function ChannelReceipt({
  quote,
  isBest,
  deltaToBest,
}: {
  quote: Quote;
  isBest: boolean;
  deltaToBest: number;
}) {
  const { channel } = quote;

  if (!quote.available) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-dashed border-line p-3 opacity-70">
        <Head name={channel.name} channel={channel.channel} color={channel.color} />
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
          <Ban className="h-4 w-4 text-muted" aria-hidden="true" />
          <p className="text-xs text-muted">{quote.unavailableReason}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border p-3 transition",
        isBest ? "shadow-[0_2px_14px_rgba(0,0,0,0.07)]" : "border-line",
      )}
      style={isBest ? { borderColor: channel.color, borderWidth: 2 } : undefined}
    >
      <Head
        name={channel.name}
        channel={channel.channel}
        color={channel.color}
        badge={
          isBest ? (
            <Chip color={channel.color} className="font-semibold">
              <Check className="h-3 w-3" /> Cheapest here
            </Chip>
          ) : deltaToBest > 0 ? (
            <Chip>+{rupees(deltaToBest)}</Chip>
          ) : null
        }
      />

      <dl className="mt-2.5 space-y-0 divide-y divide-line/60 text-sm">
        <Row
          label={channel.id === "pickup" ? "Counter price" : "Menu price"}
          value={quote.menuSubtotal}
          note={
            channel.id === "pickup"
              ? "What the kitchen charges — no commission added"
              : `Includes ${rupees(quote.commissionComponent)} of commission on top of the ${rupees(
                  quote.counterSubtotal,
                )} counter price`
          }
        />
        {quote.restaurantDiscount > 0 && quote.restaurantOffer ? (
          <Row
            label="Restaurant offer"
            value={-quote.restaurantDiscount}
            note={quote.restaurantOffer.label}
            negative
          />
        ) : null}
        <Row
          label="Packaging & handling"
          value={quote.packaging}
          note={
            channel.handlingFee > 0
              ? `Containers + ${rupees(channel.handlingFee)} handling`
              : "Containers only — takeaway still needs them"
          }
        />
        <Row
          label="Platform fee"
          value={quote.platformFee}
          note={quote.platformFee === 0 ? "None on this channel" : "Flat, per order"}
        />
        <Row
          label="Delivery"
          value={quote.delivery}
          strikethrough={quote.deliveryWaived ? quote.deliveryBeforeWaiver : undefined}
          note={
            quote.deliveryWaived
              ? `Waived by ${channel.membership?.name}`
              : quote.delivery === 0
                ? "You are collecting it"
                : "Distance-based fare"
          }
        />
        <Row label="GST (5% food, 18% fees)" value={quote.taxes} />
        {quote.memberDiscount > 0 ? (
          <Row label={`${channel.membership?.name} discount`} value={-quote.memberDiscount} negative />
        ) : null}
        {quote.couponDiscount > 0 && quote.appliedCoupon ? (
          <Row
            label="Coupon"
            value={-quote.couponDiscount}
            note={quote.appliedCoupon.label}
            chip={quote.appliedCoupon.code}
            chipColor={channel.color}
            negative
          />
        ) : null}
        {quote.bankDiscount > 0 && quote.appliedBank ? (
          <Row
            label="Card offer"
            value={-quote.bankDiscount}
            note={quote.appliedBank.label}
            negative
          />
        ) : null}
      </dl>

      <div className="mt-2.5 flex items-baseline justify-between border-t-2 border-line pt-2.5">
        <span className="text-sm font-semibold">You pay</span>
        <span className="text-xl font-bold tabular-nums" style={{ color: channel.color }}>
          {rupees(quote.total)}
        </span>
      </div>

      {quote.promoRunnerUp || quote.notes.length > 0 || quote.appliedCoupon?.caveat ? (
        <ul className="mt-2.5 space-y-1 border-t border-line pt-2.5">
          {quote.promoRunnerUp ? <Note>Dropped {quote.promoRunnerUp}</Note> : null}
          {quote.appliedCoupon?.caveat ? (
            <Note>
              {quote.appliedCoupon.code}: {quote.appliedCoupon.caveat}
            </Note>
          ) : null}
          {quote.notes.map((note) => (
            <Note key={note}>{note}</Note>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Head({
  name,
  channel,
  color,
  badge,
}: {
  name: string;
  channel: string;
  color: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
          <span className="truncate text-sm font-semibold tracking-tight">{name}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted">{channel}</p>
      </div>
      {badge}
    </div>
  );
}

function Row({
  label,
  value,
  note,
  chip,
  chipColor,
  negative,
  strikethrough,
}: {
  label: string;
  value: number;
  note?: string;
  chip?: string;
  chipColor?: string;
  negative?: boolean;
  strikethrough?: number;
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <dt className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px]">{label}</span>
          {chip ? (
            <Chip color={chipColor} className="font-mono uppercase">
              {chip}
            </Chip>
          ) : null}
        </span>
        {note ? <span className="mt-0.5 block text-[11px] leading-snug text-muted">{note}</span> : null}
      </dt>
      <dd className="shrink-0 text-right text-[13px] tabular-nums">
        {strikethrough !== undefined ? (
          <span className="mr-1.5 text-muted line-through">{rupees(strikethrough)}</span>
        ) : null}
        <span className={cn("font-medium", negative ? "text-[#0f8a3d] dark:text-[#4ade80]" : "")}>
          {negative ? `− ${rupees(Math.abs(value))}` : rupees(value)}
        </span>
      </dd>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-1.5 text-[11px] leading-snug text-muted">
      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
