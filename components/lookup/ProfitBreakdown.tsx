import type { LookupResult } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CustomsInlineAlert } from "./CustomsInlineAlert";

interface ProfitBreakdownProps {
  result: LookupResult;
}

export function ProfitBreakdown({ result }: ProfitBreakdownProps) {
  const rec = result.profitBreakdown.platforms.find((p) => p.recommended);
  if (!rec) return null;

  const netProfit = rec.netProfit;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 animate-fadeUp space-y-4">
      <div>
        <SectionLabel>Profit Breakdown · {rec.name}</SectionLabel>

        <div className="space-y-0">
          {[
            {
              label: "You pay in Japan",
              value: `¥${result.jpBuyPrice.toLocaleString()} (~$${result.usdEquivalent})`,
              negative: false,
            },
            {
              label: "Average US sell price",
              value: `$${result.profitBreakdown.avgSellPrice}`,
              negative: false,
            },
            {
              label: `${rec.name} fee (${(rec.fee * 100).toFixed(2)}%)`,
              value: `−$${rec.feeAmount.toFixed(2)}`,
              negative: true,
            },
            {
              label: "Shipping (domestic US)",
              value: `−$${rec.shipping.toFixed(2)}`,
              negative: true,
            },
            rec.paymentFee > 0
              ? {
                  label: "Payment processing fee",
                  value: `−$${rec.paymentFee.toFixed(2)}`,
                  negative: true,
                }
              : null,
          ]
            .filter(Boolean)
            .map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
              >
                <span className="font-mono text-xs text-muted">{row!.label}</span>
                <span
                  className="font-mono text-sm"
                  style={{ color: row!.negative ? "var(--muted)" : "var(--text)" }}
                >
                  {row!.value}
                </span>
              </div>
            ))}

          <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-border">
            <span className="font-mono text-xs text-text font-medium uppercase tracking-widest">
              Net Profit
            </span>
            <span
              className="font-display text-3xl"
              style={{ color: "var(--green)" }}
            >
              ${netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <CustomsInlineAlert itemValueUSD={result.profitBreakdown.avgSellPrice} />
    </div>
  );
}
