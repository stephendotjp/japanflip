"use client";

import { useUser } from "@/context/UserContext";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function downloadCSV(lookups: ReturnType<typeof useUser>["savedLookups"]) {
  const headers = ["Date", "Item", "Category", "JP Price (¥)", "JP Price ($)", "Verdict", "ROI"];
  const rows = lookups.map((l) => [
    new Date(l.timestamp).toISOString().split("T")[0],
    `"${l.item.replace(/"/g, '""')}"`,
    l.category,
    l.jpPrice,
    (l.jpPrice / 154.2).toFixed(2),
    l.verdict,
    l.roi,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `japanflip-history-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const { isBasic, isPremium, savedLookups } = useUser();

  if (!isBasic) {
    return (
      <div className="p-5 md:p-10 space-y-6 pb-10">
        <TopBar title="Saved Lookups" subtitle="Your lookup history." />
        <div
          className="border-2 border-dashed rounded-xl p-12 text-center space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-4xl">🔒</p>
          <p className="font-display text-3xl text-black">Basic Feature</p>
          <p className="font-body text-sm text-muted max-w-sm mx-auto">
            Lookup history is available on Basic and Premium plans. Last 20 lookups saved on this device.
          </p>
          <Link
            href="/app/upgrade"
            className="inline-block px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
            style={{ background: "var(--red)" }}
          >
            Get Basic — $9
          </Link>
        </div>
      </div>
    );
  }

  const cap = isPremium ? 50 : 20;

  return (
    <div className="p-5 md:p-10 space-y-6 pb-10">
      <TopBar
        title="Saved Lookups"
        subtitle={`${savedLookups.length} lookup${savedLookups.length !== 1 ? "s" : ""} saved.`}
      />

      {!isPremium && (
        <div
          className="px-4 py-2.5 rounded-md border"
          style={{ background: "var(--gold-light)", borderColor: "rgba(184,134,11,0.2)" }}
        >
          <p className="font-mono text-[11px]" style={{ color: "var(--gold)" }}>
            Showing last {cap} lookups.{" "}
            <Link href="/app/upgrade" className="underline">
              Upgrade to Premium to save up to 50 →
            </Link>
          </p>
        </div>
      )}

      {isPremium && savedLookups.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => downloadCSV(savedLookups)}
            className="px-4 py-2 font-mono text-xs tracking-widest uppercase border border-border rounded-md text-muted hover:text-text hover:border-text transition-colors"
          >
            Export CSV ↓
          </button>
        </div>
      )}

      {savedLookups.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="font-display text-2xl text-black mb-2">No lookups yet</p>
          <p className="font-body text-sm text-muted">
            Run your first lookup and it&apos;ll appear here.
          </p>
          <Link
            href="/app"
            className="inline-block mt-4 px-5 py-2.5 text-white font-mono text-xs tracking-widest uppercase rounded-md"
            style={{ background: "var(--red)" }}
          >
            Go to Price Lookup →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {savedLookups.map((lookup) => (
            <div
              key={lookup.id}
              className="flex items-center justify-between gap-3 px-5 py-4 bg-surface border border-border rounded-xl"
            >
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-text truncate">{lookup.item}</p>
                <p className="font-mono text-[11px] text-muted">
                  {lookup.category} · ¥{lookup.jpPrice.toLocaleString()} · {timeAgo(lookup.timestamp)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={lookup.verdict}>
                  {lookup.verdict === "buy" ? "BUY" : lookup.verdict === "skip" ? "SKIP" : "MAYBE"}
                </Badge>
                <span className="font-mono text-xs text-muted">{lookup.roi}x</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
