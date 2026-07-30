# MealMargin

**The same meal, four prices.** Say where you are and what you want to eat.
MealMargin prices that exact basket at every kitchen near you that serves all of
it — on **Swiggy**, on **Zomato**, on the **ONDC network** (Paytm / Magicpin),
and at the **counter if you fetch it yourself** — itemised down to every line a
real checkout shows: commission inside the menu price, platform fee, packaging
and handling, distance- and surge-based delivery, 5% GST on food and 18% on
fees. Then it applies memberships, coupons and card offers and tells you where
to actually buy it.

Live at **https://mealmargin.3pandalabs.com**

## Why

The same dish from the same kitchen routinely differs by ₹100+ depending on how
you buy it, and almost none of that is the food. Swiggy and Zomato charge
restaurants roughly 25-30% commission, baked into the menu price before a single
fee lands; the ONDC network charges 3-5% but has no fleet to subsidise the
rider; the counter charges nothing at all.

So **collecting it yourself is usually the cheapest thing you can do** — 6-31%
on a typical basket, and around 36% on a ₹250 one, because the platform and
delivery fees are flat and hit small bills hardest. Nobody surfaces that, since
nobody in the chain is paid to.

## What it does

- **Location-first search** — pick your locality, build the exact meal ("1 kadhai
  paneer, 3 tandoori roti"), and every kitchen nearby that serves *all* of it is
  priced four ways.
- **Pickup savings counter** — the rupee and percentage difference between the
  cheapest delivery and the counter, per kitchen, with the walk or drive time so
  you can judge whether it's worth it.
- **Delivery / self-pickup toggle** — and in pickup mode it still shows that app
  takeaway pays the app's marked-up price; only the counter avoids the
  commission.
- **Membership optimiser** — Swiggy One / Zomato Gold waive delivery and add a
  member discount, and the engine knows those don't stack with a coupon; it takes
  whichever is worth more and says what it dropped.
- **Coupon and card-offer auto-matcher**, with a **promo toggle** — because
  assuming a 60%-off code on every order is not a neutral default. Switch it off
  for the structural comparison.
- **Dietary mode** — vegetarian and vegan filters, pure-veg kitchens flagged.
- **Cart-size advice** — the same meal re-priced small and large, so "pickup
  saves X%" is never quoted as if it were a constant.

## Stack

Next.js 16 (App Router, React 19) + Tailwind CSS 4, deployed to Cloudflare
Workers via `@opennextjs/cloudflare`. **No backend**: no API, no database, no
object storage. Every number is computed in the browser from the dataset in
`web/src/lib/`, which makes the whole thing testable without mocking anything.

## Layout

```
web/
  src/app/          route + layout + the ops-only /metrics handler
  src/context/      ComparisonContext — all state, one provider
  src/components/   presentational only; they read the context
  src/lib/          the dataset and the engine (pure functions, no React)
    localities.ts   where you are — the entry point for everything else
    dishes.ts       canonical dishes + aliases, so one basket prices anywhere
    restaurants.ts  25 kitchens, 5 per locality, tier-priced
    channels.ts     Swiggy / Zomato / ONDC / counter, and their fee structures
    pricing.ts      quoteFor() — one checkout, itemised
    recommend.ts    ranking, pickup savings, advice
infra/              runbooks
```

## Develop

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm run cf:preview   # build for Workers and preview locally
npm run cf:deploy    # deploy (manual — there is no auto-deploy in this org)
```

## A note on the numbers

MealMargin is a **fee-structure simulator, not a live price feed**. Menu prices,
fees, coupons and card offers are modelled from publicly reported structures and
will differ from a real checkout by a few rupees. The relationships between the
columns are the point.

**Restaurant names are invented**, deliberately generic and never national
chains — attaching a modelled price to a recognisable brand would read as a
factual claim about that business. Swiggy, Zomato, ONDC and the bank names shown
are trademarks of their respective owners; MealMargin is not affiliated with any
of them.

---

An app by [3PandaLabs](https://3pandalabs.com).
