import Link from "next/link";

const GUMROAD_BASIC = process.env.NEXT_PUBLIC_GUMROAD_BASIC_URL || "/app/upgrade";
const GUMROAD_PREMIUM = process.env.NEXT_PUBLIC_GUMROAD_PREMIUM_URL || "/app/upgrade";

const basicFeatures = [
  "Unlimited lookups",
  "Full profit breakdown",
  "Platform comparison (eBay, Depop, Etsy, StockX)",
  "Customs guide by country",
  "30-day sold data",
];

const premiumFeatures = [
  "Everything in Basic",
  "Live data — updated daily",
  "Price trend charts",
  "Saved history across devices",
  "Japanese phrase cards per category",
];

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {/* Basic */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div>
          <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted">Basic</p>
          <p className="font-display text-5xl text-black mt-1">$9</p>
          <p className="font-mono text-xs text-muted mt-1">One-time · No subscription</p>
        </div>
        <ul className="space-y-2">
          {basicFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2 font-body text-sm text-text">
              <span style={{ color: "var(--green)" }} className="mt-0.5 shrink-0">→</span>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={GUMROAD_BASIC}
          className="block text-center px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
          style={{ background: "var(--red)" }}
        >
          Get Basic — $9
        </Link>
      </div>

      {/* Premium */}
      <div
        className="bg-surface border-2 rounded-xl p-6 space-y-5 relative"
        style={{ borderColor: "var(--red)" }}
      >
        <span
          className="absolute -top-3 left-5 font-mono text-[10px] tracking-[2px] uppercase px-2 py-0.5 rounded text-white"
          style={{ background: "var(--red)" }}
        >
          BEST VALUE
        </span>
        <div>
          <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted">Premium</p>
          <p className="font-display text-5xl text-black mt-1">$24</p>
          <p className="font-mono text-xs text-muted mt-1">One-time · No subscription</p>
        </div>
        <ul className="space-y-2">
          {premiumFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2 font-body text-sm text-text">
              <span style={{ color: "var(--green)" }} className="mt-0.5 shrink-0">→</span>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={GUMROAD_PREMIUM}
          className="block text-center px-6 py-3 text-white font-mono text-xs tracking-widest uppercase rounded-md hover:opacity-90 transition-opacity"
          style={{ background: "var(--black)" }}
        >
          Get Premium — $24
        </Link>
      </div>
    </div>
  );
}
