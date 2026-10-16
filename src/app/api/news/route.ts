import { NextRequest, NextResponse } from "next/server";
import { ensureTodayNewsFetched, listNewsPage } from "@/lib/yahooNews";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(0, Number(searchParams.get("page") ?? 0) || 0);

  try {
    if (page === 0) {
      // Докидываем сегодняшние новости в архив только при первой странице —
      // чтобы листание истории не триггерило лишние проверки.
      await ensureTodayNewsFetched();
    }
    const { items, nextPage } = await listNewsPage(page);
    return NextResponse.json({ news: items, nextPage });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
