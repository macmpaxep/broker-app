import { NextResponse } from "next/server";
import { WATCHLIST } from "@/lib/watchlist";

type Profile = { symbol: string; logo: string | null; name: string | null };

// Логотипы и названия почти не меняются — кэшируем надолго, чтобы не
// тратить лимит бесплатного тарифа Finnhub (60 запросов/мин) при каждом
// обращении. Список акций вырос до ~100 штук, так что при холодном кэше
// запросы идут пачками с паузами, а не все разом — иначе часть из них
// получала бы отказ по лимиту и логотип не подгружался.
let cache: { data: Profile[]; ts: number } | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 1100;

async function fetchProfile(symbol: string, apiKey: string): Promise<Profile & { _debug?: string }> {
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(
    symbol
  )}&token=${apiKey}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      return { symbol, logo: null, name: null, _debug: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const json = JSON.parse(text) as { logo?: string; name?: string };
    return {
      symbol,
      logo: json.logo || null,
      name: json.name || null,
      _debug: json.logo ? undefined : `empty response: ${text.slice(0, 200)}`,
    };
  } catch (e) {
    return { symbol, logo: null, name: null, _debug: `fetch threw: ${String(e)}` };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ profiles: cache.data, cached: true });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY не настроен на сервере" },
      { status: 500 }
    );
  }

  const symbols = WATCHLIST.map((w) => w.symbol);
  const profiles: Profile[] = [];
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((symbol) => fetchProfile(symbol, apiKey))
    );
    profiles.push(...results);
    if (i + BATCH_SIZE < symbols.length) await sleep(BATCH_DELAY_MS);
  }

  cache = { data: profiles, ts: Date.now() };
  return NextResponse.json({ profiles, cached: false });
}
