import seikoData from "@/data/lookups/seiko-skx007.json";
import levisData from "@/data/lookups/vintage-levis-501.json";
import olympusData from "@/data/lookups/olympus-mju-ii.json";
import nikkaData from "@/data/lookups/nikka-from-the-barrel.json";
import yamahaData from "@/data/lookups/yamaha-receiver.json";
import type { LookupResult } from "./types";
import { verdictFromROI, roiTierFromROI } from "./utils";


const mockData: Record<string, LookupResult> = {
  "seiko-skx007": seikoData as LookupResult,
  "vintage-levis-501": levisData as LookupResult,
  "olympus-mju-ii": olympusData as LookupResult,
  "nikka-from-the-barrel": nikkaData as LookupResult,
  "yamaha-receiver": yamahaData as LookupResult,
};

const keywordMap: { keywords: string[]; key: string; isSpirits?: boolean }[] = [
  { keywords: ["seiko", "skx", "skx007", "watch", "watches", "dive watch"], key: "seiko-skx007" },
  { keywords: ["levi", "levis", "501", "denim", "jeans"], key: "vintage-levis-501" },
  { keywords: ["olympus", "mju", "stylus", "epic", "camera", "film camera"], key: "olympus-mju-ii" },
  {
    keywords: ["nikka", "whisky", "whiskey", "barrel", "spirits", "alcohol", "sake", "bourbon", "rum", "scotch"],
    key: "nikka-from-the-barrel",
    isSpirits: true,
  },
  {
    keywords: ["yamaha", "receiver", "audio", "amplifier", "hifi", "hi-fi", "stereo", "vintage audio"],
    key: "yamaha-receiver",
  },
];

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

function fuzzyMatch(query: string): { key: string; isSpirits: boolean } | null {
  const q = query.toLowerCase();
  let best: { key: string; score: number; isSpirits: boolean } | null = null;

  for (const { keywords, key, isSpirits } of keywordMap) {
    const score = keywords.reduce((s, kw) => s + (q.includes(kw) ? kw.length : 0), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { key, score, isSpirits: !!isSpirits };
    }
  }

  return best ? { key: best.key, isSpirits: best.isSpirits } : null;
}

// --- Category fallback ---
// Used when no specific item match is found. Gives a verdict based on realistic
// category-level US resale averages rather than returning null.

interface CategoryTemplate {
  avgSellUSD: number;
  priceRange: { min: number; max: number };
  jpSources: string[];
  usSources: string[];
  platforms: Array<{
    name: string;
    fee: number;
    paymentFeeRate: number;
    shipping: number;
    recommended: boolean;
    note?: string;
  }>;
  verdictReason: (item: string, roi: number, verdict: string) => string;
  isSpirits?: boolean;
}

const categoryTemplates: Record<string, CategoryTemplate> = {
  Watches: {
    avgSellUSD: 200,
    priceRange: { min: 60, max: 450 },
    jpSources: ["Mercari JP", "Yahoo Auctions"],
    usSources: ["eBay", "Chrono24"],
    platforms: [
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 12, recommended: true },
      { name: "Chrono24", fee: 0.065, paymentFeeRate: 0, shipping: 12, recommended: false, note: "Slower to sell but lower fees for watches" },
    ],
    verdictReason: (item, roi) =>
      `Category estimate — no specific data for this model yet. Japanese recycle shops grade watches conservatively; B-grade here often looks excellent to Western buyers. Estimated ${roi}x spread based on category averages. Check eBay sold listings for the exact reference before buying.`,
  },
  Clothing: {
    avgSellUSD: 110,
    priceRange: { min: 30, max: 280 },
    jpSources: ["Mercari JP", "Yahoo Auctions"],
    usSources: ["eBay", "Depop", "Grailed"],
    platforms: [
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 20, recommended: true },
      { name: "Depop", fee: 0.10, paymentFeeRate: 0.029, shipping: 20, recommended: false },
      { name: "Grailed", fee: 0.09, paymentFeeRate: 0.029, shipping: 20, recommended: false, note: "Best for premium/designer pieces" },
    ],
    verdictReason: (item, roi) =>
      `Category estimate — no specific data for this piece yet. Vintage Japanese clothing is priced for local turnover; their strict B-grade is often eBay-excellent. Estimated ${roi}x spread based on category averages. Verify on Depop or eBay sold listings.`,
  },
  Electronics: {
    avgSellUSD: 140,
    priceRange: { min: 40, max: 350 },
    jpSources: ["Mercari JP", "Hard Off"],
    usSources: ["eBay"],
    platforms: [
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 20, recommended: true },
    ],
    verdictReason: (item, roi) =>
      `Category estimate — no specific data for this model yet. Japanese electronics rotate quickly through recycle shops and are often underpriced for international demand. Estimated ${roi}x spread based on category averages. Verify on eBay sold listings for the exact model number.`,
  },
  Spirits: {
    avgSellUSD: 130,
    priceRange: { min: 60, max: 300 },
    jpSources: ["Mercari JP", "Yahoo Auctions"],
    usSources: ["eBay", "WineSearcher"],
    platforms: [
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 20, recommended: true, note: "Check alcohol shipping rules for your destination" },
    ],
    verdictReason: () =>
      `Japanese whisky and spirits consistently command overseas premiums. Verify shipping legality for your home country before buying — alcohol import rules vary significantly.`,
    isSpirits: true,
  },
  Sneakers: {
    avgSellUSD: 180,
    priceRange: { min: 60, max: 400 },
    jpSources: ["Mercari JP", "Snkrdunk"],
    usSources: ["StockX", "eBay", "GOAT"],
    platforms: [
      { name: "StockX", fee: 0.095, paymentFeeRate: 0.03, shipping: 14, recommended: true },
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 14, recommended: false },
      { name: "GOAT", fee: 0.095, paymentFeeRate: 0.029, shipping: 14, recommended: false },
    ],
    verdictReason: (item, roi) =>
      `Category estimate — no specific data for this colourway yet. Japanese deadstock is priced on domestic hype cycles that often lag US/EU markets by months. Estimated ${roi}x spread based on category averages. Check StockX for the exact size and colourway.`,
  },
  "Tools & Knives": {
    avgSellUSD: 85,
    priceRange: { min: 30, max: 200 },
    jpSources: ["Mercari JP", "Yahoo Auctions"],
    usSources: ["eBay"],
    platforms: [
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 12, recommended: true },
    ],
    verdictReason: (item, roi) =>
      `Category estimate — no specific data for this item yet. Japanese-made hand tools and knives are systematically undervalued domestically and carry strong import premiums with Western buyers. Estimated ${roi}x spread based on category averages.`,
  },
  Other: {
    avgSellUSD: 80,
    priceRange: { min: 20, max: 200 },
    jpSources: ["Mercari JP", "Yahoo Auctions"],
    usSources: ["eBay", "Depop"],
    platforms: [
      { name: "eBay", fee: 0.1325, paymentFeeRate: 0.03, shipping: 12, recommended: true },
      { name: "Depop", fee: 0.10, paymentFeeRate: 0.029, shipping: 12, recommended: false },
    ],
    verdictReason: (item, roi) =>
      `Category estimate — no specific market data for "${item}" yet. Japanese collectibles and ephemera can carry significant import premiums with overseas buyers. Estimated ${roi}x spread based on category averages. Verify on eBay sold listings before committing.`,
  },
};

const genericCustoms = [
  { country: "United States", flag: "🇺🇸", status: "ok" as const, limit: "No restrictions", note: "Under $800 duty-free personal exemption" },
  { country: "United Kingdom", flag: "🇬🇧", status: "warn" as const, limit: "£390 limit", note: "Declare if over threshold" },
  { country: "Australia", flag: "🇦🇺", status: "ok" as const, limit: "AUD $900 limit", note: "Fine as personal goods" },
  { country: "Canada", flag: "🇨🇦", status: "ok" as const, limit: "CAD $800 limit", note: "Personal exemption applies" },
  { country: "Germany / EU", flag: "🇩🇪", status: "warn" as const, limit: "€430 limit", note: "Lower threshold, keep receipt" },
];

function getCategoryFallback(
  query: string,
  category: string,
  priceJPY: number,
  rate: number,
  condition: string,
  size: string
): LookupResult {
  const template = categoryTemplates[category] ?? categoryTemplates.Other;
  const multiplier = conditionMultipliers[condition] ?? 1.0;
  const shipping = sizeShipping[size] ?? 12;

  const usdEquivalent = Math.round((priceJPY / rate) * 100) / 100;
  const avgSell = Math.round(template.avgSellUSD * multiplier * 100) / 100;
  const roi = Math.round((avgSell / usdEquivalent) * 10) / 10;
  const verdict = verdictFromROI(roi, template.isSpirits);
  const roiTier = roiTierFromROI(roi);

  const platforms = template.platforms.map((p) => {
    const feeAmount = Math.round(avgSell * p.fee * 100) / 100;
    const paymentFee = Math.round(avgSell * p.paymentFeeRate * 100) / 100;
    const netProfit = Math.round((avgSell - feeAmount - shipping - paymentFee - usdEquivalent) * 100) / 100;
    return { name: p.name, fee: p.fee, feeAmount, shipping, paymentFee, netProfit, recommended: p.recommended, ...(p.note ? { note: p.note } : {}) };
  });

  const jpAvgSold = Math.round(avgSell * rate * 0.65);

  return {
    query,
    category,
    jpBuyPrice: priceJPY,
    usdEquivalent,
    exchangeRate: rate,
    verdict,
    verdictReason: template.verdictReason(query, roi, verdict),
    roi,
    roiTier,
    jpMarket: {
      source: template.jpSources,
      avgSoldPrice: jpAvgSold,
      priceRange: { min: Math.round(jpAvgSold * 0.4), max: Math.round(jpAvgSold * 1.8) },
      recentSales: [],
    },
    usMarket: {
      source: template.usSources,
      avgSoldPrice: Math.round(avgSell),
      priceRange: { min: Math.round(template.priceRange.min * multiplier), max: Math.round(template.priceRange.max * multiplier) },
      recentSales: [],
    },
    profitBreakdown: {
      buyPrice: usdEquivalent,
      avgSellPrice: avgSell,
      platforms,
    },
    customs: genericCustoms,
  };
}

export function getMockData(
  query: string,
  category: string,
  priceJPY: number,
  rate = 154.2,
  condition = "A",
  size = "Small"
): LookupResult | null {
  const match = fuzzyMatch(query);
  if (!match) return getCategoryFallback(query, category, priceJPY, rate, condition, size);

  const base = mockData[match.key];
  if (!base) return null;

  const multiplier = conditionMultipliers[condition] ?? 1.0;
  const shipping = sizeShipping[size] ?? 12;
  const usdEquivalent = Math.round((priceJPY / rate) * 100) / 100;

  const baseBuyJPY = base.jpBuyPrice;
  const adjustedROI = Math.round((baseBuyJPY / priceJPY) * base.roi * multiplier * 10) / 10;

  const baseAvgSell = base.profitBreakdown.avgSellPrice;
  const newAvgSell = Math.round(baseAvgSell * multiplier * 100) / 100;

  const newPlatforms = base.profitBreakdown.platforms.map((p) => {
    const newFeeAmount = Math.round(newAvgSell * p.fee * 100) / 100;
    const paymentFeeRate = baseAvgSell > 0 ? p.paymentFee / baseAvgSell : 0;
    const newPaymentFee = Math.round(newAvgSell * paymentFeeRate * 100) / 100;
    const newNetProfit =
      Math.round((newAvgSell - newFeeAmount - shipping - newPaymentFee - usdEquivalent) * 100) / 100;
    return { ...p, feeAmount: newFeeAmount, paymentFee: newPaymentFee, shipping, netProfit: newNetProfit };
  });

  const verdict = verdictFromROI(adjustedROI, match.isSpirits);
  const roiTier = roiTierFromROI(adjustedROI);

  return {
    ...base,
    jpBuyPrice: priceJPY,
    usdEquivalent,
    exchangeRate: rate,
    roi: adjustedROI,
    roiTier,
    verdict,
    usMarket: {
      ...base.usMarket,
      avgSoldPrice: Math.round(newAvgSell),
    },
    profitBreakdown: {
      ...base.profitBreakdown,
      buyPrice: usdEquivalent,
      avgSellPrice: newAvgSell,
      platforms: newPlatforms,
    },
  };
}
