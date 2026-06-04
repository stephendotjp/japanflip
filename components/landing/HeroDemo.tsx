"use client";

import { useState, useEffect } from "react";

const BASE_ITEM = "Seiko SKX007";
const BASE_PRICE = 4500;
const BASE_ROI = 7.4;
const BASE_SELL = 240;
const FALLBACK_RATE = 154.2;

function calcDemoROI(price: number): number {
  return Math.round((BASE_PRICE / price) * BASE_ROI * 10) / 10;
}

function getVerdict(roi: number): "buy" | "maybe" | "skip" {
  if (roi >= 7) return "buy";
  if (roi >= 3) return "maybe";
  return "skip";
}

const verdictConfig = {
  buy: { label: "BUY IT", color: "#4ADE80" },
  maybe: { label: "MAYBE", color: "#B8860B" },
  skip: { label: "SKIP IT", color: "#D92B3A" },
};

export function HeroDemo() {
  const [item, setItem] = useState(BASE_ITEM);
  const [priceStr, setPriceStr] = useState(String(BASE_PRICE));
  const [rate, setRate] = useState(FALLBACK_RATE);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => setRate(d.rate))
      .catch(() => {});
  }, []);

  const price = Number(priceStr) || BASE_PRICE;
  const roi = calcDemoROI(price);
  const verdict = getVerdict(roi);
  const config = verdictConfig[verdict];
  const usdBuy = (price / rate).toFixed(2);
  const approxProfit = Math.max(0, BASE_SELL - price / rate - 51).toFixed(0);

  return (
    <div
      className="rounded-xl border overflow-hidden shadow-xl"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* Demo header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="font-mono text-[9px] tracking-widest uppercase text-muted">
          Live demo · ¥{rate.toFixed(0)} = $1
        </span>
      </div>

      {/* Inputs */}
      <div className="p-4 space-y-2 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md font-body text-sm bg-white focus:outline-none focus:border-red/50"
            placeholder="Item name"
          />
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">¥</span>
            <input
              type="number"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              className="pl-6 pr-3 py-2 border border-border rounded-md font-mono text-sm w-24 bg-white focus:outline-none focus:border-red/50"
            />
          </div>
        </div>
        <p className="font-mono text-[10px] text-muted">
          Try it: change the item or price above
        </p>
      </div>

      {/* Verdict */}
      <div className="p-4" style={{ background: "#111111" }}>
        <p className="font-mono text-[10px] tracking-[2px] mb-1" style={{ color: "#ffffff66" }}>VERDICT</p>
        <p className="font-display text-4xl leading-none mb-2" style={{ color: config.color }}>
          {config.label}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
          {[
            { label: "You Pay", value: `¥${price.toLocaleString()} (~$${usdBuy})` },
            { label: "Avg Sell", value: `$${BASE_SELL} USD` },
            { label: "ROI", value: `${roi}x` },
            { label: "~Profit", value: `~$${approxProfit}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "#ffffff55" }}>{label}</p>
              <p className="font-mono text-xs" style={{ color: "#ffffffcc" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market mini rows */}
      <div className="p-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
        <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted mb-2">Recent US Sales</p>
        {[
          { title: "Seiko SKX007 — Good cond.", price: "$195", platform: "eBay" },
          { title: "Seiko SKX007 — Box & papers", price: "$320", platform: "eBay" },
        ].map((row) => (
          <div key={row.title} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
            <span className="font-body text-xs text-text truncate mr-2">{row.title}</span>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs text-text">{row.price}</span>
              <span className="block font-mono text-[10px] text-green">✓ Sold</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
