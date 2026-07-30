"use client";

import { useMemo, useState } from "react";
import { Check, MapPin, Search } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { matchLocalities } from "@/lib/localities";
import { cn } from "@/lib/format";
import { Card } from "./ui/Card";

// Step 1 of the flow, and deliberately the most prominent thing on the page:
// every kitchen shown, every delivery fare and every walk time downstream is
// derived from this one choice.

export function LocationBar() {
  const { locality, setLocalityId } = useComparison();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");

  const matches = useMemo(() => matchLocalities(query), [query]);

  if (!editing) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <span className="flex min-w-0 items-center gap-2.5">
          <MapPin className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
              Delivering to
            </span>
            <span className="block truncate text-sm font-semibold sm:text-base">{locality.name}</span>
          </span>
        </span>
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setQuery("");
          }}
          className="shrink-0 cursor-pointer rounded-lg border border-line px-3 py-1.5 text-xs font-medium transition hover:border-ink/25"
        >
          Change
        </button>
      </Card>
    );
  }

  return (
    <Card className="px-4 py-3 sm:px-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Area, sector or city — try Dwarka, Andheri, Bengaluru…"
          aria-label="Search for a delivery location"
          className="w-full rounded-xl border border-line bg-page py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <ul className="mt-3 space-y-1.5">
        {matches.map((match) => (
          <li key={match.id}>
            <button
              type="button"
              onClick={() => {
                setLocalityId(match.id);
                setEditing(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                match.id === locality.id ? "border-accent bg-accent/5" : "border-line hover:border-ink/25",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{match.area}</span>
                <span className="block truncate text-xs text-muted">{match.city}</span>
              </span>
              {match.id === locality.id ? (
                <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              ) : null}
            </button>
          </li>
        ))}
        {matches.length === 0 ? (
          <li className="rounded-lg border border-dashed border-line px-3 py-5 text-center text-sm text-muted">
            No locality matches that. MealMargin models five metro zones — the fee structures are
            national, but the kitchens and distances are local, so a zone has to exist in the
            dataset to be priced.
          </li>
        ) : null}
      </ul>

      <button
        type="button"
        onClick={() => setEditing(false)}
        className="mt-3 cursor-pointer text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
      >
        Cancel
      </button>
    </Card>
  );
}
