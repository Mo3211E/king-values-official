import "./globals.css";
import GalaxyBackground from "./components/GalaxyBackground";
import NavBar from "./components/NavBar";
import ScrollFade from "./components/ScrollFade";

export const metadata = {
  title: "King Values | #1 AV Value List & Trading Hub",
  description: "Live & accurate community-led values + trade hub - Anime Vanguards",
  openGraph: {
    title: "King Values | #1 AV Value List & Trading Hub",
    description: "Live & accurate community-led values + trade hub - Anime Vanguards",
    url: "https://animevanguardsvalues.com",
    siteName: "King Values",
    images: [
      {
        url: "https://animevanguardsvalues.com/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Anime Vanguards Values Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "King Values | #1 AV Value List & Trading Hub",
    description: "Live & accurate community-led values + trade hub - Anime Vanguards",
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
