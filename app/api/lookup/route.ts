import { NextRequest, NextResponse } from "next/server";
import { fetchSoldComps } from "@/lib/soldComps";
import { markComps } from "@/lib/comps";
import { fetchJPYRate } from "@/lib/fetchRate";
import type { LookupResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { item, category } = await req.json().catch(() => ({}));

  if (typeof item !== "string" || !item.trim() || typeof category !== "string") {
    return NextResponse.json({ error: "item and category are required" }, { status: 400 });
  }

  const query = item.trim().slice(0, 200);
  const [rate, sold] = await Promise.all([fetchJPYRate(), fetchSoldComps(query)]);

  const body: LookupResponse = { query, category, exchangeRate: rate, comps: markComps(query, sold) };
  return NextResponse.json(body);
}
