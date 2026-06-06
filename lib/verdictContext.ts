const context: Record<string, Record<string, string>> = {
  Watches: {
    buy: "Japanese recycle shops grade watches conservatively — cosmetic wear that earns a B here often looks A-grade to Western buyers. Domestic demand doesn't price in what collectors abroad will pay.",
    maybe: "Japanese recycle shops grade watches conservatively — cosmetic wear that earns a B here often looks A-grade to Western buyers. Domestic demand doesn't price in what collectors abroad will pay.",
  },
  Clothing: {
    buy: "Vintage denim and workwear are priced for local turnover, not international collector demand. Japanese condition grading is strict — their B is often what eBay buyers consider excellent.",
    maybe: "Vintage denim and workwear are priced for local turnover, not international collector demand. Japanese condition grading is strict — their B is often what eBay buyers consider excellent.",
  },
  Electronics: {
    buy: "Japanese recycle shops rotate stock quickly and price for local resale. Import demand for Japanese-market electronics isn't factored in.",
    maybe: "Japanese recycle shops rotate stock quickly and price for local resale. Import demand for Japanese-market electronics isn't factored in.",
  },
  Spirits: {
    maybe: "Japanese whisky is priced for domestic buyers. Western auction demand runs well above local shop tags — but verify shipping legality for your home country before buying.",
  },
  Sneakers: {
    buy: "Japanese deadstock and limited releases are priced on domestic hype cycles, which often lag US/EU resale markets by months.",
    maybe: "Japanese deadstock and limited releases are priced on domestic hype cycles, which often lag US/EU resale markets by months.",
  },
  "Tools & Knives": {
    buy: "Japanese-made hand tools and knives are undervalued domestically and carry strong import premium with Western buyers.",
    maybe: "Japanese-made hand tools and knives are undervalued domestically and carry strong import premium with Western buyers.",
  },
  "Retro Gaming": {
    buy: "Japanese recycle shops price retro hardware for local demand. Western collectors pay a significant premium for Japanese-market editions and regional exclusives — especially complete-in-box.",
    maybe: "Japanese recycle shops price retro hardware for local demand. Western collectors pay a significant premium for Japanese-market editions and regional exclusives — especially complete-in-box.",
  },
  Other: {
    buy: "Japanese recycle shops price for local resale velocity. Import demand and collector premium from overseas buyers often isn't reflected in the tag.",
    maybe: "Japanese recycle shops price for local resale velocity. Import demand and collector premium from overseas buyers often isn't reflected in the tag.",
  },
};

export function getVerdictContext(category: string, verdict: string): string | null {
  if (verdict === "skip") return null;
  return context[category]?.[verdict] ?? context.Other[verdict] ?? null;
}
