"use client";

import { cn } from "@/lib/format";

/** Switch-style toggle. Rendered as a real <button role="switch"> so it is
 *  keyboard-operable and announced correctly, which a styled div never is. */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
  disabledReason,
  accent,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  disabledReason?: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition",
        disabled ? "cursor-not-allowed opacity-50" : "hover:border-ink/25 cursor-pointer",
      )}
    >
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "" : "bg-surface border border-line",
        )}
        style={checked ? { background: accent ?? "var(--accent)" } : undefined}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
            checked ? "left-[1.125rem]" : "left-0.5",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        {(disabled && disabledReason ? disabledReason : hint) ? (
          <span className="block text-xs text-muted">
            {disabled && disabledReason ? disabledReason : hint}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/** Segmented control — used for the diet mode, where the options are mutually
 *  exclusive and all three are worth showing at once. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string; dot?: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition",
              active ? "bg-ink text-page" : "text-muted hover:text-ink",
            )}
          >
            {option.dot ? (
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: option.dot }}
                aria-hidden="true"
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
