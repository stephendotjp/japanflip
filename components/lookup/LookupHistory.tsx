import type { SavedLookup } from "@/lib/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";

interface LookupHistoryProps {
  lookups: SavedLookup[];
  isBasic: boolean;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function LookupHistory({ lookups, isBasic }: LookupHistoryProps) {
  if (!isBasic || lookups.length === 0) return null;

  const displayed = lookups.slice(0, 5);

  return (
    <div>
      <SectionLabel>Recent Lookups</SectionLabel>

      <div className="space-y-2">
        {displayed.map((lookup) => (
          <div
            key={lookup.id}
            className="flex items-center justify-between gap-3 px-4 py-3 bg-surface border border-border rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-text truncate">{lookup.item}</p>
              <p className="font-mono text-[11px] text-muted">
                ¥{lookup.jpPrice.toLocaleString()} · {timeAgo(lookup.timestamp)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={lookup.verdict}>
                {lookup.verdict === "buy" ? "BUY" : lookup.verdict === "skip" ? "SKIP" : "MAYBE"}
              </Badge>
              <span className="font-mono text-xs text-muted">{lookup.roi}x</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
