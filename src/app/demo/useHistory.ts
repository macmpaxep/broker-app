"use client";

import { useEffect, useState } from "react";
import type { HistoryPoint, Timeframe } from "@/lib/portfolio";

function rangeForTimeframe(timeframe: Timeframe, allStartDate: string) {
  const now = Math.floor(Date.now() / 1000);
  const DAY = 86_400;
  switch (timeframe) {
    case "1D":
      return { period1: now - DAY, period2: now, interval: "5m" };
    case "1W":
      return { period1: now - 7 * DAY, period2: now, interval: "30m" };
    case "1M":
      return { period1: now - 30 * DAY, period2: now, interval: "1d" };
    case "3M":
      return { period1: now - 90 * DAY, period2: now, interval: "1d" };
    case "6M":
      return { period1: now - 180 * DAY, period2: now, interval: "1d" };
    case "ALL":
      return {
        period1: Math.floor(new Date(allStartDate).getTime() / 1000),
        period2: now,
        interval: "1d",
      };
  }
}

type State = { data: HistoryPoint[] | null; error: string | null };

export function useStockHistory(symbol: string, timeframe: Timeframe, buyDate: string) {
  const [state, setState] = useState<State>({ data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null });

    const { period1, period2, interval } = rangeForTimeframe(timeframe, buyDate);
    const url = `/api/history?symbol=${encodeURIComponent(symbol)}&period1=${period1}&period2=${period2}&interval=${interval}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error || !json.points?.length) {
          setState({ data: null, error: json.error ?? "Нет данных" });
          return;
        }
        setState({ data: json.points, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe, buyDate]);

  return state;
}

export function usePortfolioHistory(timeframe: Timeframe, earliestBuyDate: string) {
  const [state, setState] = useState<State>({ data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null });

    const { period1, period2, interval } = rangeForTimeframe(timeframe, earliestBuyDate);
    const url = `/api/portfolio-history?period1=${period1}&period2=${period2}&interval=${interval}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error || !json.points?.length) {
          setState({ data: null, error: json.error ?? "Нет данных" });
          return;
        }
        setState({ data: json.points, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [timeframe, earliestBuyDate]);

  return state;
}
