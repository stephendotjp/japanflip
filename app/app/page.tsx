"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getScoutItems } from "@/lib/scout";
import { buildResult } from "@/lib/lookup";
import { SearchCard, type SearchExtras } from "@/components/lookup/SearchCard";
import { QuickChips } from "@/components/lookup/QuickChips";
import { VerdictCard } from "@/components/lookup/VerdictCard";
import { AdjustPanel } from "@/components/lookup/AdjustPanel";
import { CompsList } from "@/components/lookup/CompsList";
import { ProfitBreakdown } from "@/components/lookup/ProfitBreakdown";
import { PlatformCards } from "@/components/lookup/PlatformCards";
import { CustomsStrip } from "@/components/lookup/CustomsStrip";
import { PremiumGate } from "@/components/lookup/PremiumGate";
import { LookupHistory } from "@/components/lookup/LookupHistory";
import { TripSummary } from "@/components/lookup/TripSummary";
import { TopBar } from "@/components/layout/TopBar";
import { PulsingDot } from "@/components/ui/PulsingDot";
import type { LookupResponse, LookupResult, TripItem } from "@/lib/types";

const FREE_LIMIT = 3;
// Off while Stephen tests pre-launch — set to true before running ads.
const ENFORCE_FREE_LIMIT = false;

const categoryDefaultSize: Record<string, string> = {
  Clothing: "Medium",
};

function PriceLookupInner() {
  const { tier, isBasic, isPremium, todayCount, incrementLookup, saveLookup, savedLookups, addToTrip, updateScoutItem } =
    useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LookupResponse | null>(null);
  const [noResult, setNoResult] = useState(false);
  const [lastItem, setLastItem] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [rateTime, setRateTime] = useState<string | null>(null);
  const [gateData, setGateData] = useState<{ item: string; priceJPY: number | null } | null>(null);
  // These recompute the verdict locally from `data` — changing them never refetches.
  const [priceJPY, setPriceJPY] = useState<number | null>(null);
  const [condition, setCondition] = useState("A");
  const [size, setSize] = useState("Small");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [scoutPrefill, setScoutPrefill] = useState<{
    item: string;
    category: string;
    price: string;
    scoutId: string;
  } | null>(null);
  const currentScoutIdRef = useRef<string | null>(null);
  // Set on each fetch; cleared once the verdict is saved to history / the scout item.
  const pendingSaveRef = useRef(false);
  // Always holds the latest handleSearch — lets the searchParams effect call it without stale closure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearchRef = useRef<(...args: any[]) => void>(() => {});

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => {
        setRate(d.rate);
        const now = new Date();
        setRateTime(
          `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const scoutId = searchParams.get("scout");
    if (!scoutId) {
      currentScoutIdRef.current = null;
      return;
    }
    const items = getScoutItems();
    const scout = items.find((i) => i.id === scoutId);
    if (!scout) return;

    currentScoutIdRef.current = scoutId;

    setScoutPrefill({
      item: scout.itemName ?? "",
      category: scout.category ?? "Other",
      price: String(scout.priceJPY),
      scoutId,
    });

    // Auto-search if vision already identified the item
    if (scout.itemName && scout.priceJPY) {
      handleSearchRef.current(scout.itemName, scout.category ?? "Other", scout.priceJPY);
    }
  }, [searchParams]);

  const result: LookupResult | null = useMemo(
    () => (data ? buildResult(data, { priceJPY, condition, size, overrides }) : null),
    [data, priceJPY, condition, size, overrides]
  );

  // Record a priced verdict once per lookup — on arrival if the price was already
  // known, otherwise when the user finishes typing it into the adjust panel.
  const commitResult = () => {
    if (!pendingSaveRef.current || !result || result.valueOnly) return;
    pendingSaveRef.current = false;

    if (currentScoutIdRef.current) {
      updateScoutItem(currentScoutIdRef.current, { resolved: true, verdict: result.verdict });
    }
    if (isBasic) {
      saveLookup({
        id: Date.now().toString(),
        item: result.query,
        category: result.category,
        jpPrice: result.jpBuyPrice,
        verdict: result.verdict,
        roi: result.roi,
        timestamp: Date.now(),
      });
    }
  };
  const commitRef = useRef(commitResult);
  commitRef.current = commitResult;

  useEffect(() => {
    if (data) commitRef.current();
  }, [data]);

  const atLimit = ENFORCE_FREE_LIMIT && tier === "free" && todayCount >= FREE_LIMIT;

  const handleSearch = async (
    item: string,
    category: string,
    price: number | null,
    extras?: SearchExtras & { size?: string }
  ) => {
    if (atLimit) {
      setGateData({ item, priceJPY: price });
      setData(null);
      setNoResult(false);
      return;
    }
    setData(null);
    setNoResult(false);
    setLoading(true);
    setLastItem(item);
    setPriceJPY(price);
    setCondition(extras?.conditionRank ?? "A");
    setSize(extras?.size ?? categoryDefaultSize[category] ?? "Small");
    setOverrides({});

    let res: LookupResponse | null = null;
    try {
      const r = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, category }),
      });
      if (r.ok) res = await r.json();
    } catch {}
    setLoading(false);

    if (!res) {
      setNoResult(true);
      return;
    }

    pendingSaveRef.current = true;
    setData(res);
    // Only a lookup with enough matching sales uses up a free lookup.
    if (res.comps.filter((c) => !c.autoExcluded).length >= 3) incrementLookup();
  };

  // Keep the ref current so the searchParams effect can call the latest version
  handleSearchRef.current = handleSearch;

  const handleAddToTrip = (tripItem: TripItem) => {
    addToTrip(tripItem);
  };

  return (
    <div className="p-5 md:p-10 space-y-5 pb-10">
      <TopBar
        title="Price Lookup"
        subtitle="Snap it or type it — see what it really sells for before you buy."
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
              ¥{rate ? rate.toFixed(1) : "..."} = $1{rateTime ? ` · as of ${rateTime}` : " · Live rate"}
            </span>
          </div>
        }
      />

      {/* Free usage bar */}
      {ENFORCE_FREE_LIMIT && tier === "free" && todayCount > 0 && todayCount < FREE_LIMIT && (
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
        disabled={false}
        initialItem={scoutPrefill?.item}
        initialPrice={scoutPrefill?.price}
        initialCategory={scoutPrefill?.category}
      />
      {!data && !loading && (
        <QuickChips
          onSelect={(item, category, price, _condition, chipSize) =>
            handleSearch(item, category, price, { size: chipSize })
          }
          disabled={loading}
        />
      )}

      {/* At limit gate — blurred card when they tried a 4th search */}
      {atLimit && gateData && (
        <div className="relative rounded-xl overflow-hidden">
          <div
            className="blur-sm pointer-events-none select-none p-8 space-y-3"
            style={{ background: "#15191E" }}
          >
            <div className="h-4 w-20 rounded" style={{ background: "#ffffff22" }} />
            <div className="h-12 w-48 rounded" style={{ background: "#ffffff22" }} />
            <div className="h-3 w-full rounded mt-4" style={{ background: "#ffffff11" }} />
            <div className="h-3 w-3/4 rounded" style={{ background: "#ffffff11" }} />
            <div className="h-3 w-1/2 rounded" style={{ background: "#ffffff11" }} />
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <p className="font-mono text-sm" style={{ color: "#ffffffb3" }}>
              {gateData.item}
              {gateData.priceJPY ? ` · ¥${gateData.priceJPY.toLocaleString()}` : ""}
            </p>
            <p className="font-display text-2xl text-white leading-tight">
              You&apos;ve used your 3 free lookups today.
            </p>
            <p className="font-body text-sm" style={{ color: "#ffffff80" }}>
              Unlock unlimited lookups.
            </p>
            <Link
              href="/app/upgrade"
              className="mt-1 px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
              style={{ background: "var(--red)" }}
            >
              Get Basic — $9 →
            </Link>
          </div>
        </div>
      )}

      {/* At limit — simple state when they haven't tried a 4th search yet */}
      {atLimit && !gateData && !data && (
        <div
          className="border-2 border-dashed rounded-xl p-8 text-center space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="font-display text-3xl text-black">3 Free Lookups Used</p>
          <p className="font-body text-sm text-muted max-w-sm mx-auto">
            Get Basic for unlimited lookups.
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
          <div className="rounded-xl h-44 animate-pulse" style={{ background: "#15191E" }} />
          <div className="bg-surface border border-border rounded-xl h-52 animate-pulse" />
          <p className="font-mono text-xs text-muted text-center tracking-widest">
            Pulling recent eBay sold listings...
          </p>
        </div>
      )}

      {/* No result */}
      {noResult && !loading && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center space-y-3">
          <p className="font-display text-2xl text-black">Lookup failed</p>
          <p className="font-body text-sm text-muted">
            Couldn&apos;t reach the sold-listings service for &ldquo;{lastItem}&rdquo;. Check your connection
            and try again.
          </p>
        </div>
      )}

      {/* Results */}
      {result && data && !loading && (
        <div className="space-y-4">
          <VerdictCard
            result={result}
            condition={condition}
            onAddToTrip={isBasic ? handleAddToTrip : undefined}
          />

          <AdjustPanel
            priceJPY={priceJPY}
            onPriceChange={setPriceJPY}
            onPriceCommit={commitResult}
            condition={condition}
            onConditionChange={setCondition}
            size={size}
            onSizeChange={setSize}
            focusPrice={result.valueOnly && result.compsUsed >= 3}
          />

          <CompsList
            comps={data.comps}
            overrides={overrides}
            onToggle={(comp, include) => setOverrides((o) => ({ ...o, [comp.id]: include }))}
          />

          <ProfitBreakdown result={result} />
          <PlatformCards platforms={result.profitBreakdown.platforms} />
          <CustomsStrip customs={result.customs} />
          {!isPremium && (
            <PremiumGate
              feature="premium"
              upgradeHref="/app/upgrade"
              isPremiumOnly
            />
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

export default function PriceLookupPage() {
  return (
    <Suspense>
      <PriceLookupInner />
    </Suspense>
  );
}
