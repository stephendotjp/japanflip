import { NextRequest, NextResponse } from "next/server";
import { lookupItem } from "@/lib/lookup";
import { fetchJPYRate } from "@/lib/fetchRate";

export async function POST(req: NextRequest) {
  const { item, category, priceJPY, condition = "A", size = "Small" } = await req.json().catch(() => ({}));

  if (typeof item !== "string" || !item.trim() || typeof category !== "string" || !(Number(priceJPY) > 0)) {
    return NextResponse.json({ error: "item, category and a positive priceJPY are required" }, { status: 400 });
  }

  const rate = await fetchJPYRate();
  const result = await lookupItem(item.trim().slice(0, 200), category, Number(priceJPY), rate, String(condition), String(size));
  return NextResponse.json(result);
}
