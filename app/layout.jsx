import "./globals.css";
import GalaxyBackground from "./components/GalaxyBackground";
import NavBar from "./components/NavBar";
import ScrollFade from "./components/ScrollFade";

export const metadata = {
  title: "King Values | #1 Anime Vanguards Value List & Trading Hub",
  description:
    "The #1 Anime Vanguards Value List & Trading Hub — updated daily with accurate, community-led unit values, fair trade comparisons, and live rankings. Trusted by top players for verified AV values, tier lists, and real-time trading insights.",
  
  // 👇 OpenGraph (for Discord/FB) — no description to keep it clean
  openGraph: {
    title: "King Values | #1 Anime Vanguards Value List & Trading Hub",
    description: "", // blank = no text in Discord embed
    url: "https://animevanguardsvalues.com",
    siteName: "AV Values",
    images: [
      {
        url: "https://animevanguardsvalues.com/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Anime Vanguards Trading Value List",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 👇 Twitter card — blank description too
  twitter: {
    card: "summary_large_image",
    title: "King Values | #1 Anime Vanguards Value List & Trading Hub",
    description: "", // hide description in Twitter/Discord previews
    images: ["https://animevanguardsvalues.com/og-banner.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden text-white bg-black">
        <GalaxyBackground />
        <ScrollFade />
        <NavBar />
        <main className="relative z-10 pt-28">{children}</main>
      </body>
    </html>
  );
}
