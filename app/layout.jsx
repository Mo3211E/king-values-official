"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import "./globals.css";
import GalaxyBackground from "./components/GalaxyBackground";
import NavBar from "./components/NavBar";
import ScrollFade from "./components/ScrollFade";

const MobileLayout = dynamic(() => import("./mobile/MobileLayout"), { ssr: false });

export const metadata = {
  title: "King Values | #1 Anime Vanguards Value List & Trading Hub",
  description:
    "The #1 Anime Vanguards Value List & Trading Hub — updated daily with accurate, community-led unit values, fair trade comparisons, and live rankings. Trusted by top players for verified AV values, tier lists, and real-time trading insights.",

  // ✅ Favicon + Apple Touch + SEO icon metadata
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
    "Anime Vanguards Trading Website",
  ],

  openGraph: {
    title: "King Values | #1 Anime Vanguards Value List & Trade Hub",
    description: "Accurate Values You Can Trust & Rely On",
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

  twitter: {
    card: "summary_large_image",
    title: "King Values | #1 Anime Vanguards Value List & Trade Hub",
    description: "Accurate Values You Can Trust & Rely On",
    images: ["https://king-values.com/og-banner.png"],
  },
};

export default function RootLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <html lang="en">
      <head>
        {/* ✅ Ensures Google recognizes your logo and brand */}
        <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#000000" />

        {/* ✅ Google site verification for ranking (add your code below if needed) */}
        {/* <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" /> */}
      </head>

      <body className="relative overflow-x-hidden text-white bg-black" suppressHydrationWarning>
        {isMobile ? (
          <MobileLayout>{children}</MobileLayout>
        ) : (
          <>
            <GalaxyBackground />
            <ScrollFade />
            <NavBar />
            <main className="relative z-10 pt-28">{children}</main>
          </>
        )}

        {/* ✅ Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W1WQTFYLGZ"
          strategy="afterInteractive"
        />
        <Script id="ga-setup" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W1WQTFYLGZ');
          `}
        </Script>

        {/* ✅ Organization schema (shows your logo on Google) */}
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
              "https://www.youtube.com/@King_Mo3211",
            ],
            description:
              "King Values — Anime Vanguards Value List & Trade Hub for Roblox. Accurate values, fair trade data, and real-time updates.",
          })}
        </Script>

        {/* ✅ Website Schema (Search Action) */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://king-values.com",
            name: "King Values | Anime Vanguards Value List & Trading Hub",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://king-values.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>

        {/* ✅ FAQ Schema for Featured Snippet Boost */}
        <Script id="ld-faq" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is King Values?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "King Values is the #1 verified Anime Vanguards (AV) value list and trading hub, providing accurate, community-led data updated daily.",
                },
              },
              {
                "@type": "Question",
                name: "How often are values updated?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    "Values are refreshed every 24 hours using verified trade data, ensuring fairness and reliability.",
                },
              },
            ],
          })}
        </Script>
      </body>
    </html>
  );
}
