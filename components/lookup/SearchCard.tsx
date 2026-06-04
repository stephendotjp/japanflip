"use client";

import { useState, useEffect } from "react";

interface SearchCardProps {
  onSearch: (item: string, category: string, priceJPY: number, condition: string, size: string) => void;
  loading?: boolean;
  disabled?: boolean;
  initialItem?: string;
  initialPrice?: string;
}

const categories = [
  "Watches",
  "Clothing",
  "Electronics",
  "Spirits",
  "Sneakers",
  "Tools & Knives",
  "Other",
];

const conditions = ["S", "A", "B", "C"] as const;

const conditionLabels: Record<string, string> = {
  S: "S — Like new / mint",
  A: "A — Excellent, minor wear",
  B: "B — Good, visible use",
  C: "C — Fair, obvious wear",
};

const sizes = ["Small", "Medium", "Large", "Oversized"] as const;

const categoryDefaultSize: Record<string, string> = {
  Watches: "Small",
  Clothing: "Medium",
  Electronics: "Small",
  Spirits: "Small",
  Sneakers: "Medium",
  "Tools & Knives": "Small",
  Other: "Small",
};

export function SearchCard({
  onSearch,
  loading,
  disabled,
  initialItem = "",
  initialPrice = "",
}: SearchCardProps) {
  const [item, setItem] = useState(initialItem);
  const [category, setCategory] = useState("Watches");
  const [price, setPrice] = useState(initialPrice);
  const [condition, setCondition] = useState("A");
  const [size, setSize] = useState("Small");

  useEffect(() => {
    setSize(categoryDefaultSize[category] ?? "Small");
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price.replace(/[^0-9]/g, ""));
    if (!item.trim() || !numPrice) return;
    onSearch(item.trim(), category, numPrice, condition, size);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 md:p-6">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-black">What did you find?</h2>
        <p className="font-body text-sm mt-0.5" style={{ color: "var(--muted)" }}>
          Enter the item and price tag. We check both JP and US markets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder='e.g. "Seiko SKX007" or "Levi 501 made in USA"'
            disabled={disabled}
            className="flex-[2] px-4 py-3 border border-border rounded-md font-body text-sm text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled}
            className="px-4 py-3 border border-border rounded-md font-mono text-xs text-text bg-white focus:outline-none focus:border-red/50 disabled:opacity-40"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm"
              style={{ color: "var(--muted)" }}
            >
              ¥
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              disabled={disabled}
              className="pl-7 pr-4 py-3 border border-border rounded-md font-mono text-sm text-text bg-white focus:outline-none focus:border-red/50 w-full md:w-32 disabled:opacity-40"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !item.trim() || !price || disabled}
            className="px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ background: "var(--red)" }}
          >
            {loading ? "Checking..." : "Check It →"}
          </button>
        </div>

        {/* Condition selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Condition</span>
            <span
              className="font-mono text-[9px] text-muted cursor-help"
              title="JP recycle shops grade items S (mint) → A (excellent) → B (good) → C (fair). Affects estimated sell price."
            >
              ⓘ
            </span>
          </div>
          <div className="flex gap-1.5">
            {conditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                disabled={disabled}
                title={conditionLabels[c]}
                className="px-3 py-1.5 rounded-md font-mono text-xs font-medium border transition-colors disabled:opacity-40"
                style={{
                  background: condition === c ? "var(--black)" : "transparent",
                  color: condition === c ? "white" : "var(--muted)",
                  borderColor: condition === c ? "var(--black)" : "var(--border)",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Size selector */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Size / Shipping</span>
          <div className="flex gap-1.5 flex-wrap">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                disabled={disabled}
                className="px-3 py-1.5 rounded-md font-mono text-xs font-medium border transition-colors disabled:opacity-40"
                style={{
                  background: size === s ? "var(--black)" : "transparent",
                  color: size === s ? "white" : "var(--muted)",
                  borderColor: size === s ? "var(--black)" : "var(--border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {size === "Oversized" && (
          <div
            className="px-4 py-2.5 rounded-md border text-sm"
            style={{ background: "var(--gold-light)", borderColor: "rgba(184,134,11,0.2)" }}
          >
            <span className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
              ⚠ Large items may not be cost-effective to ship. Verify carrier rates before buying.
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
