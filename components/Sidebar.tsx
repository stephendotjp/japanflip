"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  LayoutGrid, Map, TrendingUp, BookOpen,
  Calculator, FileText, Bookmark, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Opportunities", href: "/app", icon: LayoutGrid },
  { label: "Shop Map", href: "/app/map", icon: Map },
  { label: "Price History", href: "/app/history", icon: TrendingUp },
  { label: "Sell Guides", href: "/app/guides", icon: BookOpen },
];

const toolItems = [
  { label: "Profit Calculator", href: "/app/calculator", icon: Calculator },
  { label: "Customs Guide", href: "/app/customs", icon: FileText },
  { label: "Saved Items", href: "/app/saved", icon: Bookmark },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { tier } = useUser();

  return (
    <aside className="w-[220px] shrink-0 bg-[#111111] h-full flex flex-col overflow-y-auto">
      <div className="px-5 py-6 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-display text-2xl text-white tracking-wide">Japan</span>
          <span className="font-display text-2xl text-[#D92B3A] tracking-wide">Flip</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 pb-2 font-mono-custom text-[10px] text-white/30 uppercase tracking-widest">
          Navigation
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/app"
              ? pathname === "/app" || pathname.startsWith("/app/opportunity")
              : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? "bg-[#D92B3A] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}

        <p className="px-2 pt-4 pb-2 font-mono-custom text-[10px] text-white/30 uppercase tracking-widest">
          Tools
        </p>
        {toolItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Tier badge — always pinned to bottom of sidebar */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="px-3 py-3 rounded bg-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono-custom text-[10px] text-white/40 uppercase tracking-widest">
              Current Plan
            </span>
            <span
              className={`font-mono-custom text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${
                tier === "premium"
                  ? "bg-[#B8860B]/20 text-[#B8860B]"
                  : tier === "basic"
                  ? "bg-white/10 text-white/70"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {tier === "free" ? "Free" : tier === "basic" ? "Basic" : "Premium"}
            </span>
          </div>
          {tier === "basic" && (
            <Link
              href="/app/upgrade"
              className="flex items-center justify-between w-full px-3 py-2 bg-[#D92B3A] text-white text-xs font-mono-custom rounded hover:bg-[#B8860B] transition-colors"
            >
              <span>Upgrade — $24</span>
              <ChevronRight size={12} />
            </Link>
          )}
          {tier === "free" && (
            <Link
              href="/app/upgrade"
              className="flex items-center justify-between w-full px-3 py-2 bg-white/10 text-white/70 text-xs font-mono-custom rounded hover:bg-white/20 transition-colors"
            >
              <span>Get Access</span>
              <ChevronRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
