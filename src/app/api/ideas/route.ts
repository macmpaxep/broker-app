import { NextResponse } from "next/server";
import { fetchMarketNews, type NewsItem } from "@/lib/yahooNews";
import { rephraseHeadline } from "@/lib/anthropic";

export type Idea = {
  uuid: string;
  headline: string;
  summary: string;
  analysis: string;
  publisher: string;
  link: string;
  publishedAt: number;
  thumbnail: string | null;
};

// Перефразированные карточки кэшируются по uuid статьи надолго — смысл
// идеи не меняется, а повторный вызов модели на каждый опрос страницы был
// бы бессмысленной тратой. Список "опубликованных" идей обновляется по
// мере появления новых статей в ленте Yahoo (имитация регулярной публикации).
const ideaCache = new Map<string, { idea: Idea; ts: number }>();
const IDEA_TTL_MS = 24 * 60 * 60_000;
const MAX_ITEMS = 5;

async function buildIdea(news: NewsItem): Promise<Idea | null> {
  const cached = ideaCache.get(news.uuid);
  if (cached && Date.now() - cached.ts < IDEA_TTL_MS) return cached.idea;

  const rephrased = await rephraseHeadline(news.title, news.publisher);
  if (!rephrased) return null;

  const idea: Idea = {
    uuid: news.uuid,
    headline: rephrased.headline,
    summary: rephrased.summary,
    analysis: rephrased.analysis,
    publisher: news.publisher,
    link: news.link,
    publishedAt: news.publishedAt,
    thumbnail: news.thumbnail,
  };
  ideaCache.set(news.uuid, { idea, ts: Date.now() });
  return idea;
}

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY не настроен на сервере" },
      { status: 500 }
    );
  }

  try {
    const news = await fetchMarketNews(MAX_ITEMS);
    const ideas = (await Promise.all(news.map(buildIdea))).filter(
      (i): i is Idea => i != null
    );
    ideas.sort((a, b) => b.publishedAt - a.publishedAt);
    return NextResponse.json({ ideas });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
