"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useUser } from "@/context/UserContext";

const FALLBACK_RATE = 154.2;
const BAG_LIMIT_KG = 23; // standard economy checked-bag weight limit on most airlines
const JP_POST_CALC = "https://www.post.japanpost.jp/cgi-charge/index.php?lang=_en";

// Rough import-tax assumptions, checked Sep 2026. Real rates vary by item — shown as estimates, editable below.
// allowance: traveller personal exemption (goods carried in your luggage), in local currency.
// bagTaxOn: whether tax applies to the amount over the allowance, or the full value once you're over.
// shipRate: tax on shipped goods (no traveller allowance applies to parcels).
const destinations: Record<string, {
  label: string; currency: string; fx: number; allowance: number;
  bagTaxOn: "excess" | "full"; bagRate: number; shipRate: number; note: string;
}> = {
  US: { label: "United States", currency: "USD", fx: 1, allowance: 800, bagTaxOn: "excess", bagRate: 0.03, shipRate: 0.15,
    note: "US $800 de minimis ended Aug 2025 — shipped goods owe duty from the first dollar, often plus a carrier brokerage fee. Over $800 in your luggage, a flat ~3% applies to the next $1,000." },
  UK: { label: "United Kingdom", currency: "GBP", fx: 1.27, allowance: 390, bagTaxOn: "full", bagRate: 0.20, shipRate: 0.20,
    note: "Over £390 in your luggage, 20% VAT (plus any duty) is due on the full value, not just the excess. Shipped goods pay VAT from £0." },
  CA: { label: "Canada", currency: "CAD", fx: 0.73, allowance: 800, bagTaxOn: "excess", bagRate: 0.13, shipRate: 0.13,
    note: "CAD $800 exemption applies after 7+ days away. GST/HST varies by province — ~13% is a middle estimate." },
  AU: { label: "Australia", currency: "AUD", fx: 0.64, allowance: 900, bagTaxOn: "full", bagRate: 0.10, shipRate: 0.10,
    note: "Over AUD $900 in your luggage, 10% GST (plus duty on some goods) is due on the full value." },
  EU: { label: "Germany / EU", currency: "EUR", fx: 1.08, allowance: 430, bagTaxOn: "full", bagRate: 0.19, shipRate: 0.19,
    note: "€430 air-traveller allowance. Over it, VAT (19% in Germany) plus any duty on the full value. Shipped goods pay VAT from €0." },
};

const inputClass = "w-full pl-7 pr-3 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50 min-w-0";
const labelClass = "font-mono text-[11px] uppercase tracking-widest text-muted block mb-1";

function MoneyInput({ label, prefix, value, onChange, placeholder, hint }: {
  label: string; prefix: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">{prefix}</span>
        <input type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      </div>
      {hint && <p className="font-mono text-[10px] text-muted mt-1">{hint}</p>}
    </div>
  );
}

export default function CalculatorPage() {
  const { currentTripItems, homeCountry, setHomeCountry } = useUser();
  const [haulJPY, setHaulJPY] = useState("");
  const [weightKg, setWeightKg] = useState("5");
  const [airlineFee, setAirlineFee] = useState("100");
  const [suitcaseJPY, setSuitcaseJPY] = useState("5000");
  const [postJPY, setPostJPY] = useState("");
  const [proxyFeeJPY, setProxyFeeJPY] = useState("800");
  const [proxyShipJPY, setProxyShipJPY] = useState("");
  const [bagRatePct, setBagRatePct] = useState<string | null>(null);
  const [shipRatePct, setShipRatePct] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d) => setExchangeRate(d.rate))
      .catch(() => setExchangeRate(FALLBACK_RATE));
  }, []);

  const rate = exchangeRate ?? FALLBACK_RATE;
  const country = destinations[homeCountry] ? homeCountry : "US";
  const dest = destinations[country];

  const tripJPY = currentTripItems.reduce((sum, i) => sum + i.priceJPY, 0);
  const tripProfit = currentTripItems.reduce((sum, i) => sum + i.netProfit, 0);
  const usingTrip = currentTripItems.length > 0 && Number(haulJPY) === tripJPY;

  const haulUSD = (Number(haulJPY) || 0) / rate;
  const weight = Number(weightKg) || 0;
  const bagsNeeded = Math.max(1, Math.ceil(weight / BAG_LIMIT_KG));
  const bagRate = bagRatePct === null ? dest.bagRate : (Number(bagRatePct) || 0) / 100;
  const shipRate = shipRatePct === null ? dest.shipRate : (Number(shipRatePct) || 0) / 100;

  // Customs is assessed on what you paid, not what you'll resell it for.
  const allowanceUSD = dest.allowance * dest.fx;
  const overAllowance = haulUSD > allowanceUSD;
  const bagTax = overAllowance
    ? (dest.bagTaxOn === "excess" ? haulUSD - allowanceUSD : haulUSD) * bagRate
    : 0;
  const shipTax = haulUSD * shipRate;

  const jpy = (v: string) => (Number(v) || 0) / rate;
  const options = [
    {
      id: "space",
      name: "Room in your bag",
      detail: "Only if it fits your existing allowance",
      transport: 0,
      tax: bagTax,
      ready: true,
    },
    {
      id: "extra",
      name: bagsNeeded > 1 ? `${bagsNeeded} extra checked bags` : "Extra checked bag",
      detail: `Airline fee + suitcase bought in Japan${bagsNeeded > 1 ? ` · ${weight}kg needs ${bagsNeeded} bags at ${BAG_LIMIT_KG}kg` : ""}`,
      transport: bagsNeeded * ((Number(airlineFee) || 0) + jpy(suitcaseJPY)),
      tax: bagTax,
      ready: true,
    },
    {
      id: "post",
      name: "Ship it — Japan Post",
      detail: "EMS / airmail quote + import tax on the full value",
      transport: jpy(postJPY),
      tax: shipTax,
      ready: Number(postJPY) > 0,
    },
    {
      id: "proxy",
      name: "Forwarding / proxy service",
      detail: "Service fee + their shipping quote + import tax",
      transport: jpy(proxyFeeJPY) + jpy(proxyShipJPY),
      tax: shipTax,
      ready: Number(proxyShipJPY) > 0,
    },
  ].map((o) => ({ ...o, total: o.transport + o.tax }));

  const ranked = options.filter((o) => o.ready).sort((a, b) => a.total - b.total);
  const cheapest = ranked[0];
  const cheapestPaid = ranked.find((o) => o.id !== "space");
  const hasHaul = haulUSD > 0;

  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <TopBar
        title="Haul Calculator"
        subtitle="Extra bag, ship it, or use a proxy — what does getting it home actually cost?"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4 min-w-0">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <SectionLabel>Your Haul</SectionLabel>
              <span className="font-mono text-[10px] text-muted">
                {exchangeRate === null ? "Loading rate..." : `¥${rate.toFixed(1)} = $1`}
              </span>
            </div>

            {currentTripItems.length > 0 && !usingTrip && (
              <button
                onClick={() => setHaulJPY(String(tripJPY))}
                className="w-full text-left px-4 py-3 bg-bg border border-border rounded-md font-mono text-[11px] text-text hover:border-red/50 transition-colors"
              >
                Use today&apos;s trip → {currentTripItems.length} item{currentTripItems.length !== 1 ? "s" : ""} · ¥{tripJPY.toLocaleString()}
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <MoneyInput label="Total paid (¥)" prefix="¥" value={haulJPY} onChange={setHaulJPY} placeholder="60000" />
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50 min-w-0" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Going home to</label>
              <select
                value={country}
                onChange={(e) => { setHomeCountry(e.target.value); setBagRatePct(null); setShipRatePct(null); }}
                className="w-full px-4 py-3 border border-border rounded-md font-mono text-xs bg-white focus:outline-none focus:border-red/50"
              >
                {Object.entries(destinations).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <SectionLabel>Your Quotes</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput label="Airline bag fee ($)" prefix="$" value={airlineFee} onChange={setAirlineFee} hint="Check your airline — often $50–150" />
              <MoneyInput label="Suitcase in JP (¥)" prefix="¥" value={suitcaseJPY} onChange={setSuitcaseJPY} hint="Don Quijote, 3Coins duffel, or 0" />
            </div>
            <MoneyInput
              label="Japan Post quote (¥)"
              prefix="¥"
              value={postJPY}
              onChange={setPostJPY}
              placeholder="Enter a quote"
              hint={<>Get one for {weight || "?"}kg at the <a href={JP_POST_CALC} target="_blank" rel="noopener noreferrer" className="underline">Japan Post rate calculator ↗</a></>}
            />
            <div className="grid grid-cols-2 gap-3">
              <MoneyInput label="Proxy fee (¥)" prefix="¥" value={proxyFeeJPY} onChange={setProxyFeeJPY} hint="Per-order service fee" />
              <MoneyInput label="Proxy shipping (¥)" prefix="¥" value={proxyShipJPY} onChange={setProxyShipJPY} placeholder="Their quote" hint="Incl. packing/consolidation" />
            </div>

            <details className="group">
              <summary className="font-mono text-[11px] uppercase tracking-widest text-muted cursor-pointer">
                Tax assumptions — {dest.label}
              </summary>
              <div className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>In luggage, over limit (%)</label>
                    <input type="number" value={bagRatePct ?? String(Math.round(dest.bagRate * 100))} onChange={(e) => setBagRatePct(e.target.value)}
                      className="w-full px-3 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50 min-w-0" />
                  </div>
                  <div>
                    <label className={labelClass}>Shipped (%)</label>
                    <input type="number" value={shipRatePct ?? String(Math.round(dest.shipRate * 100))} onChange={(e) => setShipRatePct(e.target.value)}
                      className="w-full px-3 py-3 border border-border rounded-md font-mono text-sm bg-white focus:outline-none focus:border-red/50 min-w-0" />
                  </div>
                </div>
                <p className="font-body text-xs text-muted">{dest.note}</p>
                <p className="font-body text-xs text-muted">Rough estimates checked Sep 2026, not legal advice. Actual duty depends on the item — check your customs authority for anything expensive.</p>
              </div>
            </details>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4 min-w-0">
          {!hasHaul ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="font-display text-2xl text-black mb-2">Enter your haul</p>
              <p className="font-body text-sm text-muted">
                Add what you paid in Japan and your quotes to compare every way of getting it home.
              </p>
            </div>
          ) : (
            <>
              {cheapestPaid && (
                <div className="rounded-xl p-6" style={{ background: "#15191E" }}>
                  <p className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: "#ffffff66" }}>
                    {cheapest.id === "space" ? "If it doesn't fit your bag, cheapest is" : "Cheapest way home"}
                  </p>
                  <p className="font-display text-4xl leading-none text-white">{cheapestPaid.name}</p>
                  <p className="font-display text-5xl leading-none mt-2" style={{ color: "#4ADE80" }}>
                    ${Math.round(cheapestPaid.total)}
                  </p>
                  {usingTrip && (
                    <p className="font-mono text-sm mt-3" style={{ color: "#ffffff99" }}>
                      Trip profit after getting it home: {tripProfit - cheapestPaid.total >= 0 ? "" : "−"}${Math.abs(Math.round(tripProfit - cheapestPaid.total))}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-surface border border-border rounded-xl p-5">
                <SectionLabel>All Options</SectionLabel>
                <div className="mt-2">
                  {options.map((o) => {
                    const best = o.id === cheapestPaid?.id;
                    return (
                      <div key={o.id} className="py-3 border-b border-border last:border-0">
                        <div className="flex justify-between items-baseline gap-3">
                          <p className="font-body text-sm font-medium text-text">
                            {o.name}
                            {best && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--green)" }}>Cheapest</span>}
                          </p>
                          <p className="font-mono text-sm shrink-0" style={{ color: best ? "var(--green)" : "var(--text)" }}>
                            {o.ready ? `$${Math.round(o.total)}` : "needs quote"}
                          </p>
                        </div>
                        <p className="font-mono text-[11px] text-muted mt-0.5">{o.detail}</p>
                        {o.ready && (
                          <p className="font-mono text-[11px] text-muted">
                            ${o.transport.toFixed(0)} transport + ${o.tax.toFixed(0)} est. tax
                            {usingTrip && ` · profit after: ${tripProfit - o.total >= 0 ? "" : "−"}$${Math.abs(Math.round(tripProfit - o.total))}`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="rounded-xl p-4 border"
                style={{
                  background: overAllowance ? "var(--gold-light)" : "var(--green-light)",
                  borderColor: overAllowance ? "rgba(184,134,11,0.2)" : "rgba(26,122,74,0.2)",
                  color: overAllowance ? "var(--gold)" : "var(--green)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest mb-1">Customs · in your luggage</p>
                <p className="font-body text-sm font-medium">
                  {overAllowance
                    ? `⚠ Over the ${dest.currency} ${dest.allowance} allowance — declare it`
                    : `✓ Under the ${dest.currency} ${dest.allowance} allowance`}
                </p>
                <p className="font-mono text-[11px] mt-1">Shipped parcels don&apos;t get this allowance.</p>
              </div>

              <div className="bg-surface border border-border rounded-xl p-5 space-y-2">
                <SectionLabel>Before You Ship</SectionLabel>
                <ul className="space-y-2 font-body text-xs text-muted">
                  <li>→ Anything bought <strong className="text-text">tax-free</strong> must leave Japan with you. Mailing it home means the 10% consumption tax is owed.</li>
                  {country === "US" && (
                    <li>→ Japan Post suspended US-bound mail after the 2025 tariff changes and resumed it in July 2026. Check the current status before relying on it.</li>
                  )}
                  <li>→ Proxy duty paid upfront (DDP) isn&apos;t a guarantee. Some buyers have been billed again on delivery.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
