import { Comparison } from "@/components/Comparison";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ComparisonProvider } from "@/context/ComparisonContext";

// Single route, single page. Everything interactive lives under the provider;
// this file renders the static chrome around it on the server.
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The same meal, priced four ways
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            Say where you are and what you want to eat. MealMargin prices that exact basket at every
            kitchen near you that serves all of it — on Swiggy, on Zomato, on the ONDC network, and
            at the counter if you fetch it yourself. Swiggy and Zomato bake roughly 26-28%
            commission into the menu before a single fee lands; ONDC takes 3-5%; the counter takes
            none. Walking in is usually the cheapest thing you can do, and this shows you by exactly
            how much.
          </p>
        </div>
        <ComparisonProvider>
          <Comparison />
        </ComparisonProvider>
      </main>
      <Footer />
    </>
  );
}
