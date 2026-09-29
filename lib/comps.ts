import type { Comp } from "./types";
import type { SoldComp } from "./soldComps";

// Keyword search on eBay pulls in listings that aren't the item: broken units,
// spare parts, lots, sibling models. Each one found here is kept (the user can
// see and restore it) but left out of the median, with the reason shown.

const PARTS = /\b(for parts|parts only|not working|non[- ]?working|broken|junk|as[- ]is|untested)\b/i;
const ACCESSORY = /\b(replacement|servicing|repair service|box only|manual only|empty box|strap only|case only|charger only|hands for|strap for|case for|cover for|bezel insert)\b/i;
const LOT = /\b(lot of|job lot|bundle|set of \d+|\d+\s*pcs)\b|\blot\b/i;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Query words that carry a digit are model identifiers ("SKX007", "501", "AE-1").
// A title missing one is almost always a different model.
function modelTokens(query: string): string[] {
  return query
    .split(/\s+/)
    .map(normalize)
    .filter((t) => t.length >= 3 && /\d/.test(t));
}

// "Hands for SKX007" mentions the model but is an accessory for it.
function isAccessoryFor(title: string, tokens: string[]): boolean {
  const lower = title.toLowerCase();
  // Not "fits" — clothing titles use it for sizes ("Fits 32x32").
  const m = lower.match(/\b(for|compatible with)\b(.{0,40})/);
  return !!m && tokens.some((t) => normalize(m[2]).includes(t));
}

function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function markComps(query: string, sold: SoldComp[]): Comp[] {
  const tokens = modelTokens(query);

  const comps: Comp[] = sold.map((s, i) => {
    let reason: string | null = null;
    if (/parts/i.test(s.condition) || PARTS.test(s.title)) reason = "Parts / not working";
    else if (ACCESSORY.test(s.title) || isAccessoryFor(s.title, tokens)) reason = "Accessory, not the item";
    else if (LOT.test(s.title)) reason = "Lot / bundle";
    return {
      id: s.url || `comp-${i}`,
      title: s.title,
      url: s.url,
      price: s.price,
      daysAgo: s.daysAgo,
      condition: s.condition,
      autoExcluded: reason,
    };
  });

  // Model-number check — skipped if it would leave too little to go on
  // (e.g. the user typed the number differently from how sellers write it).
  if (tokens.length) {
    const mismatched = comps.filter(
      (c) => !c.autoExcluded && !tokens.every((t) => normalize(c.title).includes(t))
    );
    const remaining = comps.filter((c) => !c.autoExcluded).length - mismatched.length;
    if (remaining >= 3) mismatched.forEach((c) => (c.autoExcluded = "Different model"));
  }

  // Price outliers (1.5×IQR) among what's left — catches mislabelled or
  // mint-in-box listings that would drag the median.
  const kept = comps.filter((c) => !c.autoExcluded);
  if (kept.length >= 6) {
    const sorted = kept.map((c) => c.price).sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    // IQR's lower fence often lands below $0 — also drop anything under a quarter of the median.
    const low = Math.max(q1 - 1.5 * iqr, quantile(sorted, 0.5) * 0.25);
    kept.forEach((c) => {
      if (c.price < low) c.autoExcluded = "Unusually low price";
      else if (c.price > q3 + 1.5 * iqr) c.autoExcluded = "Unusually high price";
    });
  }

  return comps;
}
