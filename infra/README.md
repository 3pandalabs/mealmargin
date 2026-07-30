# infra — MealMargin

Deliberately thin, because this app's whole infrastructure is one Cloudflare
Worker. There is no Hetzner container, no Postgres database or role, no R2
bucket, no Coolify resource and no backup schedule — see the root `CLAUDE.md`
for why that is a decision rather than an omission.

## Deploy

Manual, from a dev machine. There is no auto-deploy anywhere in the org.

```bash
cd web
npm install
npm run cf:deploy
```

`wrangler.jsonc` declares `mealmargin.3pandalabs.com` as a `custom_domain`
route, so **wrangler creates and owns that DNS record**. Never add a matching
record by hand in the Cloudflare dashboard — two owners for one hostname is how
you get a deploy that silently stops taking traffic.

## The one secret

`METRICS_TOKEN` — the shared org-wide ops token that gates `GET /metrics`.

```bash
cd web
npx wrangler secret put METRICS_TOKEN
```

It is deliberately **optional**: with it unset the endpoint answers `503
metrics_disabled` and the site serves normally, so a missing ops credential can
never brick a deploy. `3pandalabs/admin` distinguishes that 503 from a bad token
and says which in the dashboard.

Verify after setting it:

```bash
curl -s https://mealmargin.3pandalabs.com/metrics | head -c 200          # 401
curl -s -H "authorization: Bearer $METRICS_TOKEN" \
  https://mealmargin.3pandalabs.com/metrics | head -c 400                # JSON
```

## Rollback

Cloudflare keeps prior Worker versions:

```bash
cd web
npx wrangler deployments list
npx wrangler rollback --message "reason"
```

Because there is no database, a rollback is total — there is no migration to
reverse and no data written by the newer version to reconcile.

## What to check after a deploy

1. `https://mealmargin.3pandalabs.com/` renders and the comparison grid is
   populated (the cart is seeded, so three filled columns is the correct first
   paint — three empty ones means the client bundle did not run).
2. Change the distance slider and toggle a membership: the totals must move.
   This is the check that catches a broken client bundle, which server-side
   rendering will otherwise hide.
3. `GET /metrics` behaves as above.
