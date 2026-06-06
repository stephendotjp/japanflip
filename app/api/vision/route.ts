import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a product identification assistant for a Japan resale price lookup tool.
The user is standing in a Japanese recycle shop (e.g. BookOff, Hard Off, 2nd Street).
Given an image of an item, identify:
1. The item name (be specific — brand, model, edition if visible)
2. The best-fit category from this list: Watches / Clothing / Electronics / Spirits / Sneakers / Tools & Knives / Retro Gaming / Other

Respond only in JSON: { "itemName": string, "category": string }
If you cannot identify the item with reasonable confidence, respond: { "itemName": null, "category": null }`;

const CATEGORY_MAP: Record<string, string> = {
  "Retro Gaming": "Electronics",
};

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ itemName: null, category: null });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ itemName: null, category: null });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              { type: "text", text: "Identify this item." },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ itemName: null, category: null });
    }

    const data = await res.json();
    const raw: string = data.content?.[0]?.text ?? "";
    console.log("[vision] Claude raw response:", raw);

    // Strip markdown code fences Claude sometimes adds despite the prompt
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed: { itemName: string | null; category: string | null };
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("[vision] JSON parse failed on:", text);
      return NextResponse.json({ itemName: null, category: null });
    }

    if (parsed.category && CATEGORY_MAP[parsed.category]) {
      parsed.category = CATEGORY_MAP[parsed.category];
    }

    return NextResponse.json({
      itemName: parsed.itemName ?? null,
      category: parsed.category ?? null,
    });
  } catch {
    return NextResponse.json({ itemName: null, category: null });
  }
}
