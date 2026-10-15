import { NextResponse } from "next/server";
import { holdings } from "@/lib/portfolio";

type Quote = { symbol: string; price: number | null; updatedAt: number };

// Простой серверный кэш, чтобы не упираться в лимит бесплатного тарифа
// Finnhub (60 запросов/мин) при частых обращениях нескольких вкладок.
let cache: { data: Quote[]; ts: number } | null = null;
const CACHE_TTL_MS = 10_000;

async function fetchQuote(symbol: string, apiKey: string): Promise<Quote> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
    symbol
  )}&token=${apiKey}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Finnhub ${symbol}: HTTP ${res.status}`);
    const json = (await res.json()) as { c?: number };
    const price = typeof json.c === "number" && json.c > 0 ? json.c : null;
    return { symbol, price, updatedAt: Date.now() };
  } catch {
    return { symbol, price: null, updatedAt: Date.now() };
  }
}

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY не настроен на сервере" },
      { status: 500 }
    );
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ quotes: cache.data, cached: true });
  }

  const symbols = holdings.map((h) => h.symbol);
  const quotes = await Promise.all(
    symbols.map((symbol) => fetchQuote(symbol, apiKey))
  );
  cache = { data: quotes, ts: Date.now() };

  return NextResponse.json({ quotes, cached: false });
}
