import { cn } from "@/lib/format";

export function Chip({
  children,
  color,
  className,
  title,
}: {
  children: React.ReactNode;
  /** Hex accent; when given, the chip is tinted with it instead of the default. */
  color?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-tight",
        color ? "" : "border-line bg-surface text-muted",
        className,
      )}
      style={
        color
          ? {
              borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              color,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

/** Small green "veg" / red "non-veg" square, the way every Indian menu marks it. */
export function DietMark({ veg, vegan }: { veg: boolean; vegan?: boolean }) {
  const color = veg ? "#0f8a3d" : "#b91c1c";
  return (
    <span
      className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border"
      style={{ borderColor: color }}
      title={vegan ? "Vegan" : veg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={vegan ? "Vegan" : veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
    </span>
  );
}
