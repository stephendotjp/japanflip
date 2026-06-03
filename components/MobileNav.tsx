"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Map, BookOpen, User } from "lucide-react";

const items = [
  { label: "Deals", href: "/app", icon: LayoutGrid },
  { label: "Map", href: "/app/map", icon: Map },
  { label: "Guides", href: "/app/guides", icon: BookOpen },
  { label: "Account", href: "/app/upgrade", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#111111] border-t border-white/10 flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/app"
            ? pathname === "/app" || pathname.startsWith("/app/opportunity")
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              active ? "text-[#D92B3A]" : "text-white/40 hover:text-white/70"
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
            <span className="font-mono-custom text-[9px] uppercase tracking-widest">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
