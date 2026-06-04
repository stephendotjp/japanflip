const categoryKeywords: Record<string, string[]> = {
  Watches: ["watch", "wristwatch", "timepiece", "clock", "chronograph", "seiko", "casio", "citizen", "orient", "rolex", "omega"],
  Clothing: ["clothing", "shirt", "jacket", "coat", "jeans", "denim", "pants", "dress", "sweater", "hoodie", "top", "levi", "vintage clothing"],
  Electronics: ["camera", "lens", "electronics", "audio", "headphones", "turntable", "amplifier", "synthesizer", "console", "gameboy", "walkman", "sony", "olympus", "pentax", "canon", "nikon"],
  Spirits: ["whisky", "whiskey", "sake", "shochu", "bourbon", "rum", "gin", "vodka", "liquor", "bottle", "alcohol", "japanese whisky"],
  Sneakers: ["sneakers", "shoes", "footwear", "trainers", "nike", "adidas", "new balance", "asics", "onitsuka"],
  "Tools & Knives": ["knife", "knives", "blade", "scissors", "tool", "chisel", "plane", "saw", "shears", "cutlery"],
};

export function mapLabelsToCategory(
  labels: string[],
  webEntities: string[]
): { category: string; itemName: string } | null {
  const allTerms = [...labels, ...webEntities.map((e) => e.toLowerCase())];

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (allTerms.some((term) => keywords.some((kw) => term.includes(kw)))) {
      const brand = webEntities[0] ?? "";
      const typeLabel = labels[0] ?? "";
      const itemName = brand
        ? `${brand} ${typeLabel}`.trim()
        : typeLabel || category.toLowerCase();

      return { category, itemName };
    }
  }

  return null;
}
