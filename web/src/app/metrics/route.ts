import { CHANNELS } from "@/lib/channels";
import { DISHES } from "@/lib/dishes";
import { LOCALITIES } from "@/lib/localities";
import { BANK_OFFERS, COUPONS } from "@/lib/offers";
import { RESTAURANTS } from "@/lib/restaurants";

// Ops-only endpoint, scraped by the admin page (admin.3pandalabs.com). The
// admin Worker calls this server-side and holds the token as a Worker secret,
// so it never reaches a browser.
//
// The response envelope — app / collectedAt / uptimeSeconds / counts / traffic /
// process / database — is shared verbatim across every 3PandaLabs app so the
// admin page's rendering script stays generic. The `counts` keys are the
// per-app part and are free to change; the shape around them is not.
//
// TWO DELIBERATE DEVIATIONS from the other apps, both forced by this app having
// no `api/` at all — it is a Worker serving a static-ish page, not a Fastify
// container:
//
//   1. `database` is null. There is no database; every price is computed in the
//      browser. The admin renderer skips null values and leaves the "—"
//      placeholder, so this degrades cleanly rather than printing a zero.
//   2. `process` and `traffic` are best-effort. A Worker isolate has no
//      process.uptime()/memoryUsage() and is created and destroyed constantly,
//      so an in-isolate request ring (collector.ts in the other apps) would
//      count a meaningless fraction of real traffic. Worker request volume is
//      already in Cloudflare's own observability, which is where it should be
//      read from — reporting a wrong number here would be worse than reporting
//      none.
//
// Do not "fix" these by copying collector.ts in: it depends on Node's process
// API and on a long-lived process, and this app has neither.

export const dynamic = "force-dynamic";

const APP = "mealmargin";

// Isolate start, not deploy time. Named `uptimeSeconds` to match the shared
// envelope; read it as "age of the isolate that answered this request".
const bootedAt = Date.now();

/** Constant-time string compare. Length is not the part worth hiding, so an
 *  early length check is fine; the byte loop is what must not short-circuit. */
function tokenMatches(presented: string, expected: string): boolean {
  if (presented.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < presented.length; i += 1) {
    diff |= presented.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET(request: Request): Promise<Response> {
  const expected = process.env.METRICS_TOKEN;
  if (!expected) {
    // Unset rather than wrong: the Worker still serves the site without the
    // secret, so a missing ops credential can never brick a deploy.
    return Response.json(
      { error: "metrics_disabled" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!tokenMatches(presented, expected)) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const menuEntries = RESTAURANTS.reduce((sum, restaurant) => sum + restaurant.menu.length, 0);

  return Response.json(
    {
      app: APP,
      collectedAt: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - bootedAt) / 1000),
      // The catalogue is this app's entire state, so its size is the only
      // "count" that means anything. It changes on deploy, not on use.
      counts: {
        localities: LOCALITIES.length,
        restaurants: RESTAURANTS.length,
        dishes: DISHES.length,
        vegDishes: DISHES.filter((dish) => dish.veg).length,
        veganDishes: DISHES.filter((dish) => dish.vegan).length,
        menuEntries,
        channels: CHANNELS.length,
        coupons: COUPONS.length,
        bankOffers: BANK_OFFERS.length,
      },
      traffic: {
        // See the header comment: null, not a misleading per-isolate count.
        apiRequestsLastHour: null,
      },
      process: {
        rssBytes: null,
        heapUsedBytes: null,
        cpuPercentOfOneCore: null,
      },
      database: null,
      notes: "Cloudflare Worker, no API container and no database — see src/app/metrics/route.ts.",
    },
    { headers: { "cache-control": "no-store" } },
  );
}
