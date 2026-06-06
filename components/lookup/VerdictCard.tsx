import { useState } from "react";
import type { LookupResult, TripItem } from "@/lib/types";
import { getVerdictContext } from "@/lib/verdictContext";

const verdictConfig = {
  buy: { label: "BUY IT", color: "#4ADE80" },
  skip: { label: "SKIP IT", color: "#D92B3A" },
  maybe: { label: "MAYBE", color: "#B8860B" },
};

const conditionLabel: Record<string, string> = {
  S: "Mint (S)",
  A: "Excellent (A)",
  B: "Good (B)",
  C: "Fair (C)",
};

interface VerdictCardProps {
  result: LookupResult;
  condition?: string;
  onAddToTrip?: (item: TripItem) => void;
}

export function VerdictCard({ result, condition = "A", onAddToTrip }: VerdictCardProps) {
  const [addedToTrip, setAddedToTrip] = useState(false);
  const config = verdictConfig[result.verdict];
  const verdictContext = getVerdictContext(result.category, result.verdict);
  const bestPlatform = result.profitBreakdown.platforms.reduce((a, b) =>
    a.netProfit > b.netProfit ? a : b
  );

  const handleAddToTrip = () => {
    if (!onAddToTrip) return;
    onAddToTrip({
      id: Date.now().toString(),
      itemName: result.query,
      priceJPY: result.jpBuyPrice,
      priceUSD: result.usdEquivalent,
      netProfit: bestPlatform.netProfit,
      platform: bestPlatform.name,
      timestamp: Date.now(),
    });
    setAddedToTrip(true);
  };

  return (
    <div
      className="rounded-xl p-6 md:p-8 animate-verdictReveal"
      style={{ background: "#111111" }}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Left: verdict + reason */}
        <div className="flex-1">
          <p className="font-mono text-[10px] tracking-[2px] uppercase mb-2" style={{ color: "#ffffff66" }}>
            VERDICT
          </p>
          <p
            className="font-display text-6xl md:text-7xl leading-none mb-4"
            style={{ color: config.color }}
          >
            {config.label}
          </p>
          <p className="font-body text-sm leading-relaxed" style={{ color: "#ffffffb3" }}>
            {result.verdictReason}
          </p>

          {verdictContext && (
            <p className="font-body text-xs leading-relaxed mt-2" style={{ color: "#ffffff66" }}>
              {verdictContext}
            </p>
          )}

          {onAddToTrip && result.verdict !== "skip" && (
            <button
              onClick={handleAddToTrip}
              disabled={addedToTrip}
              className="mt-4 px-4 py-2 rounded-md font-mono text-xs tracking-widest uppercase transition-opacity disabled:opacity-60"
              style={{
                background: addedToTrip ? "#ffffff22" : "#ffffff1a",
                color: addedToTrip ? "#ffffff99" : "#ffffffcc",
                border: "1px solid #ffffff22",
              }}
            >
              {addedToTrip ? "✓ Added to trip" : "+ Add to trip"}
            </button>
          )}
        </div>

        {/* Right: number panel */}
        <div
          className="md:w-56 rounded-lg p-5 space-y-3 shrink-0"
          style={{ background: "#ffffff0d" }}
        >
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#ffffff66" }}>
              You Pay
            </span>
            <span className="font-mono text-sm text-right" style={{ color: "#ffffff" }}>
              ¥{result.jpBuyPrice.toLocaleString()} / ~${result.usdEquivalent}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#ffffff66" }}>
              Condition
            </span>
            <span className="font-mono text-sm" style={{ color: "#ffffffcc" }}>
              {conditionLabel[condition] ?? condition}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#ffffff66" }}>
              Avg Sell
            </span>
            <span className="font-mono text-sm" style={{ color: "#ffffff" }}>
              ${result.usMarket.avgSoldPrice} USD
            </span>
          </div>
          <div className="border-t pt-3" style={{ borderColor: "#ffffff1a" }}>
            <div className="flex justify-between items-baseline gap-2 mb-2">
              <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#ffffff66" }}>
                After Fees
              </span>
              <span className="font-mono text-sm" style={{ color: "#4ADE80" }}>
                ~${Math.round(bestPlatform.netProfit)} profit
              </span>
            </div>
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "#ffffff66" }}>
                ROI
              </span>
              <span className="font-display text-3xl" style={{ color: config.color }}>
                {result.roi}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
