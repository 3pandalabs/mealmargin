import { cn } from "@/lib/format";

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeading({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
      {right}
    </div>
  );
}
