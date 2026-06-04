const quotes = [
  {
    quote:
      "Bought a Seiko at Hard Off for ¥4,500. JapanFlip said buy it. Sold on eBay for $210 three days after I got home.",
    handle: "u/tokyotrip_pdx",
    sub: "r/flipping",
  },
  {
    quote:
      "Found 12 Levi's 501s at ¥600–¥900 each. JapanFlip flagged the made-in-USA ones. Made $840 profit on a $65 spend.",
    handle: "u/vintage_arbitage",
    sub: "r/thrifting",
  },
  {
    quote:
      "Was skeptical at first. But the customs guide alone saved me from a £400 mistake at Heathrow. Worth every penny.",
    handle: "u/uk_flipper_99",
    sub: "r/reselling",
  },
];

export function SocialProof() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {quotes.map((q) => (
        <div
          key={q.handle}
          className="bg-surface border border-border rounded-xl p-5 space-y-3"
        >
          <p className="font-body text-sm text-text leading-relaxed">
            &ldquo;{q.quote}&rdquo;
          </p>
          <div>
            <p className="font-mono text-[11px] text-text">{q.handle}</p>
            <p className="font-mono text-[11px] text-muted">{q.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
