"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import OpportunityCard from "@/components/OpportunityCard";
import StatsRow from "@/components/StatsRow";
import FilterRow from "@/components/FilterRow";
import opportunities from "@/data/opportunities.json";

const categories = ["All", "Clothing", "Watches", "Electronics", "Spirits", "Tools"];

export default function DashboardPage() {
  const { isBasic, isPremium } = useUser();
  const [activeTab, setActiveTab] = useState("All");
  const [city, setCity] = useState("All Cities");
  const [budget, setBudget] = useState("Any");
  const [sort, setSort] = useState("Highest ROI");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const filtered = useMemo(() => {
    let list = [...opportunities];

    if (activeTab !== "All") {
      list = list.filter((o) => o.category === activeTab);
    }
    if (city !== "All Cities") {
      list = list.filter((o) => o.cities.includes(city));
    }
    if (budget === "Under ¥3,000") {
      list = list.filter((o) => o.minBudgetJPY < 3000);
    } else if (budget === "Under ¥10,000") {
      list = list.filter((o) => o.minBudgetJPY < 10000);
    }

    if (sort === "Highest ROI") {
      list.sort((a, b) => b.roi - a.roi);
    } else if (sort === "Lowest Buy-In") {
      list.sort((a, b) => a.minBudgetJPY - b.minBudgetJPY);
    } else if (sort === "Easiest to Sell") {
      const ease: Record<string, number> = { "Fast Seller": 3, "High Demand": 2, "Collector Favorite": 1 };
      list.sort((a, b) => {
        const scoreA = a.tags.reduce((s, t) => s + (ease[t] || 0), 0);
        const scoreB = b.tags.reduce((s, t) => s + (ease[t] || 0), 0);
        return scoreB - scoreA;
      });
    }

    return list;
  }, [activeTab, city, budget, sort]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: opportunities.length };
    for (const o of opportunities) {
      counts[o.category] = (counts[o.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 pb-8">
      {/* Topbar */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-5xl text-[#111111] leading-none">June 2026</h1>
          <p className="font-mono-custom text-xs text-[#888480] mt-1">
            Arbitrage Opportunities · Updated June 1st
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EDF7F2] border border-[#1A7A4A]/20 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A7A4A] animate-pulse" />
          <span className="font-mono-custom text-[11px] text-[#1A7A4A]">Fresh Data · June 2026</span>
        </div>
      </div>

      <StatsRow />

      {/* Tip bar */}
      {isBasic || isPremium ? (
        <div className="p-4 bg-white border border-[#E8E4DE] rounded flex items-center gap-3">
          <span className="font-mono-custom text-[11px] text-[#888480]">
            Click any card to view full details, shop locations, and selling tips.
            {!isPremium && " Premium unlocks exact addresses and negotiation phrases."}
          </span>
        </div>
      ) : (
        <div className="p-4 bg-[#FDF0F1] border border-[#D92B3A]/20 rounded flex items-center justify-between gap-3">
          <span className="font-mono-custom text-[11px] text-[#D92B3A]">
            Purchase access to unlock opportunity details, shop locations, and selling tips.
          </span>
          <Link
            href="/app/upgrade"
            className="shrink-0 font-mono-custom text-[11px] px-3 py-1.5 bg-[#D92B3A] text-white rounded hover:bg-[#B8860B] transition-colors"
          >
            Get Access
          </Link>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 border-b border-[#E8E4DE] overflow-x-auto pb-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`shrink-0 px-4 py-2 font-mono-custom text-xs border-b-2 transition-colors -mb-px ${
              activeTab === cat
                ? "border-[#D92B3A] text-[#D92B3A]"
                : "border-transparent text-[#888480] hover:text-[#2A2825]"
            }`}
          >
            {cat}
            <span className="ml-1.5 opacity-50">({categoryCounts[cat] || 0})</span>
          </button>
        ))}
      </div>

      <FilterRow city={city} setCity={setCity} budget={budget} setBudget={setBudget} sort={sort} setSort={setSort} />

      {/* Cards grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filtered.map((opp, i) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            index={i}
            onLockedClick={() => setShowUpgradeModal(true)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="font-mono-custom text-sm text-[#888480]">No opportunities match your filters.</p>
          </div>
        )}
      </div>

      {/* Upsell banner — Basic only */}
      {isBasic && !isPremium && (
        <div className="bg-[#111111] rounded p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h3 className="font-display text-3xl text-white">Unlock All 24 Opportunities</h3>
            <p className="font-mono-custom text-xs text-white/60 max-w-md">
              You&apos;re on Basic — you can see 6 of 24 opportunities. Premium adds 18 more flips plus exact
              shop addresses, negotiation phrases, and listing templates.
            </p>
            <ul className="space-y-1">
              {[
                "All 24 opportunities",
                "Exact shop addresses + maps",
                "Japanese negotiation phrases",
                "Customs guide by country",
                "Listing templates per platform",
              ].map((f) => (
                <li key={f} className="font-mono-custom text-[11px] text-white/60 flex items-center gap-2">
                  <span className="text-[#D92B3A]">→</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 text-center md:text-right space-y-2">
            <p className="font-display text-5xl text-white">$24</p>
            <p className="font-mono-custom text-[10px] text-white/40 uppercase tracking-widest">One-time · No subscription</p>
            <Link
              href="/app/upgrade"
              className="block px-6 py-3 bg-[#D92B3A] text-white font-mono-custom text-xs hover:bg-[#B8860B] transition-colors"
            >
              Upgrade to Premium →
            </Link>
          </div>
        </div>
      )}

      {/* Upgrade modal for locked card clicks */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-white rounded p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl text-[#111111]">Premium Content</h3>
            <p className="font-mono-custom text-xs text-[#888480]">
              This opportunity is available with Premium access. Unlock all 24 flips, shop addresses,
              and selling guides for a one-time $24 payment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-[#E8E4DE] font-mono-custom text-xs text-[#888480] hover:border-[#111111] hover:text-[#111111] transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/app/upgrade"
                className="flex-1 px-4 py-2 bg-[#D92B3A] text-white font-mono-custom text-xs text-center hover:bg-[#B8860B] transition-colors"
              >
                Upgrade — $24
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
