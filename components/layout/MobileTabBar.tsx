"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Lookup", href: "/app", icon: "⊕" },
  { label: "Calculator", href: "/app/calculator", icon: "⊞" },
  { label: "Guides", href: "/app/guides", icon: "☰" },
  { label: "Phrases", href: "/app/phrases", icon: "✦" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map(({ label, href, icon }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            style={{ color: active ? "var(--red)" : "var(--muted)" }}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="font-mono text-[10px] tracking-wide uppercase">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
