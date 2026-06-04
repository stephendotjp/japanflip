"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SectionLabel } from "@/components/ui/SectionLabel";

const countries: Record<
  string,
  {
    name: string;
    flag: string;
    general: { limit: string; note: string };
    alcohol: { limit: string; note: string; status: "ok" | "warn" | "danger" };
    knives: { limit: string; note: string; status: "ok" | "warn" | "danger" };
    electronics: { limit: string; note: string; status: "ok" | "warn" };
  }
> = {
  US: {
    name: "United States",
    flag: "🇺🇸",
    general: { limit: "$800 USD", note: "Personal duty-free exemption. Items for resale may be subject to customs duties even under $800." },
    alcohol: { limit: "1 liter duty-free", note: "Over 1L: 19.8¢/liter federal excise tax. State laws vary — some states restrict alcohol imports entirely.", status: "warn" },
    knives: { limit: "Blade under 3 inches generally OK", note: "Switchblades, gravity knives, and ballistic knives are federally prohibited. State laws vary significantly.", status: "warn" },
    electronics: { limit: "No restrictions", note: "Electronics are unrestricted. High-value items may attract attention but are not prohibited.", status: "ok" },
  },
  UK: {
    name: "United Kingdom",
    flag: "🇬🇧",
    general: { limit: "£390 GBP", note: "Items over £390 must be declared. Keep receipts. Non-EU goods are subject to UK customs since Brexit." },
    alcohol: { limit: "1 liter spirits duty-free", note: "Standard traveler's allowance. Over 1L: duty + VAT applies. Keep receipts.", status: "warn" },
    knives: { limit: "Blade under 3 inches, non-locking", note: "UK knife laws are strict. Locking blades are generally prohibited in public. Fixed-blade knives require 'good reason'. Leave knives at home.", status: "danger" },
    electronics: { limit: "£390 limit", note: "At typical JP prices (¥3,000–15,000 = £15–£75) you're well under the limit.", status: "ok" },
  },
  AU: {
    name: "Australia",
    flag: "🇦🇺",
    general: { limit: "AUD $900", note: "Concession limit for personal goods. Must declare all goods including gifts. Strict biosecurity laws — no food or organic material." },
    alcohol: { limit: "2.25 liters duty-free", note: "Most generous alcohol allowance. Over 2.25L: duty and GST applies. Declare all alcohol.", status: "warn" },
    knives: { limit: "Permitted as personal property", note: "No specific blade length restriction for personal carry, but prohibited weapons laws vary by state. Knives must be packed in checked baggage.", status: "warn" },
    electronics: { limit: "AUD $900 limit", note: "Typical JP electronics are well under the threshold. Declare if over.", status: "ok" },
  },
  CA: {
    name: "Canada",
    flag: "🇨🇦",
    general: { limit: "CAD $800", note: "Personal exemption after 48+ hours abroad. Provincial taxes may still apply. Keep all receipts." },
    alcohol: { limit: "1.14 liters spirits duty-free", note: "You must meet your province's minimum age. Provincial liquor board regulations also apply.", status: "warn" },
    knives: { limit: "No federal blade length limit", note: "Prohibited: switchblades, butterfly knives, gravity knives. Fixed-blade and folding knives are generally OK. Province-specific laws vary.", status: "warn" },
    electronics: { limit: "CAD $800 limit", note: "Most JP electronics fall well under the CAD $800 limit.", status: "ok" },
  },
  EU: {
    name: "Germany / EU",
    flag: "🇩🇪",
    general: { limit: "€430 EUR", note: "Lower than other Western countries. Items over €430 must be declared and VAT + duty applies. Keep all receipts." },
    alcohol: { limit: "1 liter spirits duty-free", note: "Standard EU allowance from non-EU countries. Over 1L: duty and VAT applies.", status: "warn" },
    knives: { limit: "Blade under 12cm generally OK", note: "Germany: knives over 12cm fixed blade or locking folders require justification. One-handed openers may be restricted. Check specific destination country laws.", status: "warn" },
    electronics: { limit: "€430 limit", note: "A ¥5,000 item (~€30) is well under limit. A ¥70,000 camera may need declaration.", status: "ok" },
  },
  NZ: {
    name: "New Zealand",
    flag: "🇳🇿",
    general: { limit: "NZD $700", note: "Lower limit than Australia. Very strict biosecurity — declare everything. Penalties are significant." },
    alcohol: { limit: "3 bottles (up to 4.5L) duty-free", note: "Must be 18+. Most generous allowance in the region. Declare if over.", status: "ok" },
    knives: { limit: "Blade under 4 inches generally OK", note: "Offensive weapons prohibited. Kitchen and pocket knives are generally fine as personal property.", status: "ok" },
    electronics: { limit: "NZD $700 limit", note: "Common JP electronics are well under limit.", status: "ok" },
  },
  SG: {
    name: "Singapore",
    flag: "🇸🇬",
    general: { limit: "SGD $500 (travel < 48h) / SGD $1,000 (48h+)", note: "Very strict customs. Declare everything. Fines for non-declaration are heavy." },
    alcohol: { limit: "1L duty-free (1L wine OR 1L beer)", note: "Only if resident arriving from outside Singapore. Non-residents: no duty-free alcohol allowance. Buy at Changi arrivals if you want.", status: "danger" },
    knives: { limit: "Highly restricted", note: "Offensive weapons prohibited. Carry-on knives over 6cm are prohibited. Very strict — leave knives at home.", status: "danger" },
    electronics: { limit: "SGD $500 or $1,000 limit", note: "Declare if combined goods value exceeds threshold.", status: "warn" },
  },
};

const itemTypes = ["General Goods", "Alcohol / Spirits", "Knives & Tools", "Electronics"];

export default function CustomsPage() {
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedItem, setSelectedItem] = useState("General Goods");

  const c = countries[selectedCountry];
  const itemKey =
    selectedItem === "Alcohol / Spirits"
      ? "alcohol"
      : selectedItem === "Knives & Tools"
      ? "knives"
      : selectedItem === "Electronics"
      ? "electronics"
      : "general";

  const rule = c[itemKey as keyof typeof c] as {
    limit: string;
    note: string;
    status?: "ok" | "warn" | "danger";
  };

  const statusColor = {
    ok: { bg: "var(--green-light)", text: "var(--green)", border: "rgba(26,122,74,0.2)" },
    warn: { bg: "var(--gold-light)", text: "var(--gold)", border: "rgba(184,134,11,0.2)" },
    danger: { bg: "var(--red-light)", text: "var(--red)", border: "rgba(217,43,58,0.2)" },
  };

  const statusIcon = { ok: "✓", warn: "⚠", danger: "✕" };
  const statusLabel = { ok: "No restrictions", warn: "Check rules", danger: "High risk" };
  const status = rule.status ?? "ok";
  const colors = statusColor[status];

  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <TopBar
        title="Customs Checker"
        subtitle="Know the rules before you fly home."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-6">
          <SectionLabel>Your Situation</SectionLabel>
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                Destination Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-md font-mono text-xs bg-white focus:outline-none"
              >
                {Object.entries(countries).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.flag} {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted block mb-1">
                Item Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {itemTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedItem(t)}
                    className="px-3 py-2.5 border rounded-md font-mono text-xs text-left transition-colors"
                    style={{
                      borderColor: selectedItem === t ? "var(--red)" : "var(--border)",
                      color: selectedItem === t ? "var(--red)" : "var(--muted)",
                      background: selectedItem === t ? "var(--red-light)" : "var(--surface)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status card */}
          <div
            className="rounded-xl p-6 border"
            style={{ background: colors.bg, borderColor: colors.border }}
          >
            <p className="font-mono text-[10px] tracking-[2px] uppercase mb-1" style={{ color: colors.text }}>
              {c.flag} {c.name} · {selectedItem}
            </p>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display text-4xl" style={{ color: colors.text }}>
                {statusIcon[status]}
              </span>
              <span className="font-display text-2xl" style={{ color: colors.text }}>
                {statusLabel[status]}
              </span>
            </div>
            <p className="font-mono text-sm font-medium mb-2" style={{ color: colors.text }}>
              {rule.limit}
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: colors.text }}>
              {rule.note}
            </p>
          </div>

          {/* General limit */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted mb-2">
              General Duty-Free Limit
            </p>
            <p className="font-mono text-lg text-text">{c.general.limit}</p>
            <p className="font-body text-sm text-muted mt-1 leading-relaxed">{c.general.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
