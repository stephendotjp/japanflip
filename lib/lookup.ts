import type { Comp, CustomsEntry, LookupResponse, LookupResult, Platform, Sale } from "./types";
import { verdictFromROI, roiTierFromROI } from "./utils";

// Pure verdict math — runs in the browser on the comps from /api/lookup, so
// changing the tag price, condition, size or which comps count is instant and free.

const MIN_COMPS_FOR_VERDICT = 3;

const conditionMultipliers: Record<string, number> = {
  S: 1.10,
  A: 1.00,
  B: 0.80,
  C: 0.60,
};

const sizeShipping: Record<string, number> = {
  Small: 12,
  Medium: 20,
  Large: 45,
  Oversized: 80,
};

export const genericCustoms: CustomsEntry[] = [
  { country: "United States", flag: "🇺🇸", status: "ok", limit: "No restrictions", note: "Under $800 duty-free personal exemption" },
  { country: "United Kingdom", flag: "🇬🇧", status: "warn", limit: "£390 limit", note: "Declare if over threshold" },
  { country: "Australia", flag: "🇦🇺", status: "ok", limit: "AUD $900 limit", note: "Fine as personal goods" },
  { country: "Canada", flag: "🇨🇦", status: "ok", limit: "CAD $800 limit", note: "Personal exemption applies" },
  { country: "Germany / EU", flag: "🇩🇪", status: "warn", limit: "€430 limit", note: "Lower threshold, keep receipt" },
];

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// overrides[id] = true forces a comp in, false forces it out; otherwise the auto filter decides.
export function isCompIncluded(comp: Comp, overrides: Record<string, boolean>): boolean {
  return overrides[comp.id] ?? !comp.autoExcluded;
}

export function buildResult(
  data: LookupResponse,
  opts: { priceJPY: number | null; condition: string; size: string; overrides: Record<string, boolean> }
): LookupResult {
  const { query, category, exchangeRate: rate } = data;
  const priceJPY = opts.priceJPY && opts.priceJPY > 0 ? opts.priceJPY : 0;
  const valueOnly = priceJPY === 0;
  const usdEquivalent = Math.round((priceJPY / rate) * 100) / 100;
  const multiplier = conditionMultipliers[opts.condition] ?? 1.0;
  const shipping = sizeShipping[opts.size] ?? 12;
  const isSpirits = category === "Spirits";

  const used = data.comps.filter((c) => isCompIncluded(c, opts.overrides));
  const prices = used.map((c) => c.price);

  const sales: Sale[] = used.map((c) => ({
    title: c.title,
    source: "eBay",
    daysAgo: c.daysAgo,
    price: c.price,
    currency: "USD",
    sold: true,
    url: c.url,
  }));

  const base = {
    query,
    category,
    jpBuyPrice: priceJPY,
    usdEquivalent,
    exchangeRate: rate,
    valueOnly,
    compsUsed: prices.length,
    customs: genericCustoms,
  };

  // Never invent a confident verdict from thin evidence — this is the
  // "opaque estimate you can't check" failure mode this rebuild exists to avoid.
  if (prices.length < MIN_COMPS_FOR_VERDICT) {
    const roughAvg = prices.length ? Math.round(median(prices)) : 0;
    return {
      ...base,
      verdict: "maybe",
      verdictReason:
        prices.length === 0
          ? `No matching sold listings for "${query}". Don't buy on hope — try a more specific search (add model number/year) or check eBay yourself before committing.`
          : `Only ${prices.length} matching sold listing${prices.length > 1 ? "s" : ""} — not enough evidence for a confident call. Treat the numbers below as a rough signal, not a verdict.`,
      roi: 0,
      roiTier: "low",
      usMarket: {
        source: ["eBay — sold listings"],
        avgSoldPrice: roughAvg,
        priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 0 },
        recentSales: sales,
      },
      profitBreakdown: { buyPrice: usdEquivalent, avgSellPrice: roughAvg, platforms: [] },
    };
  }

  const avgSell = Math.round(median(prices) * multiplier * 100) / 100;
  const usMarket = {
    source: ["eBay — sold listings"],
    avgSoldPrice: avgSell,
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    recentSales: sales,
  };

  if (valueOnly) {
    return {
      ...base,
      verdict: "maybe",
      verdictReason: `Median of ${prices.length} matching eBay sales (condition-adjusted). Add the tag price to see if it's worth buying.`,
      roi: 0,
      roiTier: "low",
      usMarket,
      profitBreakdown: { buyPrice: 0, avgSellPrice: avgSell, platforms: [] },
    };
  }

  const roi = Math.round((avgSell / usdEquivalent) * 10) / 10;
  const verdict = verdictFromROI(roi, isSpirits);
  const roiTier = roiTierFromROI(roi);

  const feeAmount = Math.round(avgSell * 0.1325 * 100) / 100;
  const paymentFee = Math.round(avgSell * 0.03 * 100) / 100;
  const netProfit = Math.round((avgSell - feeAmount - shipping - paymentFee - usdEquivalent) * 100) / 100;

  const platforms: Platform[] = [
    { name: "eBay", fee: 0.1325, feeAmount, shipping, paymentFee, netProfit, recommended: true },
  ];

  const verdictLead =
    verdict === "buy"
      ? "Solid spread after fees."
      : verdict === "skip"
      ? "Spread is too thin after fees — pass."
      : isSpirits
      ? "Spirits always get a closer look — check import rules for alcohol before buying."
      : "Thin margin — worth a closer look before buying.";

  return {
    ...base,
    verdict,
    verdictReason: `Based on ${prices.length} matching sold listings (median $${Math.round(median(prices))}). ${verdictLead}`,
    roi,
    roiTier,
    usMarket,
    profitBreakdown: { buyPrice: usdEquivalent, avgSellPrice: avgSell, platforms },
  };
}
