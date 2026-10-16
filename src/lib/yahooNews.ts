export type NewsItem = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: number; // unix seconds
  thumbnail: string | null;
};

type CacheEntry = { data: NewsItem[]; day: string };
const cache = new Map<string, CacheEntry>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type YahooSearchNewsRaw = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  thumbnail?: { resolutions?: { url: string }[] };
};

async function searchYahooNews(query: string, count: number): Promise<NewsItem[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    query
  )}&newsCount=${count}&quotesCount=0`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VertexCapitalDemo/1.0)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Yahoo news search "${query}": HTTP ${res.status}`);
  const json = await res.json();
  const raw: YahooSearchNewsRaw[] = json?.news ?? [];
  return raw.map((n) => ({
    uuid: n.uuid,
    title: n.title,
    publisher: n.publisher,
    link: n.link,
    publishedAt: n.providerPublishTime,
    thumbnail: n.thumbnail?.resolutions?.[0]?.url ?? null,
  }));
}

// Несколько широких финансовых запросов, объединённых и дедуплицированных —
// публичный поиск Yahoo не даёт единой "общей ленты", поэтому собираем из
// нескольких тематических срезов рынка США.
const FEED_QUERIES = ["stock market", "earnings", "Nasdaq"];

// Список "топ-N новостей дня" фиксируется на календарные сутки (UTC) —
// не TTL в минутах. Так и новости, и завязанные на них AI-идеи остаются
// стабильными весь день и не плодят лишние вызовы Yahoo/Claude при каждом
// заходе пользователя.
export async function fetchMarketNews(limit = 5): Promise<NewsItem[]> {
  const key = `market:${limit}`;
  const today = todayKey();
  const cached = cache.get(key);
  if (cached && cached.day === today) return cached.data;

  const batches = await Promise.all(
    FEED_QUERIES.map((q) => searchYahooNews(q, 10).catch(() => [] as NewsItem[]))
  );

  const seen = new Set<string>();
  const merged: NewsItem[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.uuid)) continue;
      seen.add(item.uuid);
      merged.push(item);
    }
  }
  merged.sort((a, b) => b.publishedAt - a.publishedAt);
  const result = merged.slice(0, limit);

  cache.set(key, { data: result, day: today });
  return result;
}
