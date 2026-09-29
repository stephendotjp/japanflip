"use client";

import { useState } from "react";
import type { Comp } from "@/lib/types";
import { isCompIncluded } from "@/lib/lookup";

interface CompsListProps {
  comps: Comp[];
  overrides: Record<string, boolean>;
  onToggle: (comp: Comp, include: boolean) => void;
}

const PAGE = 10;

function CompRow({ comp, included, onToggle }: { comp: Comp; included: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0" style={{ opacity: included ? 1 : 0.55 }}>
        <a
          href={comp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm text-text line-clamp-2 hover:underline"
          title="Open this sold listing on eBay"
        >
          {comp.title}
        </a>
        <p className="font-mono text-[11px] text-muted">
          {comp.daysAgo}d ago{comp.condition ? ` · ${comp.condition}` : ""}
          {!included && comp.autoExcluded ? ` · ${comp.autoExcluded}` : ""}
        </p>
      </div>
      <p className="font-mono text-sm text-text shrink-0 pt-0.5" style={{ textDecoration: included ? "none" : "line-through" }}>
        ${comp.price.toLocaleString()}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 w-8 h-8 -my-1 rounded-md border border-border font-mono text-sm text-muted hover:text-text hover:border-text transition-colors"
        title={included ? "Not the same item — leave it out" : "Count this sale"}
        aria-label={included ? "Exclude this sale" : "Include this sale"}
      >
        {included ? "✕" : "+"}
      </button>
    </div>
  );
}

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function CompsList({ comps, overrides, onToggle }: CompsListProps) {
  const [shown, setShown] = useState(PAGE);
  const [showExcluded, setShowExcluded] = useState(false);

  const included = comps.filter((c) => isCompIncluded(c, overrides));
  const excluded = comps.filter((c) => !isCompIncluded(c, overrides));

  return (
    <div className="bg-surface border border-border rounded-xl p-4 md:p-5 animate-fadeUp">
      <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted">🇺🇸 eBay sold listings</p>
      <p className="font-mono text-sm text-text mt-1 mb-1">
        {included.length} of {comps.length} used
        {included.length > 0 && ` · median $${Math.round(median(included.map((c) => c.price))).toLocaleString()}`}
      </p>
      <p className="font-body text-xs text-muted mb-3">
        Tap ✕ on anything that isn&apos;t the same item — the verdict updates instantly.
      </p>

      {comps.length === 0 && (
        <p className="font-body text-sm text-muted py-2">No sold listings found for this search.</p>
      )}

      <div>
        {included.slice(0, shown).map((c) => (
          <CompRow key={c.id} comp={c} included onToggle={() => onToggle(c, false)} />
        ))}
      </div>

      {included.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 20)}
          className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted hover:text-text"
        >
          Show more ({included.length - shown}) ↓
        </button>
      )}

      {excluded.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setShowExcluded((v) => !v)}
            className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-text"
          >
            {showExcluded ? "Hide" : "Show"} {excluded.length} left out (parts, accessories, other models) {showExcluded ? "↑" : "↓"}
          </button>
          {showExcluded && (
            <div className="mt-2">
              {excluded.map((c) => (
                <CompRow key={c.id} comp={c} included={false} onToggle={() => onToggle(c, true)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
