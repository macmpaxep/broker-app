import { NextResponse } from "next/server";
import { fetchMarketNews, type NewsItem } from "@/lib/yahooNews";
import { rephraseHeadline } from "@/lib/anthropic";
import { getSupabaseAdmin } from "@/lib/supabase";

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

// Перефразированные карточки кэшируются по uuid статьи постоянно (в
// Supabase, если настроен — иначе в памяти процесса как fallback): смысл
// идеи не меняется, а повторный вызов модели на каждый опрос страницы был
// бы бессмысленной тратой токенов.
const memoryIdeaCache = new Map<string, Idea>();
const MAX_ITEMS = 5;

async function buildIdea(news: NewsItem): Promise<Idea | null> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: row } = await supabase
      .from("broker_app_idea_cache")
      .select("idea")
      .eq("uuid", news.uuid)
      .maybeSingle();
    if (row) return row.idea as Idea;
  } else if (memoryIdeaCache.has(news.uuid)) {
    return memoryIdeaCache.get(news.uuid)!;
  }

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

  if (supabase) {
    await supabase.from("broker_app_idea_cache").upsert({ uuid: news.uuid, idea });
  } else {
    memoryIdeaCache.set(news.uuid, idea);
  }
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
