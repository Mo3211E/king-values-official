import Script from "next/script";
import "./globals.css";
import ClientLayout from "./ClientLayout";

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
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#000000" />
      </head>

      <body className="relative overflow-x-hidden text-white bg-black" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>

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

        {/* ✅ Organization Schema for Logo */}
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
      </body>
    </html>
  );
}
