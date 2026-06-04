"use client";

import { useState, useEffect } from "react";

const FALLBACK_RATE = 154.2;

export function LandingCalculator() {
  const [jpBuy, setJpBuy] = useState("");
  const [usSell, setUsSell] = useState("");
  const [rate, setRate] = useState(FALLBACK_RATE);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => setRate(d.rate))
      .catch(() => {});
  }, []);

  const jpNum = Number(jpBuy) || 0;
  const usNum = Number(usSell) || 0;
  const buyUSD = jpNum / rate;
  const netProfit = usNum - buyUSD;
  const roi = buyUSD > 0 ? Math.round((usNum / buyUSD) * 10) / 10 : 0;
  const hasResult = jpNum > 0 && usNum > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-border rounded-xl p-6 md:p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-2">
              JP Buy Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">¥</span>
              <input
                type="number"
                value={jpBuy}
                onChange={(e) => setJpBuy(e.target.value)}
                placeholder="4500"
                className="w-full pl-7 pr-4 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-2">
              Expected US Sell Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">$</span>
              <input
                type="number"
                value={usSell}
                onChange={(e) => setUsSell(e.target.value)}
                placeholder="240"
                className="w-full pl-7 pr-4 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50"
              />
            </div>
          </div>
        </div>

        {hasResult ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: "#111111" }}
          >
            <p className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: "#ffffff66" }}>
              Rough Profit (before fees &amp; shipping)
            </p>
            <p
              className="font-display text-6xl leading-none mb-2"
              style={{ color: netProfit >= 0 ? "#4ADE80" : "#D92B3A" }}
            >
              {netProfit >= 0 ? "" : "−"}${Math.abs(Math.round(netProfit))}
            </p>
            <p className="font-mono text-sm" style={{ color: "#ffffff66" }}>
              {roi}x ROI · ¥{rate.toFixed(0)} = $1 today
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: "#f5f5f5" }}
          >
            <p className="font-mono text-xs text-muted">Enter prices above to see rough profit</p>
            <p className="font-mono text-[11px] text-muted mt-1">
              Full breakdown with fees — use the lookup tool
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
