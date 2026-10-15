"use client";

import { useEffect, useRef, useState } from "react";
import {
  holdings,
  portfolioSummary,
  type PositionOverride,
} from "@/lib/portfolio";

const POLL_INTERVAL_MS = 15_000;
const PROFILE_POLL_INTERVAL_MS = 60 * 60 * 1000;
const STORAGE_KEY = "vertex-demo-trading-v2";
export const STARTING_CASH = 5000;

export type QuoteInfo = {
  price: number | null;
  change: number | null;
  changePct: number | null;
  prevClose: number | null;
};

export type ProfileInfo = { logo: string | null; name: string | null };

export type Status = "live" | "loading" | "stale" | "error";

type QuoteApiResponse = {
  quotes: {
    symbol: string;
    price: number | null;
    change: number | null;
    changePct: number | null;
    prevClose: number | null;
  }[];
  error?: string;
};

type ProfileApiResponse = {
  profiles: { symbol: string; logo: string | null; name: string | null }[];
  error?: string;
};

type StoredState = {
  positions: Record<string, PositionOverride>;
  cash: number;
};

function initialPositions(): Record<string, PositionOverride> {
  return Object.fromEntries(
    holdings.map((h) => [h.symbol, { shares: h.shares, buyPrice: h.buyPrice }])
  );
}

function loadStoredState(): StoredState {
  if (typeof window === "undefined") {
    return { positions: initialPositions(), cash: STARTING_CASH };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { positions: initialPositions(), cash: STARTING_CASH };
    const parsed = JSON.parse(raw) as StoredState;
    return {
      positions: { ...initialPositions(), ...parsed.positions },
      cash: typeof parsed.cash === "number" ? parsed.cash : STARTING_CASH,
    };
  } catch {
    return { positions: initialPositions(), cash: STARTING_CASH };
  }
}

export function useDemoPortfolio() {
  const [quotes, setQuotes] = useState<Record<string, QuoteInfo>>({});
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mounted = useRef(true);

  const [positions, setPositions] = useState<Record<string, PositionOverride>>(
    initialPositions()
  );
  const [cash, setCash] = useState(STARTING_CASH);
  const [hydrated, setHydrated] = useState(false);

  const [tradeMsg, setTradeMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const stored = loadStoredState();
    setPositions(stored.positions);
    setCash(stored.cash);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ positions, cash })
    );
  }, [positions, cash, hydrated]);

  useEffect(() => {
    mounted.current = true;

    async function pollQuotes() {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        const data: QuoteApiResponse = await res.json();
        if (!mounted.current) return;

        if (!res.ok || data.error) {
          setStatus((prev) => (prev === "live" ? "stale" : "error"));
          return;
        }

        setQuotes((prev) => {
          const next = { ...prev };
          for (const q of data.quotes) {
            if (q.price != null) {
              next[q.symbol] = {
                price: q.price,
                change: q.change,
                changePct: q.changePct,
                prevClose: q.prevClose,
              };
            }
          }
          return next;
        });
        setStatus("live");
        setLastUpdated(new Date());
      } catch {
        if (mounted.current) {
          setStatus((prev) => (prev === "live" ? "stale" : "error"));
        }
      }
    }

    async function pollProfiles() {
      try {
        const res = await fetch("/api/profiles", { cache: "no-store" });
        const data: ProfileApiResponse = await res.json();
        if (!mounted.current || !res.ok || data.error) return;
        setProfiles((prev) => {
          const next = { ...prev };
          for (const p of data.profiles) {
            next[p.symbol] = { logo: p.logo, name: p.name };
          }
          return next;
        });
      } catch {
        // Логотипы необязательны — молча пропускаем сбой.
      }
    }

    pollQuotes();
    pollProfiles();
    const quotesId = setInterval(pollQuotes, POLL_INTERVAL_MS);
    const profilesId = setInterval(pollProfiles, PROFILE_POLL_INTERVAL_MS);
    return () => {
      mounted.current = false;
      clearInterval(quotesId);
      clearInterval(profilesId);
    };
  }, []);

  const livePrices = Object.fromEntries(
    Object.entries(quotes)
      .filter(([, q]) => q.price != null)
      .map(([symbol, q]) => [symbol, q.price as number])
  );

  const summary = portfolioSummary(livePrices, positions);

  function currentPriceFor(symbol: string) {
    if (quotes[symbol]?.price != null) return quotes[symbol].price as number;
    return holdings.find((h) => h.symbol === symbol)?.currentPrice ?? 0;
  }

  function trade(symbol: string, side: "buy" | "sell", qty: number) {
    if (!qty || qty <= 0) {
      setTradeMsg({ type: "error", text: "Укажите количество акций больше нуля." });
      return;
    }
    const price = currentPriceFor(symbol);
    if (!price) {
      setTradeMsg({ type: "error", text: "Нет актуальной цены для этого тикера." });
      return;
    }
    const current = positions[symbol] ?? { shares: 0, buyPrice: price };

    if (side === "buy") {
      const cost = qty * price;
      if (cost > cash) {
        setTradeMsg({
          type: "error",
          text: `Недостаточно средств: нужно ${cost.toFixed(2)} $, доступно ${cash.toFixed(2)} $.`,
        });
        return;
      }
      const newShares = current.shares + qty;
      const newCostBasis = current.shares * current.buyPrice + cost;
      setPositions((prev) => ({
        ...prev,
        [symbol]: { shares: newShares, buyPrice: newCostBasis / newShares },
      }));
      setCash((c) => c - cost);
      setTradeMsg({
        type: "success",
        text: `Куплено ${qty} ${symbol} по ${price.toFixed(2)} $ за акцию.`,
      });
    } else {
      if (qty > current.shares) {
        setTradeMsg({
          type: "error",
          text: `Недостаточно акций: в портфеле ${current.shares} ${symbol}.`,
        });
        return;
      }
      const proceeds = qty * price;
      const newShares = current.shares - qty;
      setPositions((prev) => ({
        ...prev,
        [symbol]: {
          shares: newShares,
          buyPrice: newShares > 0 ? current.buyPrice : 0,
        },
      }));
      setCash((c) => c + proceeds);
      setTradeMsg({
        type: "success",
        text: `Продано ${qty} ${symbol} по ${price.toFixed(2)} $ за акцию.`,
      });
    }
  }

  function reset() {
    setPositions(initialPositions());
    setCash(STARTING_CASH);
    setTradeMsg({ type: "success", text: "Портфель сброшен к исходному состоянию." });
  }

  return {
    quotes,
    profiles,
    status,
    lastUpdated,
    positions,
    cash,
    summary,
    currentPriceFor,
    trade,
    reset,
    tradeMsg,
    setTradeMsg,
  };
}
