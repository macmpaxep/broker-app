import { NextRequest, NextResponse } from "next/server";
import { holdings } from "@/lib/portfolio";
import { fetchYahooHistory, type HistoryApiPoint } from "@/lib/yahooHistory";

// Выравниваем дату до начала дня (UTC), чтобы сопоставлять свечи разных
// тикеров, у которых метки времени могут отличаться на минуты.
function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period1 = Number(searchParams.get("period1"));
  const period2 = Number(searchParams.get("period2"));
  const interval = searchParams.get("interval") ?? "1d";

  if (!period1 || !period2) {
    return NextResponse.json(
      { error: "period1 и period2 обязательны" },
      { status: 400 }
    );
  }

  try {
    const perSymbol = await Promise.all(
      holdings.map(async (h) => {
        const points = await fetchYahooHistory(h.symbol, period1, period2, interval);
        return { symbol: h.symbol, shares: h.shares, buyDate: h.buyDate, points };
      })
    );

    // date-key -> symbol -> last close в этот день/интервал
    const byDate = new Map<string, Map<string, number>>();
    const orderedKeys: string[] = [];

    for (const s of perSymbol) {
      for (const p of s.points) {
        const key = interval.endsWith("m") ? p.date : dayKey(p.date);
        if (!byDate.has(key)) {
          byDate.set(key, new Map());
          orderedKeys.push(key);
        }
        byDate.get(key)!.set(s.symbol, p.value);
      }
    }

    orderedKeys.sort();

    // Для каждой даты переносим последнюю известную цену тикера вперёд,
    // если в этот день по нему не было свечи (выходной/задержка данных).
    const lastKnown: Record<string, number> = {};
    const result: HistoryApiPoint[] = [];

    for (const key of orderedKeys) {
      const quotesForDate = byDate.get(key)!;
      for (const [sym, price] of quotesForDate) {
        lastKnown[sym] = price;
      }

      let total = 0;
      for (const s of perSymbol) {
        const boughtAlready = key.slice(0, 10) >= s.buyDate;
        if (!boughtAlready) continue;
        const price = lastKnown[s.symbol];
        if (price == null) continue;
        total += price * s.shares;
      }

      if (total > 0) {
        result.push({ date: key, value: total });
      }
    }

    return NextResponse.json({ points: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
