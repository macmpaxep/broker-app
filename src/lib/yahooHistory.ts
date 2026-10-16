export type HistoryApiPoint = { date: string; value: number };

type CacheEntry = { data: HistoryApiPoint[]; ts: number };
const cache = new Map<string, CacheEntry>();

function cacheTtlMs(interval: string) {
  // Внутридневные интервалы обновляются чаще, дневные — реже.
  if (interval.endsWith("m")) return 60_000;
  return 5 * 60_000;
}

// Прокси к неофициальному, но широко используемому публичному эндпоинту
// Yahoo Finance для исторических свечей. Требует User-Agent браузера —
// без него Yahoo отдаёт 429. Нет официального SLA/контракта, поэтому
// результат кэшируется и путь имеет смысл сопровождать деградацией на
// клиенте при сбое.
export async function fetchYahooHistory(
  symbol: string,
  period1: number,
  period2: number,
  interval: string
): Promise<HistoryApiPoint[]> {
  const key = `${symbol}:${period1}:${period2}:${interval}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < cacheTtlMs(interval)) {
    return cached.data;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?period1=${period1}&period2=${period2}&interval=${interval}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VertexCapitalDemo/1.0)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Yahoo Finance ${symbol}: HTTP ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`Yahoo Finance ${symbol}: empty result`);

  const timestamps: number[] = result.timestamp ?? [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];

  const points: HistoryApiPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null) continue;
    points.push({
      date: new Date(timestamps[i] * 1000).toISOString(),
      value: close,
    });
  }

  cache.set(key, { data: points, ts: Date.now() });
  return points;
}
