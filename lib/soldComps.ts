// Client for sold-comps.com — returns real, verifiable eBay sold listings.
// Used instead of eBay's own developer API (account access denied) to fix
// the core trust problem: the app must never show a price a user can't check.

interface SoldCompsItem {
  url: string;
  title: string;
  condition: string;
  endedAt: string;
  soldPrice: string;
  soldCurrency: string;
  listingType: string;
}

interface SoldCompsResponse {
  items?: SoldCompsItem[];
}

export interface SoldComp {
  title: string;
  url: string;
  price: number;
  currency: string;
  daysAgo: number;
  condition: string;
}

function daysAgo(dateStr: string): number {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.round(diffMs / 86_400_000));
}

export async function fetchSoldComps(keyword: string): Promise<SoldComp[]> {
  const apiKey = process.env.SOLD_COMPS_API_KEY;
  if (!apiKey || !keyword.trim()) return [];

  try {
    const res = await fetch(
      `https://api.sold-comps.com/v1/scrape?keyword=${encodeURIComponent(keyword)}`,
      { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" }
    );
    if (!res.ok) return [];

    const data: SoldCompsResponse = await res.json();

    return (data.items ?? [])
      .filter((i) => i.listingType === "sold" && i.soldPrice)
      .map((i) => ({
        title: i.title,
        url: i.url,
        price: parseFloat(i.soldPrice),
        currency: i.soldCurrency || "USD",
        daysAgo: daysAgo(i.endedAt),
        condition: i.condition ?? "",
      }))
      // Verdict math is in USD; a GBP/EUR sale mixed into the median would skew it.
      .filter((s) => s.price > 0 && s.currency === "USD")
      .sort((a, b) => a.daysAgo - b.daysAgo);
  } catch {
    return [];
  }
}
