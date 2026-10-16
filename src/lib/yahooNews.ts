import { getSupabaseAdmin } from "./supabase";

export type NewsItem = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  publishedAt: number; // unix seconds
  thumbnail: string | null;
};

// In-memory fallback — используется только если SUPABASE_URL/KEY не
// настроены (например, локально без .env.local). На проде с настроенным
// Supabase это не задействуется.
const memoryArchive: NewsItem[] = [];
let memoryLastFetchedDay: string | null = null;

const DAILY_LIMIT = 5;
const PAGE_SIZE = 5;

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

async function fetchFreshFromYahoo(excludeUuids: Set<string>): Promise<NewsItem[]> {
  const batches = await Promise.all(
    FEED_QUERIES.map((q) => searchYahooNews(q, 10).catch(() => [] as NewsItem[]))
  );

  const seen = new Set<string>();
  const merged: NewsItem[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.uuid) || excludeUuids.has(item.uuid)) continue;
      seen.add(item.uuid);
      merged.push(item);
    }
  }
  merged.sort((a, b) => b.publishedAt - a.publishedAt);
  return merged.slice(0, DAILY_LIMIT);
}

// Докидывает в накапливающийся архив до DAILY_LIMIT новых новостей за
// текущие календарные сутки (UTC) — ровно один раз в день, при первом
// заходе. Уже добавленные статьи никогда не трогаются и не удаляются —
// старые страницы архива остаются стабильными.
export async function ensureTodayNewsFetched(): Promise<NewsItem[]> {
  const today = todayKey();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: existingToday } = await supabase
      .from("broker_app_news_items")
      .select("uuid, title, publisher, link, published_at, thumbnail")
      .eq("day", today);
    if (existingToday && existingToday.length > 0) {
      return existingToday.map(rowToNewsItem);
    }

    const { data: allUuidRows } = await supabase
      .from("broker_app_news_items")
      .select("uuid");
    const excludeUuids = new Set((allUuidRows ?? []).map((r: any) => r.uuid as string));

    const fresh = await fetchFreshFromYahoo(excludeUuids);
    if (fresh.length === 0) return [];

    await supabase.from("broker_app_news_items").upsert(
      fresh.map((n) => ({
        uuid: n.uuid,
        title: n.title,
        publisher: n.publisher,
        link: n.link,
        published_at: n.publishedAt,
        thumbnail: n.thumbnail,
        day: today,
      }))
    );
    return fresh;
  }

  if (memoryLastFetchedDay === today) return [];
  const excludeUuids = new Set(memoryArchive.map((n) => n.uuid));
  const fresh = await fetchFreshFromYahoo(excludeUuids);
  memoryArchive.unshift(...fresh);
  memoryLastFetchedDay = today;
  return fresh;
}

function rowToNewsItem(row: any): NewsItem {
  return {
    uuid: row.uuid,
    title: row.title,
    publisher: row.publisher,
    link: row.link,
    publishedAt: row.published_at,
    thumbnail: row.thumbnail,
  };
}

export type NewsPage = { items: NewsItem[]; nextPage: number | null };

// Постраничная выдача накопленного архива, от новых к старым.
export async function listNewsPage(page: number, pageSize = PAGE_SIZE): Promise<NewsPage> {
  const supabase = getSupabaseAdmin();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  if (supabase) {
    const { data, count } = await supabase
      .from("broker_app_news_items")
      .select("uuid, title, publisher, link, published_at, thumbnail", { count: "exact" })
      .order("published_at", { ascending: false })
      .order("uuid", { ascending: false })
      .range(from, to);
    const items = (data ?? []).map(rowToNewsItem);
    const hasMore = count != null ? to + 1 < count : items.length === pageSize;
    return { items, nextPage: hasMore ? page + 1 : null };
  }

  const sorted = [...memoryArchive].sort((a, b) => b.publishedAt - a.publishedAt);
  const items = sorted.slice(from, to + 1);
  const hasMore = from + pageSize < sorted.length;
  return { items, nextPage: hasMore ? page + 1 : null };
}
