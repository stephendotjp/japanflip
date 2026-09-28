import { NextRequest, NextResponse } from "next/server";
import { lookupItem } from "@/lib/lookup";
import { fetchJPYRate } from "@/lib/fetchRate";

export async function POST(req: NextRequest) {
  const { item, category, priceJPY, condition = "A", size = "Small" } = await req.json();
  const rate = await fetchJPYRate();
  const result = await lookupItem(item, category, priceJPY, rate, condition, size);
  return NextResponse.json(result);
}
