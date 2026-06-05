"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getScoutItems } from "@/lib/scout";

const tabs = [
  { label: "Lookup", href: "/app", icon: "⊕" },
  { label: "Scout", href: "/app/scout", icon: "◎" },
  { label: "Calculator", href: "/app/calculator", icon: "⊞" },
  { label: "Guides", href: "/app/guides", icon: "☰" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    setUnresolvedCount(getScoutItems().filter((i) => !i.resolved).length);
  }, [pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-surface"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {tabs.map(({ label, href, icon }) => {
        const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
        const isScout = href === "/app/scout";
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative"
            style={{ color: active ? "var(--red)" : "var(--muted)" }}
          >
            <span className="text-lg leading-none relative">
              {icon}
              {isScout && unresolvedCount > 0 && (
                <span
                  className="absolute -top-1 -right-2 font-mono text-[8px] px-1 rounded-full leading-tight"
                  style={{ background: "var(--red)", color: "white" }}
                >
                  {unresolvedCount}
                </span>
              )}
            </span>
            <span className="font-mono text-[10px] tracking-wide uppercase">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
