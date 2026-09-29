"use client";

import { useEffect, useState } from "react";

// A live lookup takes ~15–20s (sold-comps scrapes eBay on demand), so show
// what's happening instead of a blank skeleton. Steps are timed, not reported
// by the server — the bar eases toward 90% and never claims to be done.
const steps = [
  { at: 0, label: "Searching eBay sold listings" },
  { at: 5, label: "Reading prices from recent sales" },
  { at: 11, label: "Filtering out parts, lots & accessories" },
];
const SLOW_AFTER = 22;

export function LookupLoading({ item }: { item: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 250);
    return () => clearInterval(id);
  }, []);

  const progress = 90 * (1 - Math.exp(-elapsed / 8));
  const current = steps.filter((s) => elapsed >= s.at).length - 1;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 space-y-5 animate-fadeIn">
      <div className="space-y-1 min-w-0">
        <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted">Checking</p>
        <p className="font-display text-2xl md:text-3xl text-black leading-tight truncate">{item}</p>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%`, background: "var(--black)" }}
        />
      </div>

      <ul className="space-y-2.5">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={s.label}
              className={`flex items-center gap-3 font-body text-sm transition-opacity duration-300 ${
                i > current ? "opacity-35" : "opacity-100"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {done ? (
                  <svg viewBox="0 0 16 16" className="w-4 h-4" style={{ color: "var(--green)" }} aria-hidden>
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <span
                    className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                    style={{ borderColor: "var(--border)", borderTopColor: "var(--black)" }}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--border)" }} />
                )}
              </span>
              <span className={active ? "text-black" : "text-muted"}>{s.label}</span>
            </li>
          );
        })}
      </ul>

      <p className="font-mono text-[11px] text-muted">
        {elapsed < SLOW_AFTER
          ? "Real sold listings, pulled live — usually 15–20 seconds."
          : "eBay is slow right now — still working…"}
      </p>
    </div>
  );
}
