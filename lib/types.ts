export type Tier = "free" | "basic" | "premium";

export interface ScoutItem {
  id: string;
  photoDataUrl: string;
  priceJPY: number;
  storeName: string | null;
  storeCoords: { lat: number; lng: number } | null;
  category: string | null;
  itemName: string | null;
  notes: string;
  scoutedAt: string;
  resolved: boolean;
  verdict: "buy" | "skip" | "maybe" | null;
}

export interface TripItem {
  id: string;
  itemName: string;
  priceJPY: number;
  priceUSD: number;
  netProfit: number;
  platform: string;
  timestamp: number;
}
export type Verdict = "buy" | "skip" | "maybe";
export type RoiTier = "high" | "medium" | "low";

export interface SavedLookup {
  id: string;
  item: string;
  category: string;
  jpPrice: number;
  verdict: Verdict;
  roi: number;
  timestamp: number;
}

export interface Sale {
  title: string;
  source: string;
  daysAgo: number;
  price: number;
  currency?: string;
  sold: boolean;
}

export interface Platform {
  name: string;
  fee: number;
  feeAmount: number;
  shipping: number;
  paymentFee: number;
  netProfit: number;
  recommended: boolean;
  note?: string;
}

export interface CustomsEntry {
  country: string;
  flag: string;
  status: "ok" | "warn" | "danger";
  limit: string;
  note: string;
}

export interface MarketData {
  source: string[];
  avgSoldPrice: number;
  priceRange: { min: number; max: number };
  recentSales: Sale[];
}

export interface LookupResult {
  query: string;
  category: string;
  jpBuyPrice: number;
  usdEquivalent: number;
  exchangeRate: number;
  verdict: Verdict;
  verdictReason: string;
  roi: number;
  roiTier: RoiTier;
  jpMarket: MarketData;
  usMarket: MarketData;
  profitBreakdown: {
    buyPrice: number;
    avgSellPrice: number;
    platforms: Platform[];
  };
  customs: CustomsEntry[];
}
