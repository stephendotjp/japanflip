import { NextRequest, NextResponse } from "next/server";
import { fetchSoldComps, type SoldComp } from "@/lib/soldComps";
import { markComps } from "@/lib/comps";
import { fetchJPYRate } from "@/lib/fetchRate";
import type { LookupResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { item, category } = await req.json().catch(() => ({}));

  if (typeof item !== "string" || !item.trim() || typeof category !== "string") {
    return NextResponse.json({ error: "item and category are required" }, { status: 400 });
  }

  const query = item.trim().slice(0, 200);
  let rate: number, sold: SoldComp[];
  try {
    [rate, sold] = await Promise.all([fetchJPYRate(), fetchSoldComps(query)]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[lookup] sold-comps failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const body: LookupResponse = { query, category, exchangeRate: rate, comps: markComps(query, sold) };
  return NextResponse.json(body);
}
