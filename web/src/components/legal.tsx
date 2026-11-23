// Long-form layout for the public legal pages (/privacy, /terms), in the same
// LegalPage shape as SpendVault and AdVault: site header, big title, effective
// date, an accent-ruled summary, a contents box, then prose. Restyled onto
// MealMargin's own theme tokens (ink / muted / line / accent in globals.css) so
// it follows light and dark mode like the rest of the site. Server components
// only.
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

// Per-app alias; Cloudflare Email Routing forwards it to the shared inbox.
export const CONTACT_EMAIL = "mealmargin@3pandalabs.com";
export const LAST_UPDATED = "November 22, 2026";

export type TocEntry = { id: string; title: string };

export function LegalPage({
  title,
  intro,
  toc,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  toc: TocEntry[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-16 sm:px-6">
        <p className="text-sm">
          <Link href="/" className="text-muted hover:text-ink hover:underline">
            &larr; Back to MealMargin
          </Link>
        </p>
        <article className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated: {LAST_UPDATED}</p>
          <div className="mt-6 space-y-4 border-l-2 border-accent/50 pl-4 text-base leading-relaxed sm:text-lg">
            {intro}
          </div>
          {toc.length ? (
            <nav aria-label="Contents" className="mt-10 rounded-xl border border-line bg-card p-5 backdrop-blur-sm">
              <p className="font-mono text-xs tracking-widest text-accent uppercase">Contents</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                {toc.map((e) => (
                  <li key={e.id}>
                    <a href={`#${e.id}`} className="text-ink hover:text-accent hover:underline">
                      {e.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="[&_li>strong]:font-medium [&_strong]:text-ink">{children}</div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mt-12 mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 leading-relaxed text-muted [&_li]:leading-relaxed">{children}</div>
    </section>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 mb-2 text-base font-semibold text-ink">{children}</h3>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export function Mail({ to = CONTACT_EMAIL }: { to?: string }) {
  return (
    <a href={`mailto:${to}`} className="text-accent underline underline-offset-2 hover:opacity-80">
      {to}
    </a>
  );
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-accent underline underline-offset-2 hover:opacity-80">
      {children}
    </Link>
  );
}
