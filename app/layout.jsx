import "./globals.css";
import GalaxyBackground from "./components/GalaxyBackground";
import NavBar from "./components/NavBar";
import ScrollFade from "./components/ScrollFade";
import Script from "next/script";
import Head from "next/head";

export const metadata = {
  title: "King Values | #1 Anime Vanguards Value List & Trading Hub",
  description:
    "The #1 Anime Vanguards Value List & Trading Hub — updated daily with accurate, community-led unit values, fair trade comparisons, and live rankings. Trusted by top players for verified AV values, tier lists, and real-time trading insights.",
     icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
    alternates: {
  canonical: "https://king-values.com",
},
robots: {
  index: true,
  follow: true,
},
    keywords: [
    "Anime Vanguards",
    "AV Values",
    "AV Value List",
    "Vanguards Values",
    "Vanguards Trading Hub",
    "Anime Vanguards Trading",
    "AV Trade Hub",
    "King Values",
    "Anime Vanguards Value List",
    "AV Trade Calculator",
    "Anime Vanguards Trade Hub",
    "AV Trading Site",
    "Anime Vanguards Values",
    "Anime Vanguards Trading Website"
  ],

openGraph: {
    title: "King Values | #1 Anime Vanguards Value List & Trade Hub",
    description: "Accurate Values You Can Trust & Rely On", //Discord text
    url: "https://king-values.com",
    siteName: "King Values",
    images: [
      {
        url: "https://king-values.com/og-banner.png",
        width: 1200,
        height: 630,
        alt: "King Values — Anime Vanguards Value List and Trading Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // ✅ Twitter card — same trick to suppress text in embeds
  twitter: {
    card: "summary_large_image",
    title: "King Values | #1 Anime Vanguards Value List & Trade Hub",
    description: "Accurate Values You Can Trust & Rely On", // hide description on Twitter/Discord
    images: ["https://king-values.com/og-banner.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden text-white bg-black">
        <GalaxyBackground />
        <ScrollFade />
        <NavBar />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W1WQTFYLGZ"
          strategy="afterInteractive"
        />
{/* --- Google Organization Schema --- */}
<Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "King Values",
    url: "https://king-values.com",
    logo: "https://king-values.com/logo.png",
    sameAs: [
      "https://discord.gg/cUGkAtsFNT",
      "https://twitter.com/KingValues",
      "https://www.youtube.com/@KingValues"
    ]
  })}
</Script>

{/* --- Website Schema --- */}
<Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://king-values.com",
    name: "King Values | Anime Vanguards Value List & Trading Hub",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://king-values.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  })}
</Script>

{/* --- Optional FAQ Schema for extra visibility --- */}
<Script id="ld-faq" type="application/ld+json" strategy="afterInteractive">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the King Values Anime Vanguards List?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "King Values provides the most accurate and community-verified Anime Vanguards (AV) value list and trading hub, updated daily."
        }
      },
      {
        "@type": "Question",
        name: "How often are the values updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Our team updates values every 24 hours with live trade data and verified market trends."
        }
      }
    ]
  })}
</Script>
<Script id="ld-org" type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "King Values",
  url: "https://king-values.com",
  logo: "https://king-values.com/og-banner.png",
  sameAs: [
    "https://www.youtube.com/@King_Mo3211",
    "https://discord.gg/cUGkAtsFNT"
  ],
  description: "Anime Vanguards Value List and Trade Hub for Roblox — Accurate values and real-time community trades."
})}
</Script>
        <main className="relative z-10 pt-28">{children}</main>
      </body>
    </html>
  );
}
