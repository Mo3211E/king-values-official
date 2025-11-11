// app/mobile/MobileNavBar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/units", label: "Values", emoji: "📊" },
  { href: "/tradehub", label: "Trade Hub", emoji: "🤝" },
  { href: "/tradecalculator", label: "Calc", emoji: "🧮" },
  { href: "https://discord.gg/cUGkAtsFNT", label: "Discord", emoji: "💬", external: true },
];

export default function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="m-bottom-nav">
      <ul>
        {items.map((it) => {
          const active =
            it.external ? false : pathname === it.href || pathname.startsWith(it.href + "/");
          const A = it.external ? "a" : Link;
          const props = it.external
            ? { href: it.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: it.href };

        return (
          <li key={it.href}>
            <A className={active ? "active" : ""} {...props}>
              <div style={{ fontSize: "1.1rem" }}>{it.emoji}</div>
              <div>{it.label}</div>
            </A>
          </li>
        );
        })}
      </ul>
    </nav>
  );
}
