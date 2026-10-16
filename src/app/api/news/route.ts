import { NextResponse } from "next/server";
import { fetchMarketNews } from "@/lib/yahooNews";

export async function GET() {
  try {
    const news = await fetchMarketNews(12);
    return NextResponse.json({ news });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
