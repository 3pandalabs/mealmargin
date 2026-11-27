import type { CSSProperties } from "react";
import { ArrowDown, Bike, MapPin, ReceiptText, ShoppingBasket, Store } from "lucide-react";
import { Comparison } from "@/components/Comparison";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { DISH_BY_ID } from "@/lib/dishes";
import { rupees } from "@/lib/format";
import { LOCALITY_BY_ID } from "@/lib/localities";
import { compare, type Preferences, type RestaurantResult } from "@/lib/recommend";
import type { Quote } from "@/lib/pricing";
import type { CartLine, ChannelId } from "@/lib/types";
import "./home.css";

// Single route, single page: a landing section that shows the product working,
// then the comparison tool itself under #compare. Every number in the landing
// section is produced by the same pure engine the tool uses (src/lib), run at
// render time with promos off — so the hero can never drift from what the tool
// would say, and it is labelled as a modelled example, not a live price.

const EXAMPLE_CART: CartLine[] = [
  { dishId: "kadhai-paneer", quantity: 1 },
  { dishId: "tandoori-roti", quantity: 3 },
];

const STRUCTURAL: Preferences = {
  fulfillment: "delivery",
  peak: false,
  memberships: { swiggy: false, zomato: false, ondc: false, pickup: false },
  banks: [],
  usePromos: false,
};

const SCENE_LOCALITIES = ["dwarka", "indiranagar", "andheri-west"];
const SCENE_SECONDS = 7;

interface Scene {
  area: string;
  city: string;
  result: RestaurantResult;
  max: number;
}

function buildScenes(): Scene[] {
  const scenes: Scene[] = [];
  for (const id of SCENE_LOCALITIES) {
    const locality = LOCALITY_BY_ID.get(id);
    if (!locality) continue;
    const { results } = compare(id, EXAMPLE_CART, STRUCTURAL);
    // Prefer a kitchen listed on every channel, so all four bars have a number.
    const result =
      results.find((r) => r.quotes.every((q) => q.available) && r.pickup) ?? results[0];
    if (!result) continue;
    const max = Math.max(...result.quotes.filter((q) => q.available).map((q) => q.total));
    scenes.push({ area: locality.area, city: locality.city, result, max });
  }
  return scenes;
}

const basketLabel = EXAMPLE_CART.map(
  (line) => `${line.quantity} × ${DISH_BY_ID.get(line.dishId)?.name ?? line.dishId}`,
).join(" + ");

const MARQUEE = [
  "Swiggy",
  "Zomato",
  "ONDC network",
  "Direct pickup",
  "Commission inside the menu",
  "Platform fees",
  "Packaging",
  "Rider fares",
  "Surge",
  "5% GST on food",
  "18% GST on fees",
  "Memberships",
  "Coupons",
  "Bank offers",
];

const STEPS = [
  {
    icon: MapPin,
    title: "Say where you are",
    body: "Pick your locality. Every kitchen shown, every delivery fare and every walk time is worked out from there.",
  },
  {
    icon: ShoppingBasket,
    title: "Build the meal",
    body: "Add the dishes you actually want. Only kitchens that serve all of it are compared, because splitting one meal across two restaurants means paying two sets of fees.",
  },
  {
    icon: ReceiptText,
    title: "See every checkout",
    body: "That exact basket, priced on Swiggy, Zomato, the ONDC network and at the counter, itemised down to the fee, cheapest first.",
  },
];

export default function HomePage() {
  const scenes = buildScenes();
  const lead = scenes[0];

  return (
    <>
      <Header />
      <main className="mm-home">
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-20 lg:pb-20">
          <div>
            <p className="mm-card inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted">
              <span className="mm-live size-2 rounded-full bg-accent" />
              Delivery vs direct pickup, fee by fee
            </p>
            <h1 className="mm-display mt-5 text-[2.5rem] leading-[1.04] font-extrabold text-balance sm:text-6xl">
              The same meal,{" "}
              <span className="mm-scribble">
                <span className="mm-shimmer">priced four ways</span>
                <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M3 14 C 70 4, 150 4, 297 11"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Say where you are and what you want to eat. MealMargin prices that exact basket at
              every kitchen near you that serves all of it — on Swiggy, on Zomato, on the ONDC
              network, and at the counter if you fetch it yourself.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#compare" className="mm-btn inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold">
                Price my meal
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#how"
                className="mm-ghost mm-card rounded-xl px-6 py-3.5 text-base font-semibold text-ink hover:border-accent/60"
              >
                How it works
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3 text-center">
              {[
                ["~26-28%", "Swiggy / Zomato commission"],
                ["3-5%", "ONDC commission"],
                ["0%", "At the counter"],
              ].map(([value, label]) => (
                <div key={label} className="mm-card rounded-xl px-2 py-3">
                  <dt className="sr-only">{label}</dt>
                  <dd className="mm-display text-xl font-extrabold sm:text-2xl">{value}</dd>
                  <dd className="mt-0.5 text-[11px] leading-tight text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {scenes.length > 0 && <ReceiptRace scenes={scenes} />}
        </section>

        {/* ---------- Marquee ---------- */}
        <section aria-label="What gets priced" className="mm-marquee border-y border-line bg-card py-4">
          <div className="mm-marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1 || undefined} className="flex">
                {MARQUEE.map((t) => (
                  <span
                    key={t}
                    className="mm-display flex items-center gap-6 px-6 text-lg font-semibold whitespace-nowrap text-muted sm:text-2xl"
                  >
                    {t}
                    <span className="text-accent" aria-hidden="true">
                      •
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead
            eyebrow="How it works"
            title={
              <>
                Where you are, what you want, <span className="mm-shimmer">what it really costs.</span>
              </>
            }
          />
          <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
            <div aria-hidden="true" className="mm-dash absolute top-7 right-[16%] left-[16%] hidden h-[2px] md:block" />
            {STEPS.map((step, i) => (
              <li key={step.title} className="mm-tile mm-card relative rounded-2xl p-6">
                <span className="relative grid size-14 place-items-center rounded-2xl bg-accent text-accent-fg shadow-lg">
                  <step.icon className="size-6" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-line bg-page text-xs font-bold text-ink">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Where the money goes ---------- */}
        {lead && <MoneyBreakdown scene={lead} />}

        {/* ---------- The tool ---------- */}
        <section id="compare" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Try it</p>
            <h2 className="mm-display mt-2 text-2xl font-bold sm:text-3xl">Price your meal</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Say where you are and what you want to eat. MealMargin prices that exact basket at
              every kitchen near you that serves all of it — on Swiggy, on Zomato, on the ONDC
              network, and at the counter if you fetch it yourself. Swiggy and Zomato bake roughly
              26-28% commission into the menu before a single fee lands; ONDC takes 3-5%; the
              counter takes none. Walking in is usually the cheapest thing you can do, and this shows
              you by exactly how much.
            </p>
          </div>
          <ComparisonProvider>
            <Comparison />
          </ComparisonProvider>
        </section>

        {/* ---------- Closing CTA ---------- */}
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="mm-glow relative overflow-hidden rounded-[2rem] border border-line px-6 py-14 text-center sm:py-20">
            <h2 className="mm-display mx-auto max-w-2xl text-3xl leading-tight font-extrabold text-balance sm:text-5xl">
              Walking in is usually <span className="mm-shimmer">the cheapest thing you can do.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Find out by exactly how much for your meal, near you. No account, nothing to install.
            </p>
            <a href="#compare" className="mm-btn mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold">
              Price my meal
              <ArrowDown className="size-5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
      <h2 className="mm-display mt-3 text-3xl leading-tight font-extrabold text-balance sm:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-muted sm:text-lg">{body}</p>}
    </div>
  );
}

function sceneStyle(i: number, extra?: Record<string, string | number>): CSSProperties {
  return { "--scene-delay": `${i * SCENE_SECONDS}s`, ...extra } as CSSProperties;
}

function ReceiptRace({ scenes }: { scenes: Scene[] }) {
  return (
    <div className="relative mx-auto w-full max-w-md py-4" role="img" aria-label={`Modelled example: ${basketLabel} priced four ways, with direct pickup cheapest`}>
      {/* Fee chips that the counter does not charge. */}
      <span className="mm-chip mm-card absolute -top-1 -left-2 z-10 rounded-full px-3 py-1 text-xs font-semibold text-muted shadow sm:-left-8" style={{ "--tilt": "-6deg" } as CSSProperties}>
        + platform fee
      </span>
      <span className="mm-chip mm-card absolute -top-1 right-2 z-10 rounded-full px-3 py-1 text-xs font-semibold text-muted shadow sm:-right-6" style={{ "--tilt": "5deg", "--chip-delay": "1.5s" } as CSSProperties}>
        + rider fare
      </span>
      <span className="mm-chip mm-card absolute -bottom-1 left-6 z-10 rounded-full px-3 py-1 text-xs font-semibold text-muted shadow" style={{ "--tilt": "-3deg", "--chip-delay": "3s" } as CSSProperties}>
        + commission in the menu
      </span>

      <div className="mm-race mm-card relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBasket className="size-4 text-accent" aria-hidden="true" />
            {basketLabel}
          </div>
          <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted uppercase">
            Example
          </span>
        </div>

        <div className="relative mt-4">
          {scenes.map((scene, i) => {
            const { result } = scene;
            return (
              <div key={scene.area} className="mm-scene" style={sceneStyle(i)} data-first={i === 0 || undefined}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-bold">{result.restaurant.name}</p>
                  <p className="flex shrink-0 items-center gap-1 text-xs text-muted">
                    <MapPin className="size-3" aria-hidden="true" />
                    {scene.area}, {scene.city}
                  </p>
                </div>
                <ul className="mt-4 space-y-3">
                  {result.quotes.map((quote, row) => (
                    <RaceRow key={quote.channel.id} quote={quote} max={scene.max} scene={i} row={row} />
                  ))}
                </ul>
                {result.pickup && result.pickupSaving > 0 && (
                  <p
                    className="mm-win mt-5 flex items-center gap-2 rounded-xl bg-accent/12 px-3 py-2 text-sm font-semibold text-accent"
                    style={sceneStyle(i)}
                    data-first={i === 0 || undefined}
                  >
                    <Store className="size-4 shrink-0" aria-hidden="true" />
                    Walk in and save {rupees(result.pickupSaving)} (
                    {Math.round(result.pickupSavingPercent)}%) vs the cheapest delivery
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] leading-snug text-muted">
          Modelled with promos off, not a live price. Kitchen names are invented.
        </p>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-surface">
          {scenes.map((scene, i) => (
            <span key={scene.area} className="mm-progress absolute inset-0 bg-accent" style={sceneStyle(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

const CHANNEL_ICON: Record<ChannelId, typeof Bike> = {
  swiggy: Bike,
  zomato: Bike,
  ondc: Bike,
  pickup: Store,
};

function RaceRow({ quote, max, scene, row }: { quote: Quote; max: number; scene: number; row: number }) {
  const Icon = CHANNEL_ICON[quote.channel.id];
  const width = quote.available && max > 0 ? Math.max(8, (quote.total / max) * 100) : 0;
  return (
    <li>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <Icon className="size-3.5" style={{ color: quote.channel.color }} aria-hidden="true" />
          {quote.channel.name}
        </span>
        <span className="font-semibold tabular-nums">{quote.available ? rupees(quote.total) : "Not listed"}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface">
        {quote.available && (
          <div
            className="mm-bar h-full rounded-full"
            style={{
              ...sceneStyle(scene, { "--row": row }),
              width: `${width}%`,
              background: quote.channel.color,
            }}
          />
        )}
      </div>
    </li>
  );
}

function MoneyBreakdown({ scene }: { scene: Scene }) {
  const { result } = scene;
  const delivered = result.bestDelivered;
  const pickup = result.pickup;
  if (!delivered || !pickup) return null;

  const parts = (q: Quote) => {
    const rows = [
      { label: "Food at the counter price", value: q.counterSubtotal, tone: "#64748b" },
      { label: "Commission inside the menu", value: q.commissionComponent, tone: "#ef4444" },
      { label: "Packaging", value: q.packaging, tone: "#f59e0b" },
      { label: "Platform fee", value: q.platformFee, tone: "#a855f7" },
      { label: "Delivery", value: q.delivery, tone: "#0ea5e9" },
      { label: "Taxes", value: q.taxes, tone: "#14b8a6" },
    ];
    const gross = rows.reduce((s, r) => s + r.value, 0);
    // Restaurant-funded offers apply even with promo codes off; anything left
    // over is the engine's whole-rupee rounding.
    const offer = q.restaurantDiscount;
    const offerLabel = q.restaurantOffer?.label;
    const off = gross - offer - q.total;
    return { rows: rows.filter((r) => r.value > 0), gross, offer, offerLabel, off };
  };

  const columns = [
    { title: `Cheapest delivery · ${delivered.channel.name}`, quote: delivered, ...parts(delivered) },
    { title: "Direct pickup · at the counter", quote: pickup, ...parts(pickup) },
  ];
  const scale = Math.max(...columns.map((c) => c.gross));

  return (
    <section className="border-y border-line bg-card py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Where the money goes"
          title={
            <>
              The counter price is the price. <span className="mm-shimmer">Everything else is added.</span>
            </>
          }
          body={`Example: ${basketLabel} at ${result.restaurant.name}, ${scene.area}. Same kitchen, same food, itemised.`}
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {columns.map((col, ci) => (
            <div key={col.title} className={`mm-tile rounded-2xl border p-5 sm:p-6 ${ci === 1 ? "border-accent/50 bg-accent/5" : "border-line bg-page/60"}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-bold">{col.title}</h3>
                <p className="mm-display text-2xl font-extrabold tabular-nums">{rupees(col.quote.total)}</p>
              </div>
              <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-surface" aria-hidden="true">
                {col.rows.map((r, i) => (
                  <span
                    key={r.label}
                    className="mm-stack h-full"
                    style={{ width: `${(r.value / scale) * 100}%`, background: r.tone, "--row": `${i * 0.12}s` } as CSSProperties}
                  />
                ))}
              </div>
              <dl className="mt-5 space-y-2 text-sm">
                {col.rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-muted">
                      <span className="size-2.5 shrink-0 rounded-sm" style={{ background: r.tone }} />
                      {r.label}
                    </dt>
                    <dd className="font-medium tabular-nums">{rupees(r.value)}</dd>
                  </div>
                ))}
                {col.offer > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="pl-4.5 text-muted">
                      Restaurant&apos;s own offer{col.offerLabel ? ` (${col.offerLabel})` : ""}
                    </dt>
                    <dd className="font-medium text-accent tabular-nums">−{rupees(col.offer)}</dd>
                  </div>
                )}
                {col.off !== 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="pl-4.5 text-muted">Rounding</dt>
                    <dd className="font-medium tabular-nums">{col.off > 0 ? "−" : "+"}{rupees(Math.abs(col.off))}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-dashed border-line pt-2 font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{rupees(col.quote.total)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
          Modelled with promos off. Takeaway still needs containers, so packaging is counted on
          pickup too. Switch promo codes on in the tool to see when a coupon flips the answer.
        </p>
      </div>
    </section>
  );
}
