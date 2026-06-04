import { NextRequest, NextResponse } from "next/server";
import { getMockData } from "@/lib/mockData";
import { fetchJPYRate } from "@/lib/fetchRate";

export async function POST(req: NextRequest) {
  const { item, category, priceJPY, condition = "A", size = "Small" } = await req.json();
  const rate = await fetchJPYRate();
  // TODO: replace getMockData with eBay Browse API once credentials are approved
  const result = getMockData(item, category, priceJPY, rate, condition, size);
  return NextResponse.json(result);
}
