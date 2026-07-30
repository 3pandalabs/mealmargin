import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Optimizer } from "@/components/Optimizer";

// Single route, single page. The whole app is the client component below; this
// file exists to render the static chrome around it on the server.
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            The same order, priced three ways
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            One kitchen, one cart, three checkouts. Swiggy and Zomato add roughly 26-28% commission
            to the menu before a single fee lands; the ONDC network takes 3-5% but nobody
            subsidises the rider. Which one is actually cheaper depends on your cart size, your
            distance, the hour, your membership and the card in your wallet — so change those below
            and watch the answer move.
          </p>
        </div>
        <Optimizer />
      </main>
      <Footer />
    </>
  );
}
