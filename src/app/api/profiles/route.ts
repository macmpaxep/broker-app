import { NextResponse } from "next/server";
import { holdings } from "@/lib/portfolio";

type Profile = { symbol: string; logo: string | null; name: string | null };

// Логотипы и названия компаний почти не меняются — кэшируем надолго,
// чтобы не тратить лимит бесплатного тарифа Finnhub.
let cache: { data: Profile[]; ts: number } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchProfile(symbol: string, apiKey: string): Promise<Profile> {
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
    symbol
  )}&token=${apiKey}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Finnhub ${symbol}: HTTP ${res.status}`);
    const json = (await res.json()) as { logo?: string; name?: string };
    return {
      symbol,
      logo: json.logo || null,
      name: json.name || null,
    };
  } catch {
    return { symbol, logo: null, name: null };
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
    return NextResponse.json({ profiles: cache.data, cached: true });
  }

  const symbols = holdings.map((h) => h.symbol);
  const profiles = await Promise.all(
    symbols.map((symbol) => fetchProfile(symbol, apiKey))
  );
  cache = { data: profiles, ts: Date.now() };

  return NextResponse.json({ profiles, cached: false });
}
