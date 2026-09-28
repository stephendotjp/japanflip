import type { MarketData as MarketDataType } from "@/lib/types";

interface MarketDataProps {
  market: MarketDataType;
  country: string;
  flag: string;
  isUSMarket?: boolean;
}

export function MarketData({ market, country, flag, isUSMarket }: MarketDataProps) {
  const hasData = market.recentSales.length > 0 || market.avgSoldPrice > 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-fadeUp">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted">
          {flag} {country} — What They Pay
        </span>
      </div>

      {!hasData && (
        <p className="font-body text-sm text-muted py-2">
          {market.source[0] ?? "No data available yet."}
        </p>
      )}

      <div className="space-y-0">
        {market.recentSales.map((sale, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0"
          >
            <div className="flex-1 min-w-0">
              {sale.url ? (
                <a
                  href={sale.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-text truncate block hover:underline"
                  title="Open this sold listing"
                >
                  {sale.title}
                </a>
              ) : (
                <p className="font-body text-sm text-text truncate">{sale.title}</p>
              )}
              <p className="font-mono text-[11px] text-muted">
                {sale.source} · {sale.daysAgo}d ago
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm text-text">
                {isUSMarket || sale.currency === "USD" ? "$" : "¥"}
                {sale.price.toLocaleString()}
              </p>
              {sale.sold && (
                <span className="font-mono text-[10px] text-green">✓ Sold</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasData && (
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Avg Sold</span>
          <span className="font-mono text-sm text-text font-medium">
            {isUSMarket ? "$" : "¥"}
            {market.avgSoldPrice.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
