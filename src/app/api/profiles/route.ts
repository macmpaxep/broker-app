import { NextResponse } from "next/server";
import { WATCHLIST } from "@/lib/watchlist";
import { clearbitLogo } from "@/lib/logoDomains";

type Profile = { symbol: string; logo: string | null; name: string | null };

// Логотипы — через Clearbit по домену компании (мгновенно, без лимитов и
// ключа API). Finnhub используется только как резерв для тикеров без
// известного домена. Кэшируем надолго — логотипы почти не меняются.
let cache: { data: Profile[]; ts: number } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchFinnhubLogo(symbol: string, apiKey: string): Promise<string | null> {
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
    symbol
  )}&token=${apiKey}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { logo?: string };
    return json.logo || null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ profiles: cache.data, cached: true });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  const profiles = await Promise.all(
    WATCHLIST.map(async ({ symbol }): Promise<Profile> => {
      const logo = clearbitLogo(symbol) ?? (apiKey ? await fetchFinnhubLogo(symbol, apiKey) : null);
      return { symbol, logo, name: null };
    })
  );
  cache = { data: profiles, ts: Date.now() };

  return NextResponse.json({ profiles, cached: false });
}
