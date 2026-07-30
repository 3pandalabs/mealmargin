"use client";

import { Lightbulb, Sparkles } from "lucide-react";
import type { Advice } from "@/lib/recommend";
import { cn } from "@/lib/format";

// The one thing to read if you read nothing else: where to buy it, why, and
// what would have to change for the answer to change.

export function AdviceBanner({ advice }: { advice: Advice }) {
  const Icon = advice.tone === "win" ? Sparkles : Lightbulb;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        advice.tone === "win"
          ? "border-accent/40 bg-accent/8"
          : "border-line bg-card backdrop-blur-sm",
      )}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">{advice.headline}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{advice.detail}</p>
          {advice.footnotes.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {advice.footnotes.map((note) => (
                <li key={note} className="flex gap-2 text-xs leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
