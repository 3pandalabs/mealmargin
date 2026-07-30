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
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "MealMargin" }],
  },
  // All four are crops of the same source tile (see public/README-icons.md).
  // Declared explicitly rather than relying on file-convention icons, because
  // the 32px favicon needs to be a separate downscale — letting the browser
  // shrink the 512 turns the plate into mush in a tab strip.
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
