# MealMargin — repo conventions

Food-delivery price optimiser and meta-aggregator: one cart, priced side by side
across Swiggy, Zomato and the ONDC network, itemised down to the fee. Fourth
3PandaLabs product, after ReceiptCash, RentVault (`3pandalabs/nrighar`) and
RsvpVault (`3pandalabs/evitevault`).

## Naming

**MealMargin** (one word, camel case) in all user-facing copy. Every internal
identifier is lowercase `mealmargin` and stays that way: repo name, Worker
(`mealmargin-web`), hostname (`mealmargin.3pandalabs.com`), and the
`app: "mealmargin"` key in `web/src/app/metrics/route.ts` that
`3pandalabs/admin` reads. Do not introduce a third spelling.

## Monorepo layout

`web/` (Next.js on Cloudflare Workers) · `infra/` (runbooks).

**There is no `api/`, no database, no R2 bucket and no Coolify resource**, and
that is a decision rather than an omission. Every price, fee, coupon match and
recommendation is computed in the browser from the dataset in `web/src/lib/`.
Adding a backend would mean adding a deploy surface, a migration story and a
backup schedule to an app that currently has none of those failure modes.

The consequence for the launch checklist (`knowledge_base/launching-a-new-app.md`):
steps 2 (R2 buckets, CORS, Postgres role, Coolify app, backups) and the
`api/`-specific parts of step 3 do not apply here. Everything else does.

If a backend is ever added — saved carts, real price feeds, accounts — follow
RsvpVault's shape (`api/` Fastify + Drizzle on Coolify), and copy
`api/src/metrics/collector.ts` verbatim at that point.

## v2 (2026-07-30) turned the question around

v1 asked "given this restaurant, which app is cheapest?". v2 asks the question
people actually have: **"I am here, I want this meal — where and how do I buy it
for the least money?"** Three consequences run through the whole codebase:

- **Locality first.** `lib/localities.ts` is the entry point; every kitchen
  shown, every delivery fare and every walk time derives from it. There is no
  global distance slider any more — each restaurant has its own `distanceKm`
  from the locality centre.
- **Dishes are canonical.** `lib/dishes.ts` holds dishes as *concepts* with
  `aliases`, and restaurants reference them by id. This is what lets one basket
  be priced at five kitchens; a cart of free-text menu lines could only ever be
  compared against itself. Deciding that "Kadai/Kadhai/Karahi Paneer" are one
  orderable thing is the genuinely hard problem in a meta-aggregator — the fee
  arithmetic is the easy part.
- **Pickup is a fourth channel, not a footnote.** Commission 0, platform fee 0,
  no rider. It wins most structural comparisons, which is the finding the app
  exists to surface. Packaging is deliberately *not* zeroed — takeaway still
  needs containers, and zeroing it would overstate the saving.

Only kitchens serving **every** dish in the basket are compared. Splitting one
meal across two restaurants means paying two sets of fees, so a partial match is
never the cheaper answer and is not shown as one.

### The promo toggle is a correctness feature, not a preference

`usePromos` defaults on but exists because auto-applying the best coupon to
every order is **not a neutral default**. A 60%-off-capped code can make an app
beat the counter, and most repeat orders do not have one. With promos off you
get the structural comparison — commission, fees, rider — and pickup wins by
6-31% depending on the kitchen, 36% on a ₹250 basket. Both views are true; the
app shows which one you are looking at, and when a promo is what flips the
answer it says so rather than rendering a negative saving.

## The dataset is the product, so treat it as such

`web/src/lib/channels.ts`, `dishes.ts`, `restaurants.ts` and `offers.ts` are
**modelled, not scraped**. Commission rates, platform fees, packaging, surge
multipliers, coupons and bank offers are representative of publicly reported
structures — ~25-30% commission on Swiggy/Zomato against 3-5% on ONDC and 0% at
the counter, 5% GST on food and 18% on fees. They are not live and are not
claimed to be. The disclaimer in `web/src/components/Footer.tsx` says so, along
with the trademark notice; if the data ever does go live, that paragraph is the
first thing to change.

**Restaurant names are invented on purpose.** They are generic-sounding local
names, never national chains, because every price here is modelled: attaching a
made-up price to a recognisable brand would read as a factual claim about that
business. The *archetypes* are real (value bhojnalaya, sweets-and-thali house,
dhaba, hotel restaurant, modern cafe) and that is what drives the price spread
via `priceTier`. Keep it that way when adding kitchens.

Getting real prices, if that ever comes up: Swiggy and Zomato have no public API
and scraping them is against their terms; **ONDC is the only one with a
sanctioned path** (the Beckn protocol, as a registered Buyer App), and that
needs a backend this app deliberately does not have.

Keep the engine (`pricing.ts`, `recommend.ts`) pure: no React, no I/O, no
`Date.now()` in the maths. That is what lets the crossover sweep in
`recommend.ts` re-run the entire fee model a hundred times per keystroke without
anything to mock.

## Git flow

Never commit directly to `main`. Branch → PR → merge, committing as
`3pandalabs-admin` (the conditional gitconfig under `~/Documents` handles the
identity automatically). The initial scaffold PR is the one reasonable
exception, and it was called out as such when merged.

## /metrics is mandatory

Per the org convention, every app exposes an ops-only `GET /metrics` behind the
shared `METRICS_TOKEN` bearer and gets a per-app "Usage & resources" table on
admin.3pandalabs.com. Here it is a Next.js route handler
(`web/src/app/metrics/route.ts`), not a Fastify route, because there is no API.

Two fields deviate from the shared envelope and the file explains why at length:
`database` is `null` (there is no database) and `traffic`/`process` are `null`
(a Worker isolate cannot honestly report either — Cloudflare's own observability
is the right place to read Worker request volume). The admin renderer skips
nulls and leaves its `—` placeholder, so this degrades cleanly. Do **not** copy
`collector.ts` in to fill them: it needs Node's `process` API and a long-lived
process, and this app has neither.

When a route or auth boundary changes, also update this app's Mermaid flow
diagram in `3pandalabs/admin`.

## Deployment gotchas inherited from the other apps

These cost real hours elsewhere; they apply verbatim here.

- `web/package.json` build script is `next build --webpack`. Turbopack output is
  not fully supported by `@opennextjs/cloudflare` — the deploy succeeds and every
  route then 500s with `ChunkLoadError` at request time (RentVault, 2026-07-21).
- Do not add a `proxy.ts`/middleware to `web/`. The adapter cannot bundle it
  (Node-only `async_hooks`).
- `NEXT_PUBLIC_*` values go in `web/.env.production`, which is committed. They
  are inlined at *build* time, so `wrangler.jsonc` `vars` (runtime) cannot supply
  them — RsvpVault shipped a bundle pointing at localhost this way.
- `wrangler.jsonc` owns the `mealmargin.3pandalabs.com` DNS record via
  `custom_domain: true`. Do not also create one by hand in the dashboard.
- Deploy is manual: `npm run cf:deploy` from `web/`. There is no auto-deploy
  anywhere in the org.

## Accessibility and layout rules worth keeping

- Toggles are real `<button role="switch">` elements, the diet selector is a real
  `radiogroup`. Keep them that way — a styled `div` is not operable by keyboard.
- The comparison grid stacks cheapest-first on mobile and restores the fixed
  Swiggy/Zomato/ONDC order at `lg`. Order classes are written out literally
  (`order-1`…) because Tailwind scans source text and would never see an
  interpolated class name.
