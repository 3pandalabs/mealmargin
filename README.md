# MealMargin

**The same food, three prices.** MealMargin prices one identical cart side by
side across **Swiggy**, **Zomato** and the **ONDC network** (Paytm / Magicpin),
itemised down to every line a real checkout shows — commission markup, platform
fee, packaging and handling, distance- and surge-based delivery, 5% GST on food
and 18% on fees — then applies memberships, coupons and bank offers
automatically and tells you which column to actually tap.

Live at **https://mealmargin.3pandalabs.com**

## Why

The same dish from the same kitchen routinely differs by ₹100+ across apps, and
almost none of that is the food. Swiggy and Zomato charge restaurants roughly
25-30% commission, which is inside the menu price before a single fee lands; the
ONDC network charges 3-5%, but has no captive fleet to subsidise the rider. So
"ONDC is cheaper" is only true within a band — and the band moves with your cart
size, your distance, the hour, your membership and the card in your wallet.
MealMargin makes that band visible instead of arguable.

## What it does

- **Side-by-side checkout matrix** — three columns, one row per real fee, stacked
  cheapest-first on mobile.
- **Membership optimiser** — Swiggy One / Zomato Gold waive delivery and add a
  member discount, and the engine knows those don't stack with a coupon; it takes
  whichever is worth more and says what it dropped.
- **Coupon and bank-offer auto-matcher** — tick the cards you hold; every valid
  code is evaluated and the best combination applied.
- **Dietary mode** — vegetarian and vegan filters over both the menu and the
  search, with pure-veg kitchens flagged.
- **Small vs large order advice** — a sweep across cart values showing exactly
  where the winner flips, with a marker for where your cart sits.

## Stack

Next.js 16 (App Router, React 19) + Tailwind CSS 4, deployed to Cloudflare
Workers via `@opennextjs/cloudflare`. **No backend**: no API, no database, no
object storage. Every number is computed in the browser from the dataset in
`web/src/lib/`, which makes the whole thing testable without mocking anything.

## Layout

```
web/
  src/app/          route + layout + the ops-only /metrics handler
  src/components/   presentational components; Optimizer.tsx holds all state
  src/lib/          the dataset and the engine (pure functions, no React)
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
columns are the point. Swiggy, Zomato, ONDC and the bank names shown are
trademarks of their respective owners; MealMargin is not affiliated with any of
them.

---

An app by [3PandaLabs](https://3pandalabs.com).
