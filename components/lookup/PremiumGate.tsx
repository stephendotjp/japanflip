import Link from "next/link";

interface PremiumGateProps {
  feature: string;
  upgradeHref: string;
  isPremiumOnly?: boolean;
}

export function PremiumGate({ feature, upgradeHref, isPremiumOnly }: PremiumGateProps) {
  const price = isPremiumOnly ? "$24" : "$9";
  const tier = isPremiumOnly ? "Premium" : "Basic";

  return (
    <div
      className="border-2 border-dashed rounded-xl p-6 text-center space-y-3"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="text-2xl">🔒</p>
      <p className="font-display text-2xl text-black">
        Upgrade for {isPremiumOnly ? "Live Data" : `Full ${feature.charAt(0).toUpperCase() + feature.slice(1)}`}
      </p>
      <p className="font-body text-sm text-muted max-w-sm mx-auto">
        {isPremiumOnly
          ? "Premium adds live market data updated daily and extended lookup history (50 items)."
          : `Get Basic for unlimited lookups, the full profit breakdown, platform comparison, customs guide, and lookup history.`}
      </p>
      <Link
        href={upgradeHref}
        className="inline-block px-6 py-2.5 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
        style={{ background: "var(--red)" }}
      >
        Unlock {tier} — {price}
      </Link>
    </div>
  );
}
