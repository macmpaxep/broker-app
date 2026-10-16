import { NextRequest, NextResponse } from "next/server";
import { fetchYahooHistory } from "@/lib/yahooHistory";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const period1 = Number(searchParams.get("period1"));
  const period2 = Number(searchParams.get("period2"));
  const interval = searchParams.get("interval") ?? "1d";

  if (!symbol || !period1 || !period2) {
    return NextResponse.json(
      { error: "symbol, period1 и period2 обязательны" },
      { status: 400 }
    );
  }

  try {
    const points = await fetchYahooHistory(symbol, period1, period2, interval);
    return NextResponse.json({ points });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
