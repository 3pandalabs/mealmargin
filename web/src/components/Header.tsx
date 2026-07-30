import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <span className="flex items-center gap-2.5">
          <Image
            src="/panda-mark.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="text-base font-semibold tracking-tight">MealMargin</span>
          {/* Shared attribution tag — see 3pandalabs/brand, attribution/. */}
          <span className="attribution-divider" aria-hidden="true" />
          <a
            className="attribution-link"
            href="https://3pandalabs.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            by 3PandaLabs
          </a>
        </span>
        <p className="text-xs text-muted sm:text-sm">
          The same food, three prices. Find the cheapest checkout.
        </p>
      </div>
    </header>
  );
}
