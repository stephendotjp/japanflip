"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";

const thresholds: Record<string, { label: string; thresholdUSD: number }> = {
  US: { label: "United States", thresholdUSD: 800 },
  UK: { label: "United Kingdom", thresholdUSD: 390 * 1.27 },
  AU: { label: "Australia", thresholdUSD: 900 * 0.64 },
  CA: { label: "Canada", thresholdUSD: 800 * 0.73 },
  EU: { label: "EU", thresholdUSD: 430 * 1.08 },
  NZ: { label: "New Zealand", thresholdUSD: 700 * 0.61 },
  SG: { label: "Singapore", thresholdUSD: 400 * 0.74 },
};

const countries = Object.entries(thresholds).map(([code, v]) => ({ code, label: v.label }));

interface CustomsInlineAlertProps {
  itemValueUSD: number;
}

export function CustomsInlineAlert({ itemValueUSD }: CustomsInlineAlertProps) {
  const { homeCountry, setHomeCountry } = useUser();
  const ct = thresholds[homeCountry] ?? thresholds.US;
  const pct = itemValueUSD / ct.thresholdUSD;

  let status: "ok" | "near" | "over";
  if (pct >= 1) status = "over";
  else if (pct >= 0.8) status = "near";
  else status = "ok";

  const styles = {
    ok: { bg: "var(--green-light)", border: "rgba(26,122,74,0.2)", color: "var(--green)" },
    near: { bg: "var(--gold-light)", border: "rgba(184,134,11,0.2)", color: "var(--gold)" },
    over: { bg: "#FEE2E2", border: "rgba(220,38,38,0.2)", color: "var(--red)" },
  }[status];

  const messages = {
    ok: `Under your duty-free limit ✓`,
    near: `Approaching your duty-free limit — declare if combined with other purchases`,
    over: `Exceeds duty-free limit — you will need to declare this item`,
  }[status];

  return (
    <div
      className="rounded-lg px-4 py-3 border flex flex-wrap items-center justify-between gap-3"
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-widest shrink-0" style={{ color: styles.color }}>
          Customs
        </span>
        <span className="font-body text-xs" style={{ color: styles.color }}>
          {messages}
        </span>
        <Link
          href="/app/customs"
          className="font-mono text-[10px] shrink-0 underline"
          style={{ color: styles.color }}
        >
          Details →
        </Link>
      </div>
      <select
        value={homeCountry}
        onChange={(e) => setHomeCountry(e.target.value)}
        className="font-mono text-xs border rounded px-2 py-1 bg-white focus:outline-none shrink-0"
        style={{ borderColor: styles.border }}
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
