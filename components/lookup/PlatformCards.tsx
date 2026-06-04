import type { Platform } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface PlatformCardsProps {
  platforms: Platform[];
}

export function PlatformCards({ platforms }: PlatformCardsProps) {
  return (
    <div className="animate-fadeUp">
      <SectionLabel>Best Platform to Sell</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="bg-surface border rounded-xl p-5 transition-all hover:-translate-y-0.5 relative"
            style={{
              borderColor: p.recommended ? "var(--green)" : "var(--border)",
              borderWidth: p.recommended ? 2 : 1,
            }}
          >
            {p.recommended && (
              <span
                className="absolute -top-3 left-4 font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded text-white"
                style={{ background: "var(--green)" }}
              >
                BEST OPTION
              </span>
            )}
            <p className="font-mono text-xs tracking-widest uppercase text-muted mb-1">
              {p.name}
            </p>
            <p className="font-display text-3xl" style={{ color: "var(--green)" }}>
              ${Math.round(p.netProfit)}
            </p>
            <p className="font-mono text-[11px] text-muted mt-1">
              {(p.fee * 100).toFixed(2)}% fee
              {p.paymentFee > 0 ? ` + $${p.paymentFee.toFixed(2)} payment fee` : ""}
            </p>
            {p.note && (
              <p className="font-body text-xs text-muted mt-2 leading-relaxed border-t border-border pt-2">
                {p.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
