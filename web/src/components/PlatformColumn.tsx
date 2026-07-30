"use client";

import { Ban, Check, Info } from "lucide-react";
import type { Quote } from "@/lib/pricing";
import { cn, rupees } from "@/lib/format";
import { Chip } from "./ui/Chip";

// One checkout, itemised. Every line here is a line a real cart shows, in the
// order a real cart shows it — the value of the tool is that the same six lines
// are directly comparable across three apps that each present them differently.

export function PlatformColumn({
  quote,
  isBest,
  deltaToBest,
  itemCount,
}: {
  quote: Quote;
  isBest: boolean;
  deltaToBest: number;
  itemCount: number;
}) {
  const { platform } = quote;

  if (!quote.available) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-dashed border-line bg-card p-4 opacity-70">
        <ColumnHead platform={platform.name} channel={platform.channel} color={platform.color} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <Ban className="h-5 w-5 text-muted" />
          <p className="text-sm font-medium">Not listed here</p>
          <p className="max-w-[16rem] text-xs text-muted">{quote.unavailableReason}.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-4 transition",
        isBest ? "shadow-[0_2px_16px_rgba(0,0,0,0.08)]" : "border-line",
      )}
      style={isBest ? { borderColor: platform.color, borderWidth: 2 } : undefined}
    >
      <ColumnHead
        platform={platform.name}
        channel={platform.channel}
        color={platform.color}
        badge={
          isBest ? (
            <Chip color={platform.color} className="font-semibold">
              <Check className="h-3 w-3" /> Cheapest
            </Chip>
          ) : deltaToBest > 0 ? (
            <Chip>+{rupees(deltaToBest)}</Chip>
          ) : null
        }
      />

      {itemCount === 0 ? (
        <p className="py-8 text-center text-xs text-muted">Add items to price this column.</p>
      ) : (
        <>
          <dl className="mt-3 space-y-0 divide-y divide-line/60 text-sm">
            <Row
              label="Menu price"
              value={quote.menuSubtotal}
              note={`Includes ${rupees(quote.commissionComponent)} of platform commission`}
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
                platform.handlingFee > 0
                  ? `Restaurant packaging + ${rupees(platform.handlingFee)} handling`
                  : "Restaurant packaging, no handling fee on this network"
              }
            />
            <Row
              label="Platform fee"
              value={quote.platformFee}
              note={quote.platformFee === 0 ? "The open network charges none" : "Flat, per order"}
            />
            <Row
              label="Delivery"
              value={quote.delivery}
              strikethrough={quote.deliveryWaived ? quote.deliveryBeforeWaiver : undefined}
              note={
                quote.deliveryWaived
                  ? `Waived by ${platform.membership?.name}`
                  : quote.deliveryBeforeWaiver > 0
                    ? "Distance-based fare"
                    : undefined
              }
            />
            <Row label="GST (5% food, 18% fees)" value={quote.taxes} />
            {quote.memberDiscount > 0 ? (
              <Row
                label={`${platform.membership?.name} discount`}
                value={-quote.memberDiscount}
                negative
              />
            ) : null}
            {quote.couponDiscount > 0 && quote.appliedCoupon ? (
              <Row
                label="Coupon"
                value={-quote.couponDiscount}
                note={quote.appliedCoupon.label}
                chip={quote.appliedCoupon.code}
                chipColor={platform.color}
                negative
              />
            ) : null}
            {quote.bankDiscount > 0 && quote.appliedBank ? (
              <Row
                label="Card / wallet offer"
                value={-quote.bankDiscount}
                note={quote.appliedBank.label}
                negative
              />
            ) : null}
          </dl>

          <div className="mt-3 flex items-baseline justify-between border-t-2 border-line pt-3">
            <span className="text-sm font-semibold">You pay</span>
            <span className="text-2xl font-bold tabular-nums" style={{ color: platform.color }}>
              {rupees(quote.total)}
            </span>
          </div>

          {quote.promoRunnerUp || quote.notes.length > 0 || quote.appliedCoupon?.caveat ? (
            <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
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
        </>
      )}
    </div>
  );
}

function ColumnHead({
  platform,
  channel,
  color,
  badge,
}: {
  platform: string;
  channel: string;
  color: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <span className="truncate text-base font-semibold tracking-tight">{platform}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{channel}</p>
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
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className={cn("text-sm", negative ? "text-ink" : "text-ink")}>{label}</span>
          {chip ? (
            <Chip color={chipColor} className="font-mono uppercase">
              {chip}
            </Chip>
          ) : null}
        </span>
        {note ? <span className="mt-0.5 block text-[11px] leading-snug text-muted">{note}</span> : null}
      </dt>
      <dd className="shrink-0 text-right text-sm tabular-nums">
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
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
