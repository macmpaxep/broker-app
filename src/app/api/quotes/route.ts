import { NextResponse } from "next/server";
import { WATCHLIST } from "@/lib/watchlist";

type Quote = {
  symbol: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  prevClose: number | null;
  updatedAt: number;
};

// Серверный кэш, чтобы не упираться в лимит бесплатного тарифа Finnhub
// (60 запросов/мин). Список вырос до WATCHLIST.length тикеров, поэтому TTL
// увеличен: иначе частые опросы с нескольких вкладок выбьют лимит.
let cache: { data: Quote[]; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function fetchQuote(symbol: string, apiKey: string): Promise<Quote> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
    symbol
  )}&token=${apiKey}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Finnhub ${symbol}: HTTP ${res.status}`);
    const json = (await res.json()) as {
      c?: number;
      d?: number;
      dp?: number;
      pc?: number;
    };
    const price = typeof json.c === "number" && json.c > 0 ? json.c : null;
    return {
      symbol,
      price,
      change: typeof json.d === "number" ? json.d : null,
      changePct: typeof json.dp === "number" ? json.dp : null,
      prevClose: typeof json.pc === "number" ? json.pc : null,
      updatedAt: Date.now(),
    };
  } catch {
    return {
      symbol,
      price: null,
      change: null,
      changePct: null,
      prevClose: null,
      updatedAt: Date.now(),
    };
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

  const symbols = WATCHLIST.map((w) => w.symbol);
  const quotes = await Promise.all(
    symbols.map((symbol) => fetchQuote(symbol, apiKey))
  );
  cache = { data: quotes, ts: Date.now() };

  return NextResponse.json({ quotes, cached: false });
}
