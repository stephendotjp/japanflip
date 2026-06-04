"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

const FALLBACK_RATE = 154.2;

const platforms = [
  { name: "eBay", fee: 0.1325, paymentFee: 0.03 },
  { name: "Depop", fee: 0.10, paymentFee: 0.029 },
  { name: "Etsy", fee: 0.065, paymentFee: 0.03 },
  { name: "Chrono24", fee: 0.065, paymentFee: 0 },
  { name: "StockX", fee: 0.09, paymentFee: 0.03 },
];

const customsThresholds: Record<string, { label: string; threshold: number; currency: string; rate: number }> = {
  US: { label: "United States (USD)", threshold: 800, currency: "USD", rate: 1 },
  UK: { label: "United Kingdom (GBP)", threshold: 390, currency: "GBP", rate: 1.27 },
  AU: { label: "Australia (AUD)", threshold: 900, currency: "AUD", rate: 0.64 },
  CA: { label: "Canada (CAD)", threshold: 800, currency: "CAD", rate: 0.73 },
  EU: { label: "Germany / EU (EUR)", threshold: 430, currency: "EUR", rate: 1.08 },
};

export default function CalculatorPage() {
  const [jpBuy, setJpBuy] = useState("");
  const [usSell, setUsSell] = useState("");
  const [platform, setPlatform] = useState("eBay");
  const [shipping, setShipping] = useState("12");
  const [country, setCountry] = useState("US");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateLoading, setExchangeRateLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => {
        setExchangeRate(d.rate);
        setExchangeRateLoading(false);
      })
      .catch(() => {
        console.warn("Failed to fetch live exchange rate, using fallback");
        setExchangeRate(FALLBACK_RATE);
        setExchangeRateLoading(false);
      });
  }, []);

  const rate = exchangeRate ?? FALLBACK_RATE;

  const jpBuyNum = Number(jpBuy) || 0;
  const usSellNum = Number(usSell) || 0;
  const shippingNum = Number(shipping) || 0;

  const buyUSD = jpBuyNum / rate;
  const platformData = platforms.find((p) => p.name === platform)!;
  const feeAmount = usSellNum * platformData.fee;
  const paymentFee = usSellNum * platformData.paymentFee;
  const netProfit = usSellNum - feeAmount - paymentFee - shippingNum - buyUSD;
  const roi = buyUSD > 0 ? Math.round((usSellNum / buyUSD) * 10) / 10 : 0;
  const breakEvenJPY = usSellNum > 0
    ? Math.round((usSellNum - feeAmount - paymentFee - shippingNum) * rate)
    : 0;

  const ct = customsThresholds[country];
  const valueUSD = usSellNum;
  const thresholdUSD = ct.threshold * ct.rate;
  const customsOk = valueUSD < thresholdUSD;

  const hasResult = jpBuyNum > 0 && usSellNum > 0;

  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <TopBar
        title="Profit Calculator"
        subtitle="Model any scenario before you buy."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Your Numbers</SectionLabel>
            {exchangeRateLoading ? (
              <span className="font-mono text-[10px] text-muted">Loading rate...</span>
            ) : (
              <span className="font-mono text-[10px] text-muted">
                ¥{rate.toFixed(1)} = $1 · Live
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                JP Buy Price (¥)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">¥</span>
                <input
                  type="number"
                  value={jpBuy}
                  onChange={(e) => setJpBuy(e.target.value)}
                  placeholder="4500"
                  disabled={exchangeRateLoading}
                  className="w-full pl-7 pr-4 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                Expected US Sell Price ($)
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

            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md font-mono text-xs bg-white focus:outline-none focus:border-red/50"
              >
                {platforms.map((p) => (
                  <option key={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                Shipping Cost ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">$</span>
                <input
                  type="number"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  className="w-full pl-7 pr-4 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                Selling Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md font-mono text-xs bg-white focus:outline-none focus:border-red/50"
              >
                {Object.entries(customsThresholds).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {exchangeRateLoading ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center animate-pulse">
              <p className="font-mono text-xs text-muted">Loading live exchange rate...</p>
            </div>
          ) : hasResult ? (
            <>
              {/* Net profit */}
              <div
                className="rounded-xl p-6"
                style={{ background: "#111111" }}
              >
                <p className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: "#ffffff66" }}>
                  Net Profit
                </p>
                <p
                  className="font-display text-6xl leading-none"
                  style={{ color: netProfit >= 0 ? "#4ADE80" : "#D92B3A" }}
                >
                  {netProfit >= 0 ? "" : "−"}${Math.abs(Math.round(netProfit))}
                </p>
                <p className="font-mono text-sm mt-3" style={{ color: "#ffffff66" }}>
                  ROI: {roi}x · Rate: ¥{rate.toFixed(1)}/$1
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-surface border border-border rounded-xl p-5 space-y-0">
                <SectionLabel>Breakdown</SectionLabel>
                {[
                  { label: "JP buy price", value: `¥${jpBuyNum.toLocaleString()} (~$${buyUSD.toFixed(2)})` },
                  { label: "US sell price", value: `$${usSellNum}` },
                  { label: `${platform} fee (${(platformData.fee * 100).toFixed(2)}%)`, value: `-$${feeAmount.toFixed(2)}` },
                  { label: "Payment fee", value: `-$${paymentFee.toFixed(2)}` },
                  { label: "Shipping", value: `-$${shippingNum.toFixed(2)}` },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-border last:border-0">
                    <span className="font-mono text-xs text-muted">{row.label}</span>
                    <span className="font-mono text-sm text-text">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-4">
                  <span className="font-mono text-xs font-medium uppercase tracking-widest">Net Profit</span>
                  <span className="font-display text-2xl" style={{ color: "var(--green)" }}>${netProfit.toFixed(2)}</span>
                </div>
              </div>

              {/* Break-even + Customs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface border border-border rounded-xl p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">Break-even Buy</p>
                  <p className="font-display text-2xl text-black">¥{breakEvenJPY.toLocaleString()}</p>
                  <p className="font-mono text-[11px] text-muted mt-1">Max you should pay</p>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: customsOk ? "var(--green-light)" : "var(--gold-light)",
                    borderColor: customsOk ? "rgba(26,122,74,0.2)" : "rgba(184,134,11,0.2)",
                    border: "1px solid",
                  }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: customsOk ? "var(--green)" : "var(--gold)" }}>
                    Customs
                  </p>
                  <p className="font-body text-sm font-medium"
                    style={{ color: customsOk ? "var(--green)" : "var(--gold)" }}>
                    {customsOk ? "✓ Under limit" : "⚠ Declare"}
                  </p>
                  <p className="font-mono text-[11px] mt-1"
                    style={{ color: customsOk ? "var(--green)" : "var(--gold)" }}>
                    {ct.currency} {ct.threshold} limit
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="font-display text-2xl text-black mb-2">Enter your numbers</p>
              <p className="font-body text-sm text-muted">
                Fill in the JP buy price and expected US sell price to see your profit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
