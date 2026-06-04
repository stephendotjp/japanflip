import type { CustomsEntry } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";

const statusColors = {
  ok: { bg: "var(--green-light)", text: "var(--green)", border: "rgba(26,122,74,0.2)" },
  warn: { bg: "var(--gold-light)", text: "var(--gold)", border: "rgba(184,134,11,0.2)" },
  danger: { bg: "var(--red-light)", text: "var(--red)", border: "rgba(217,43,58,0.2)" },
};

interface CustomsStripProps {
  customs: CustomsEntry[];
}

export function CustomsStrip({ customs }: CustomsStripProps) {
  return (
    <div className="animate-fadeUp">
      <SectionLabel>Customs by Country</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {customs.map((entry) => {
          const colors = statusColors[entry.status];
          return (
            <div
              key={entry.country}
              className="group relative"
            >
              <div
                className="px-3 py-2 rounded-md border font-mono text-[11px] cursor-default"
                style={{
                  background: colors.bg,
                  color: colors.text,
                  borderColor: colors.border,
                }}
              >
                {entry.flag} {entry.country} — {entry.limit}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 min-w-[200px]">
                <div className="bg-black text-white text-xs font-body p-2 rounded shadow-lg leading-relaxed">
                  {entry.note}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
