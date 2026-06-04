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

export function getMockData(
  query: string,
  _category: string,
  priceJPY: number,
  rate = 154.2,
  condition = "A",
  size = "Small"
): LookupResult | null {
  const match = fuzzyMatch(query);
  if (!match) return null;

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
