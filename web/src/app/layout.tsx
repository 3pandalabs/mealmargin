import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mealmargin.3pandalabs.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MealMargin — the same food, three prices",
  description:
    "Compare what one identical order actually costs on Swiggy, Zomato and the ONDC network, fee by fee, with memberships, coupons and bank offers applied automatically.",
  openGraph: {
    title: "MealMargin — the same food, three prices",
    description:
      "An itemised, side-by-side checkout comparison across Swiggy, Zomato and ONDC — commission markup, platform fee, packaging, surge delivery, GST, coupons and card offers.",
    url: siteUrl,
    siteName: "MealMargin",
    locale: "en_IN",
    type: "website",
  },
  icons: { icon: "/panda-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body className="min-h-screen antialiased">
        {/* Shared 3PandaLabs backdrop — see globals.css. */}
        <div className="backdrop" aria-hidden="true">
          <div className="backdrop-blob backdrop-blob-1" />
          <div className="backdrop-blob backdrop-blob-2" />
          <div className="backdrop-blob backdrop-blob-3" />
          <div className="backdrop-grid" />
        </div>
        {children}
      </body>
    </html>
  );
}
