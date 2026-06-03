"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import Ticker from "@/components/Ticker";
import opportunities from "@/data/opportunities.json";

const sampleOpps = opportunities.slice(0, 6);

const howItWorks = [
  { step: "01", title: "Buy the Guide", desc: "Get Basic ($9) or Premium ($24) access to this month's curated flip list." },
  { step: "02", title: "Shop Smart", desc: "Hit the recycle shops, flea markets, and specialty stores on your list." },
  { step: "03", title: "Fly Home", desc: "Pack your finds. We include customs rules and packing tips for every item." },
  { step: "04", title: "Sell & Profit", desc: "List on Depop, eBay, or Etsy using our platform guides and listing templates." },
];

const basicFeatures = [
  "6 curated opportunities this month",
  "Buy price ranges",
  "US sell price data",
  "Platform recommendations",
  "Instant access",
];

const premiumFeatures = [
  "Everything in Basic",
  "All 24 opportunities",
  "Exact shop addresses + maps",
  "Japanese negotiation phrases",
  "Customs guide by country",
  "Listing templates per platform",
  "Photo identification guides",
];

export default function LandingPage() {
  const { setTier, tier } = useUser();

  const handleGetBasic = () => {
    setTier("basic");
    window.location.href = "/app";
  };

  const handleGetPremium = () => {
    setTier("premium");
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#E8E4DE] bg-[#F7F4EF]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-1">
          <span className="font-display text-2xl text-[#111111] tracking-wide">Japan</span>
          <span className="font-display text-2xl text-[#D92B3A] tracking-wide">Flip</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono-custom text-[11px] text-[#888480] hidden md:block">
            Updated Monthly · June 2026
          </span>
          {tier !== "free" ? (
            <Link
              href="/app"
              className="font-mono-custom text-[11px] px-4 py-2 bg-[#111111] text-white hover:bg-[#D92B3A] transition-colors"
            >
              Open Dashboard →
            </Link>
          ) : (
            <button
              onClick={handleGetBasic}
              className="font-mono-custom text-[11px] px-4 py-2 bg-[#D92B3A] text-white hover:bg-[#111111] transition-colors"
            >
              Get Basic — $9
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-start justify-center px-6 md:px-20 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden
        >
          <span
            className="font-display text-[30vw] text-[#111111] leading-none"
            style={{ opacity: 0.03 }}
          >
            日本
          </span>
        </div>

        <div className="relative z-10 max-w-3xl">
          <p className="font-mono-custom text-xs text-[#888480] uppercase tracking-widest mb-6">
            Japan Arbitrage · June 2026 Edition
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(72px, 12vw, 140px)" }}>
            <span className="block text-[#111111]">Pay For</span>
            <span className="block text-[#D92B3A]">YOUR TRIP</span>
            <span
              className="block"
              style={{
                WebkitTextStroke: "2px #111111",
                color: "transparent",
              }}
            >
              To Japan
            </span>
          </h1>
          <p className="mt-8 font-mono-custom text-sm text-[#888480] max-w-lg leading-relaxed">
            Every month we find 20+ real arbitrage opportunities — things you can buy in Japan for
            cheap and resell back home for serious profit.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={handleGetBasic}
              className="font-mono-custom text-sm px-8 py-4 bg-[#D92B3A] text-white hover:bg-[#111111] transition-colors"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
            >
              Get Basic Access — $9
            </button>
            <span className="font-mono-custom text-[11px] text-[#888480]">
              Full access from $24
            </span>
          </div>
        </div>
      </section>

      <Ticker />

      {/* Sample opportunities grid */}
      <section className="px-6 md:px-12 py-20">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-4xl text-[#111111]">
            Sample Opportunities — June 2026
          </h2>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {sampleOpps.map((opp, i) => {
            const locked = i >= 4;
            return (
              <div
                key={opp.id}
                className={`relative bg-white border border-[#E8E4DE] rounded p-5 space-y-4 transition-all duration-200 hover:border-[#D92B3A]/30 hover:-translate-y-0.5 ${locked ? "" : "cursor-pointer"}`}
              >
                {locked && (
                  <div className="absolute inset-0 z-10 rounded flex flex-col items-center justify-center bg-white/80 backdrop-blur-[3px]">
                    <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center mb-2">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <rect x="5" y="11" width="14" height="10" rx="2" fill="white" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="font-mono-custom text-[10px] text-[#111111] uppercase tracking-widest">
                      Premium Only
                    </span>
                  </div>
                )}
                <div className={locked ? "blur-[3px] select-none" : ""}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">
                        {opp.category}
                      </span>
                      <p className="font-display text-xl text-[#111111]">{opp.title}</p>
                    </div>
                    <span
                      className={`font-mono-custom text-sm px-2 py-1 rounded ${
                        opp.roiTier === "high"
                          ? "bg-[#EDF7F2] text-[#1A7A4A]"
                          : "bg-[#FDF8EE] text-[#B8860B]"
                      }`}
                    >
                      {opp.roi}x
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-[#F7F4EF] rounded p-2">
                      <p className="font-mono-custom text-[9px] text-[#888480] uppercase tracking-widest">Buy</p>
                      <p className="font-mono-custom text-xs text-[#111111]">
                        ¥{opp.buyPriceJPY.min.toLocaleString()}–¥{opp.buyPriceJPY.max.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#EDF7F2] rounded p-2">
                      <p className="font-mono-custom text-[9px] text-[#1A7A4A] uppercase tracking-widest">Sell</p>
                      <p className="font-mono-custom text-xs text-[#1A7A4A]">
                        ${opp.sellPriceUSD.min}–${opp.sellPriceUSD.max}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <button
            onClick={handleGetBasic}
            className="font-mono-custom text-sm px-8 py-4 bg-[#D92B3A] text-white hover:bg-[#111111] transition-colors"
          >
            Unlock Full List — $9
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-20 border-t border-[#E8E4DE]">
        <h2 className="font-display text-4xl text-[#111111] mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {howItWorks.map(({ step, title, desc }) => (
            <div key={step} className="space-y-3">
              <p className="font-display text-7xl text-[#E8E4DE] leading-none">{step}</p>
              <p className="font-display text-2xl text-[#111111]">{title}</p>
              <p className="font-mono-custom text-[11px] text-[#888480] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 md:px-12 py-20 border-t border-[#E8E4DE]">
        <h2 className="font-display text-4xl text-[#111111] mb-10">Get Access</h2>
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
          {/* Basic */}
          <div className="bg-white border border-[#E8E4DE] rounded p-6 flex flex-col gap-5">
            <div>
              <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">Basic</p>
              <p className="font-display text-5xl text-[#111111] mt-1">$9</p>
              <p className="font-mono-custom text-[10px] text-[#888480]">one-time</p>
            </div>
            <ul className="space-y-2 flex-1">
              {basicFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="font-mono-custom text-[11px] text-[#D92B3A]">→</span>
                  <span className="font-mono-custom text-[11px] text-[#2A2825]">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleGetBasic}
              className="w-full px-4 py-3 border border-[#111111] font-mono-custom text-xs text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
            >
              Get Basic — $9
            </button>
          </div>

          {/* Premium */}
          <div className="bg-white border-2 border-[#D92B3A] rounded p-6 flex flex-col gap-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="font-mono-custom text-[10px] px-3 py-1 bg-[#D92B3A] text-white uppercase tracking-widest rounded">
                Best Value
              </span>
            </div>
            <div>
              <p className="font-mono-custom text-[10px] text-[#888480] uppercase tracking-widest">Premium</p>
              <p className="font-display text-5xl text-[#111111] mt-1">$24</p>
              <p className="font-mono-custom text-[10px] text-[#888480]">one-time</p>
            </div>
            <ul className="space-y-2 flex-1">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="font-mono-custom text-[11px] text-[#D92B3A]">→</span>
                  <span className="font-mono-custom text-[11px] text-[#2A2825]">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleGetPremium}
              className="w-full px-4 py-3 bg-[#D92B3A] font-mono-custom text-xs text-white hover:bg-[#B8860B] transition-colors"
            >
              Get Premium — $24
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t border-[#E8E4DE]">
        <div className="flex items-center gap-1 mb-3">
          <span className="font-display text-xl text-[#111111]">Japan</span>
          <span className="font-display text-xl text-[#D92B3A]">Flip</span>
        </div>
        <p className="font-mono-custom text-[11px] text-[#888480] max-w-md leading-relaxed">
          Not affiliated with any shop or brand. Updated monthly by someone who actually lives here.
        </p>
        <p className="font-mono-custom text-[10px] text-[#888480]/50 mt-3">
          Prices are estimates based on observed market data. Actual resale results vary. Not financial advice.
          Always check customs regulations for your country before traveling.
        </p>
      </footer>
    </div>
  );
}
