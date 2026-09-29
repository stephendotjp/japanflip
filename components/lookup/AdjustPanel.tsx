"use client";

import { useEffect, useRef } from "react";

interface AdjustPanelProps {
  priceJPY: number | null;
  onPriceChange: (price: number | null) => void;
  onPriceCommit: () => void;
  condition: string;
  onConditionChange: (c: string) => void;
  size: string;
  onSizeChange: (s: string) => void;
  focusPrice?: boolean;
}

const conditions = ["S", "A", "B", "C"];
const conditionLabels: Record<string, string> = {
  S: "S — Like new / mint",
  A: "A — Excellent, minor wear",
  B: "B — Good, visible use",
  C: "C — Fair, obvious wear",
};
const sizes = ["Small", "Medium", "Large", "Oversized"];

function Pill({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-3 py-1.5 rounded-md font-mono text-xs font-medium border transition-colors"
      style={{
        background: active ? "var(--black)" : "transparent",
        color: active ? "white" : "var(--muted)",
        borderColor: active ? "var(--black)" : "var(--border)",
      }}
    >
      {children}
    </button>
  );
}

// Everything here recomputes the verdict in the browser — no new lookup, no cost.
export function AdjustPanel({
  priceJPY,
  onPriceChange,
  onPriceCommit,
  condition,
  onConditionChange,
  size,
  onSizeChange,
  focusPrice,
}: AdjustPanelProps) {
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusPrice) priceRef.current?.focus();
  }, [focusPrice]);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 md:p-5 space-y-3 animate-fadeUp">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="adjust-price" className="font-mono text-[10px] uppercase tracking-widest text-muted w-24 shrink-0">
          Tag price
        </label>
        <div className="relative flex-1 min-w-[140px] max-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg" style={{ color: "var(--muted)" }}>
            ¥
          </span>
          <input
            id="adjust-price"
            ref={priceRef}
            type="text"
            inputMode="numeric"
            value={priceJPY ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^0-9]/g, ""));
              onPriceChange(n > 0 ? n : null);
            }}
            onBlur={onPriceCommit}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
            placeholder="Add price"
            className="w-full pl-8 pr-3 py-2.5 border border-border rounded-md font-mono text-lg text-text bg-white focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className="font-mono text-[10px] uppercase tracking-widest text-muted w-24 shrink-0 cursor-help"
          title="JP recycle shops grade items S (mint) → A (excellent) → B (good) → C (fair). Adjusts the expected sell price."
        >
          Condition ⓘ
        </span>
        <div className="flex gap-1.5">
          {conditions.map((c) => (
            <Pill key={c} active={condition === c} onClick={() => onConditionChange(c)} title={conditionLabels[c]}>
              {c}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted w-24 shrink-0">Shipping</span>
        <div className="flex gap-1.5 flex-wrap">
          {sizes.map((s) => (
            <Pill key={s} active={size === s} onClick={() => onSizeChange(s)}>
              {s}
            </Pill>
          ))}
        </div>
      </div>

      {size === "Oversized" && (
        <p className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
          ⚠ Large items may not be cost-effective to ship. Verify carrier rates before buying.
        </p>
      )}
    </div>
  );
}
