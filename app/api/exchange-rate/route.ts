import { NextResponse } from "next/server";
import { fetchJPYRate } from "@/lib/fetchRate";

export async function GET() {
  const rate = await fetchJPYRate();
  return NextResponse.json({ rate });
}
