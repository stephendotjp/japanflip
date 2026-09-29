import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const CATEGORIES = ["Watches", "Clothing", "Electronics", "Spirits", "Retro Gaming", "Other"] as const;

const SYSTEM_PROMPT = `You identify items for a resale price checker used inside Japanese recycle shops (Book Off, Hard Off, 2nd Street, Surugaya, Komehyo).
The photo usually shows an item, often with its shop price tag or sticker.

Return:
- searchQuery: the best eBay search for this exact item, in English, 2-6 words — brand + model/edition. Use model numbers when visible (e.g. "Seiko SKX007", "Olympus mju II", "Pokemon Blue Game Boy"). Translate Japanese product names to how Western sellers list them. No condition words, no "Japan".
- alternatives: up to 3 other plausible searches if you're not sure of the exact model/variant (most likely first). Empty if confident.
- category: best fit.
- tagPriceJPY: the price on a Japanese shop tag if clearly readable, as an integer yen amount (tag prices normally include tax — use the tax-included 税込 figure if both are shown). null if no tag is visible or it isn't legible. Never guess a price.
- conditionRank: the shop's condition grade if printed on the tag (S / A / B / C; map 美品/極美品 to A, 中古 with no grade to null). null if not shown.
- warnings: risks only — short plain-English notes a buyer must know that are visible in the photo, e.g. "Tag says ジャンク (junk) — sold as not working, no returns", "Box only / cartridge missing", "Looks like a reproduction label". Never list positives (box included, good condition) or neutral facts. Empty if none.

If you cannot identify the item at all, set searchQuery to null.`;

const VisionSchema = z.object({
  searchQuery: z.string().nullable(),
  alternatives: z.array(z.string()),
  category: z.enum(CATEGORIES),
  tagPriceJPY: z.number().int().nullable(),
  conditionRank: z.enum(["S", "A", "B", "C"]).nullable(),
  warnings: z.array(z.string()),
});

const EMPTY = {
  itemName: null,
  category: null,
  alternatives: [],
  tagPriceJPY: null,
  conditionRank: null,
  warnings: [],
};

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json().catch(() => ({}));

  if (!imageBase64 || !mimeType || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(EMPTY);
  }

  try {
    const response = await client.beta.messages.parse({
      // Sonnet for speed — this runs while the user stands in the aisle.
      model: "claude-sonnet-5-5",
      max_tokens: 2000,
      output_config: { effort: "low", format: betaZodOutputFormat(VisionSchema) },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
            { type: "text", text: "Identify this item and read its tag." },
          ],
        },
      ],
    });

    const parsed = response.stop_reason === "refusal" ? null : response.parsed_output;
    if (!parsed?.searchQuery) return NextResponse.json(EMPTY);

    return NextResponse.json({
      // `itemName` kept for Scout, which stores it as the item's label.
      itemName: parsed.searchQuery,
      category: parsed.category,
      alternatives: parsed.alternatives.filter((a) => a && a !== parsed.searchQuery).slice(0, 3),
      tagPriceJPY: parsed.tagPriceJPY && parsed.tagPriceJPY > 0 ? parsed.tagPriceJPY : null,
      conditionRank: parsed.conditionRank,
      warnings: parsed.warnings.slice(0, 3),
    });
  } catch (err) {
    console.error("[vision] failed:", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
    return NextResponse.json(EMPTY);
  }
}
