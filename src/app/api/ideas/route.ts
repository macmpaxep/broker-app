import { NextRequest, NextResponse } from "next/server";
import { ensureTodayNewsFetched, type NewsItem } from "@/lib/yahooNews";
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

const PAGE_SIZE = 5;

// In-memory fallback (см. yahooNews.ts) — только если Supabase не настроен.
const memoryIdeaCache = new Map<string, Idea>();
const memoryIdeaOrder: string[] = [];

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
    memoryIdeaOrder.unshift(news.uuid);
  }
  return idea;
}

async function listIdeasPage(page: number): Promise<{ ideas: Idea[]; nextPage: number | null }> {
  const supabase = getSupabaseAdmin();
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  if (supabase) {
    const { data, count } = await supabase
      .from("broker_app_idea_cache")
      .select("idea", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("uuid", { ascending: false })
      .range(from, to);
    const ideas = (data ?? []).map((r: any) => r.idea as Idea);
    const hasMore = count != null ? to + 1 < count : ideas.length === PAGE_SIZE;
    return { ideas, nextPage: hasMore ? page + 1 : null };
  }

  const uuids = memoryIdeaOrder.slice(from, to + 1);
  const ideas = uuids.map((u) => memoryIdeaCache.get(u)!).filter(Boolean);
  const hasMore = from + PAGE_SIZE < memoryIdeaOrder.length;
  return { ideas, nextPage: hasMore ? page + 1 : null };
}

export async function GET(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY не настроен на сервере" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, Number(searchParams.get("page") ?? 0) || 0);

  try {
    if (page === 0) {
      // Перефразируем только действительно новые статьи дня — остальные
      // уже лежат готовыми в архиве и не требуют нового вызова Claude.
      const freshToday = await ensureTodayNewsFetched();
      await Promise.all(freshToday.map(buildIdea));
    }
    const { ideas, nextPage } = await listIdeasPage(page);
    return NextResponse.json({ ideas, nextPage });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
