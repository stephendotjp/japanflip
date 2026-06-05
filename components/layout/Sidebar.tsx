"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getScoutItems } from "@/lib/scout";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  premiumOnly?: boolean;
  soon?: boolean;
}

const tools: NavItem[] = [
  { label: "Price Lookup", href: "/app", icon: "⊕" },
  { label: "Scout Mode", href: "/app/scout", icon: "◎" },
  { label: "Profit Calculator", href: "/app/calculator", icon: "⊞" },
  { label: "Customs Checker", href: "/app/customs", icon: "✈" },
  { label: "Saved Lookups", href: "/app/history", icon: "◉", premiumOnly: true },
];

const learn: NavItem[] = [
  { label: "Category Guides", href: "/app/guides", icon: "☰" },
  { label: "Shop Map", href: "#", icon: "◎", soon: true },
  { label: "Phrase Cards", href: "/app/phrases", icon: "✦", premiumOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { tier, isBasic, isPremium } = useUser();
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    const count = getScoutItems().filter((i) => !i.resolved).length;
    setUnresolvedCount(count);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <aside
      className="w-[220px] shrink-0 h-full flex flex-col overflow-y-auto"
      style={{ background: "#111111" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="font-display text-2xl text-white tracking-wide">Japan</span>
          <span className="font-display text-2xl tracking-wide" style={{ color: "#D92B3A" }}>
            Flip
          </span>
        </Link>
        <p className="font-mono text-[10px] text-white/30 mt-1 tracking-widest uppercase">
          The Japan Resale Tool
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Tools */}
        <p className="px-2 pb-2 font-mono text-[10px] text-white/30 uppercase tracking-widest">
          Tools
        </p>
        {tools.map(({ label, href, icon, premiumOnly, soon }) => {
          const active = !soon && isActive(href);
          const locked = premiumOnly && !isPremium;
          const showScoutBadge = href === "/app/scout" && unresolvedCount > 0;
          return (
            <Link
              key={href}
              href={soon ? "#" : href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors mb-0.5 ${
                active
                  ? "text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              style={active ? { background: "#D92B3A" } : undefined}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              <span className="font-body text-[13px] flex-1">{label}</span>
              {showScoutBadge && (
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{ background: "#D92B3A44", color: "#D92B3A" }}
                >
                  {unresolvedCount}
                </span>
              )}
              {locked && !isPremium && isBasic && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#B8860B22", color: "#B8860B" }}>
                  PRO
                </span>
              )}
            </Link>
          );
        })}

        {/* Learn */}
        <p className="px-2 pt-5 pb-2 font-mono text-[10px] text-white/30 uppercase tracking-widest">
          Learn
        </p>
        {learn.map(({ label, href, icon, premiumOnly, soon }) => {
          const active = !soon && isActive(href);
          const locked = premiumOnly && !isPremium;
          return (
            <Link
              key={label}
              href={soon ? "#" : href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors mb-0.5 ${
                active
                  ? "text-white"
                  : soon
                  ? "text-white/25 cursor-default"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              style={active ? { background: "#D92B3A" } : undefined}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              <span className="font-body text-[13px] flex-1">{label}</span>
              {soon && (
                <span className="font-mono text-[9px] text-white/25">soon</span>
              )}
              {locked && !soon && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#B8860B22", color: "#B8860B" }}>
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tier badge */}
      <div className="px-3 py-4 border-t border-white/10 shrink-0">
        <div className="px-3 py-3 rounded bg-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Plan</span>
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wide"
              style={
                tier === "premium"
                  ? { background: "#B8860B33", color: "#B8860B" }
                  : tier === "basic"
                  ? { background: "#D92B3A22", color: "#D92B3A" }
                  : { background: "#ffffff10", color: "#ffffff40" }
              }
            >
              {tier === "free" ? "Free" : tier === "basic" ? "Basic" : "Premium"}
            </span>
          </div>
          {!isPremium && (
            <Link
              href="/app/upgrade"
              className="flex items-center justify-center w-full px-3 py-2 text-white text-xs font-mono rounded transition-opacity hover:opacity-90"
              style={{ background: "#D92B3A" }}
            >
              {isBasic ? "Upgrade — $24" : "Get Basic — $9"}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
