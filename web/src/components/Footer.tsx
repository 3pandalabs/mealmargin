export function Footer() {
  return (
    <footer className="mt-12 border-t border-line px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <p className="max-w-3xl text-xs leading-relaxed text-muted">
          <strong className="font-semibold text-ink">How to read these numbers.</strong>{" "}
          MealMargin is a fee-structure simulator, not a live price feed. Menu prices, platform
          fees, packaging, surge multipliers, coupons and card offers are modelled from publicly
          reported structures — roughly 25-30% restaurant commission on Swiggy and Zomato against
          3-5% on the ONDC network, 5% GST on food and 18% on fees. A real checkout will differ by
          a few rupees. The relationships between the three columns are the point, not the absolute
          totals. Swiggy, Zomato, ONDC, and the bank and card names shown are trademarks of their
          respective owners; MealMargin is not affiliated with any of them.
        </p>
        <div className="flex flex-wrap justify-between gap-2 text-sm text-muted">
          <span>&copy; 3PandaLabs LLC, USA.</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
