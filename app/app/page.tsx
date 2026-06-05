"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getScoutItems } from "@/lib/scout";
import { SearchCard } from "@/components/lookup/SearchCard";
import { QuickChips } from "@/components/lookup/QuickChips";
import { VerdictCard } from "@/components/lookup/VerdictCard";
import { MarketData } from "@/components/lookup/MarketData";
import { ProfitBreakdown } from "@/components/lookup/ProfitBreakdown";
import { PlatformCards } from "@/components/lookup/PlatformCards";
import { CustomsStrip } from "@/components/lookup/CustomsStrip";
import { PremiumGate } from "@/components/lookup/PremiumGate";
import { LookupHistory } from "@/components/lookup/LookupHistory";
import { TripSummary } from "@/components/lookup/TripSummary";
import { TopBar } from "@/components/layout/TopBar";
import { PulsingDot } from "@/components/ui/PulsingDot";
import type { LookupResult, TripItem } from "@/lib/types";

const FREE_LIMIT = 3;

export default function PriceLookupPage() {
  const { tier, isBasic, isPremium, todayCount, incrementLookup, saveLookup, savedLookups, addToTrip, updateScoutItem } =
    useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [noResult, setNoResult] = useState(false);
  const [lastItem, setLastItem] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [lastCondition, setLastCondition] = useState("A");
  const [scoutPrefill, setScoutPrefill] = useState<{
    item: string;
    category: string;
    price: string;
    scoutId: string;
  } | null>(null);
  const scoutResolved = useRef(false);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => setRate(d.rate));
  }, []);

  useEffect(() => {
    const scoutId = searchParams.get("scout");
    if (!scoutId) return;
    const items = getScoutItems();
    const scout = items.find((i) => i.id === scoutId);
    if (!scout) return;
    setScoutPrefill({
      item: scout.itemName ?? "",
      category: scout.category ?? "Other",
      price: String(scout.priceJPY),
      scoutId,
    });
    scoutResolved.current = false;
  }, [searchParams]);

  const atLimit = tier === "free" && todayCount >= FREE_LIMIT;

  const handleSearch = async (item: string, category: string, priceJPY: number, condition = "A", size = "Small") => {
    if (atLimit) return;
    setResult(null);
    setNoResult(false);
    setLoading(true);
    setLastItem(item);
    setLastCondition(condition);

    const res = await fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, category, priceJPY, condition, size }),
    });
    const data: LookupResult | null = await res.json();
    setLoading(false);

    if (!data) {
      setNoResult(true);
      return;
    }

    setResult(data);
    incrementLookup();

    if (scoutPrefill && !scoutResolved.current) {
      scoutResolved.current = true;
      updateScoutItem(scoutPrefill.scoutId, {
        resolved: true,
        verdict: data.verdict,
      });
    }

    if (isBasic) {
      saveLookup({
        id: Date.now().toString(),
        item,
        category,
        jpPrice: priceJPY,
        verdict: data.verdict,
        roi: data.roi,
        timestamp: Date.now(),
      });
    }
  };

  const handleAddToTrip = (tripItem: TripItem) => {
    addToTrip(tripItem);
  };

  return (
    <div className="p-5 md:p-10 space-y-5 pb-10">
      <TopBar
        title="Price Lookup"
        subtitle="Found something? Check if it's worth buying before you commit."
        badge={
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
            style={{
              background: "var(--green-light)",
              borderColor: "rgba(26,122,74,0.2)",
            }}
          >
            <PulsingDot />
            <span className="font-mono text-[11px]" style={{ color: "var(--green)" }}>
              ¥{rate ? rate.toFixed(1) : "..."} = $1 · Live rate
            </span>
          </div>
        }
      />

      {/* Free usage bar */}
      {tier === "free" && todayCount > 0 && todayCount < FREE_LIMIT && (
        <div
          className="px-4 py-2.5 rounded-md border text-sm"
          style={{
            background: "var(--gold-light)",
            borderColor: "rgba(184,134,11,0.2)",
          }}
        >
          <span className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
            {FREE_LIMIT - todayCount} free lookups remaining today.{" "}
            <Link href="/app/upgrade" className="underline">
              Get Basic for unlimited →
            </Link>
          </span>
        </div>
      )}

      <SearchCard
        onSearch={handleSearch}
        loading={loading}
        disabled={atLimit}
        initialItem={scoutPrefill?.item}
        initialPrice={scoutPrefill?.price}
        initialCategory={scoutPrefill?.category}
      />
      <QuickChips onSelect={handleSearch} disabled={atLimit || loading} />

      {/* At limit gate */}
      {atLimit && (
        <div
          className="border-2 border-dashed rounded-xl p-8 text-center space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="font-display text-3xl text-black">3 Free Lookups Used</p>
          <p className="font-body text-sm text-muted max-w-sm mx-auto">
            You&apos;ve used your 3 free lookups today. Get Basic for unlimited lookups and the full
            profit breakdown.
          </p>
          <Link
            href="/app/upgrade"
            className="inline-block px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
            style={{ background: "var(--red)" }}
          >
            Get Basic — $9 →
          </Link>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          <div className="rounded-xl h-44 animate-pulse" style={{ background: "#111111" }} />
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-surface border border-border rounded-xl h-52 animate-pulse" />
            <div className="bg-surface border border-border rounded-xl h-52 animate-pulse" />
          </div>
          <p className="font-mono text-xs text-muted text-center tracking-widest">
            Checking JP and US markets...
          </p>
        </div>
      )}

      {/* No result */}
      {noResult && !loading && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center space-y-3">
          <p className="font-display text-2xl text-black">No data on this yet</p>
          <p className="font-body text-sm text-muted">
            We don&apos;t have data on &ldquo;{lastItem}&rdquo;. Try a more specific search —
            include the model number if you have it.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {["Seiko SKX007", "Levi's 501", "Olympus mju-II"].map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s, "Other", 4500)}
                className="px-3 py-1.5 border border-border rounded-full font-mono text-xs text-muted hover:text-text hover:border-text transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4">
          <VerdictCard
            result={result}
            condition={lastCondition}
            onAddToTrip={isBasic ? handleAddToTrip : undefined}
          />

          <div className="grid md:grid-cols-2 gap-3">
            <MarketData market={result.jpMarket} country="Japan" flag="🇯🇵" />
            <MarketData
              market={result.usMarket}
              country="US Market"
              flag="🇺🇸"
              isUSMarket
            />
          </div>

          {isBasic ? (
            <>
              <ProfitBreakdown result={result} />
              <PlatformCards platforms={result.profitBreakdown.platforms} />
              <CustomsStrip customs={result.customs} />
              {!isPremium && (
                <PremiumGate
                  feature="live market data"
                  upgradeHref="/app/upgrade"
                  isPremiumOnly
                />
              )}
            </>
          ) : (
            <PremiumGate feature="full profit breakdown" upgradeHref="/app/upgrade" />
          )}
        </div>
      )}

      {/* Trip summary */}
      {isBasic && <TripSummary />}

      {/* Lookup history */}
      {isBasic && (
        <LookupHistory
          lookups={savedLookups}
          isBasic={isBasic}
        />
      )}
    </div>
  );
}
