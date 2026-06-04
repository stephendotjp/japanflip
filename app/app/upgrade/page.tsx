"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { TopBar } from "@/components/layout/TopBar";
import type { Tier } from "@/lib/types";

const GUMROAD_BASIC = process.env.NEXT_PUBLIC_GUMROAD_BASIC_URL || "#";
const GUMROAD_PREMIUM = process.env.NEXT_PUBLIC_GUMROAD_PREMIUM_URL || "#";

const basicFeatures = [
  "Unlimited lookups",
  "Full profit breakdown",
  "Platform comparison (eBay, Depop, Etsy, StockX)",
  "Customs guide by country",
  "30-day sold data",
  "Lookup history — last 20 items (this device)",
];

const premiumFeatures = [
  "Everything in Basic",
  "Live data — updated daily",
  "Extended history — last 50 lookups",
  "Japanese phrase cards per category",
];

function UpgradePageInner() {
  const searchParams = useSearchParams();
  const { tier, setTier } = useUser();
  const [confirmed, setConfirmed] = useState(false);

  // Handle Gumroad redirect: ?email=...&tier=basic|premium
  useEffect(() => {
    const email = searchParams.get("email");
    const newTier = searchParams.get("tier") as Tier | null;
    if (email && (newTier === "basic" || newTier === "premium")) {
      setTier(newTier, email);
      setConfirmed(true);
    }
  }, [searchParams, setTier]);

  if (confirmed) {
    return (
      <div className="p-5 md:p-10 pb-10">
        <div className="max-w-md mx-auto text-center space-y-5 pt-10">
          <p className="text-5xl">🎉</p>
          <p className="font-display text-4xl text-black">You&apos;re in</p>
          <p className="font-body text-sm text-muted">
            Your access is now active. Start looking up items below.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
            style={{ background: "var(--red)" }}
          >
            Go to Price Lookup →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-10 space-y-8 pb-10">
      <TopBar
        title="Get Access"
        subtitle="One-time payment. No subscription. Use it forever."
      />

      {tier !== "free" && (
        <div
          className="px-4 py-3 rounded-md border"
          style={{ background: "var(--green-light)", borderColor: "rgba(26,122,74,0.2)" }}
        >
          <p className="font-mono text-[11px]" style={{ color: "var(--green)" }}>
            You&apos;re on {tier === "basic" ? "Basic" : "Premium"}.{" "}
            {tier === "basic"
              ? "Upgrade to Premium for live data and phrase cards."
              : "You have full access."}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        {/* Basic */}
        <div
          className="bg-surface border rounded-xl p-6 space-y-5"
          style={{
            borderColor: tier === "basic" ? "var(--green)" : "var(--border)",
            borderWidth: tier === "basic" ? 2 : 1,
          }}
        >
          {tier === "basic" && (
            <span
              className="inline-block font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded text-white"
              style={{ background: "var(--green)" }}
            >
              YOUR PLAN
            </span>
          )}
          <div>
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted">Basic</p>
            <p className="font-display text-5xl text-black mt-1">$9</p>
            <p className="font-mono text-xs text-muted mt-1">One-time · No subscription</p>
          </div>
          <ul className="space-y-2">
            {basicFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 font-body text-sm text-text">
                <span style={{ color: "var(--green)" }} className="mt-0.5 shrink-0">→</span>
                {f}
              </li>
            ))}
          </ul>
          {tier === "free" ? (
            <a
              href={GUMROAD_BASIC}
              className="block text-center px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "var(--red)" }}
            >
              Get Basic — $9
            </a>
          ) : (
            <p className="text-center font-mono text-xs text-muted py-3">
              {tier === "basic" ? "Active ✓" : "Included in Premium"}
            </p>
          )}
        </div>

        {/* Premium */}
        <div
          className="bg-surface border-2 rounded-xl p-6 space-y-5 relative"
          style={{ borderColor: tier === "premium" ? "var(--green)" : "var(--red)" }}
        >
          {tier === "premium" ? (
            <span
              className="absolute -top-3 left-5 font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded text-white"
              style={{ background: "var(--green)" }}
            >
              YOUR PLAN
            </span>
          ) : (
            <span
              className="absolute -top-3 left-5 font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded text-white"
              style={{ background: "var(--red)" }}
            >
              BEST VALUE
            </span>
          )}
          <div>
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted">Premium</p>
            <p className="font-display text-5xl text-black mt-1">$24</p>
            <p className="font-mono text-xs text-muted mt-1">One-time · No subscription</p>
          </div>
          <ul className="space-y-2">
            {premiumFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 font-body text-sm text-text">
                <span style={{ color: "var(--green)" }} className="mt-0.5 shrink-0">→</span>
                {f}
              </li>
            ))}
          </ul>
          {tier !== "premium" ? (
            <a
              href={GUMROAD_PREMIUM}
              className="block text-center px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "var(--black)" }}
            >
              Get Premium — $24
            </a>
          ) : (
            <p className="text-center font-mono text-xs text-muted py-3">Active ✓</p>
          )}
        </div>
      </div>

      <p className="font-body text-xs text-muted max-w-lg">
        After payment, Gumroad will redirect you back here with your access activated automatically.
        If something goes wrong, email your receipt to{" "}
        <a href="mailto:shaolinmonkuk@gmail.com" className="underline">
          shaolinmonkuk@gmail.com
        </a>
        .
      </p>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradePageInner />
    </Suspense>
  );
}
