"use client";

import { useUser } from "@/context/UserContext";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function TripSummary() {
  const { currentTripItems, clearTrip } = useUser();

  if (currentTripItems.length === 0) return null;

  const totalProfit = currentTripItems.reduce((sum, item) => sum + item.netProfit, 0);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Today&apos;s Trip · {today}</SectionLabel>
        <button
          onClick={clearTrip}
          className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-text transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {currentTripItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 px-4 py-3 bg-bg border border-border rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-text truncate">{item.itemName}</p>
              <p className="font-mono text-[11px] text-muted">
                ¥{item.priceJPY.toLocaleString()} · via {item.platform}
              </p>
            </div>
            <span
              className="font-mono text-sm shrink-0"
              style={{ color: item.netProfit >= 0 ? "var(--green)" : "var(--red)" }}
            >
              {item.netProfit >= 0 ? "+" : ""}${Math.round(item.netProfit)} profit
            </span>
          </div>
        ))}
      </div>

      <div
        className="flex justify-between items-center px-4 py-3 rounded-lg"
        style={{ background: "#111111" }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#ffffff66" }}>
            Estimated total profit
          </p>
          <p className="font-mono text-[11px]" style={{ color: "#ffffff66" }}>
            {currentTripItems.length} item{currentTripItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <p
          className="font-display text-3xl"
          style={{ color: totalProfit >= 0 ? "#4ADE80" : "#D92B3A" }}
        >
          {totalProfit >= 0 ? "" : "−"}${Math.abs(Math.round(totalProfit))}
        </p>
      </div>
    </div>
  );
}
