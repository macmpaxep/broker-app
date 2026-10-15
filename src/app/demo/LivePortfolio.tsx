"use client";

import { useEffect, useRef, useState } from "react";
import {
  holdings,
  portfolioSummary,
  type PositionOverride,
} from "@/lib/portfolio";

const POLL_INTERVAL_MS = 15_000;
const STORAGE_KEY = "vertex-demo-trading-v1";
const STARTING_CASH = 5000;

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

type QuoteApiResponse = {
  quotes: { symbol: string; price: number | null; updatedAt: number }[];
  error?: string;
};

type Status = "live" | "loading" | "stale" | "error";

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

export default function LivePortfolio() {
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Status>("loading");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mounted = useRef(true);

  const [positions, setPositions] = useState<Record<string, PositionOverride>>(
    initialPositions()
  );
  const [cash, setCash] = useState(STARTING_CASH);
  const [hydrated, setHydrated] = useState(false);

  const [tradeSymbol, setTradeSymbol] = useState(holdings[0].symbol);
  const [tradeQty, setTradeQty] = useState("1");
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

    async function poll() {
      try {
        const res = await fetch("/api/quotes", { cache: "no-store" });
        const data: QuoteApiResponse = await res.json();
        if (!mounted.current) return;

        if (!res.ok || data.error) {
          setStatus((prev) => (prev === "live" ? "stale" : "error"));
          return;
        }

        setLivePrices((prev) => {
          const next = { ...prev };
          for (const q of data.quotes) {
            if (q.price != null) next[q.symbol] = q.price;
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

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  const { rows, totalCost, totalValue, totalPnl, totalPnlPct } =
    portfolioSummary(livePrices, positions);
  const isUp = totalPnl >= 0;
  const hasLiveData = Object.keys(livePrices).length > 0;

  function currentPriceFor(symbol: string) {
    if (livePrices[symbol] != null) return livePrices[symbol];
    return holdings.find((h) => h.symbol === symbol)?.currentPrice ?? 0;
  }

  function handleTrade(side: "buy" | "sell") {
    const qty = Math.floor(Number(tradeQty));
    if (!qty || qty <= 0) {
      setTradeMsg({ type: "error", text: "Укажите количество акций больше нуля." });
      return;
    }
    const price = currentPriceFor(tradeSymbol);
    if (!price) {
      setTradeMsg({ type: "error", text: "Нет актуальной цены для этого тикера." });
      return;
    }
    const current = positions[tradeSymbol] ?? { shares: 0, buyPrice: price };

    if (side === "buy") {
      const cost = qty * price;
      if (cost > cash) {
        setTradeMsg({
          type: "error",
          text: `Недостаточно средств: нужно ${fmtUsd(cost)}, доступно ${fmtUsd(cash)}.`,
        });
        return;
      }
      const newShares = current.shares + qty;
      const newCostBasis = current.shares * current.buyPrice + cost;
      setPositions((prev) => ({
        ...prev,
        [tradeSymbol]: {
          shares: newShares,
          buyPrice: newCostBasis / newShares,
        },
      }));
      setCash((c) => c - cost);
      setTradeMsg({
        type: "success",
        text: `Куплено ${qty} ${tradeSymbol} по ${fmtUsd(price)} за акцию.`,
      });
    } else {
      if (qty > current.shares) {
        setTradeMsg({
          type: "error",
          text: `Недостаточно акций: в портфеле ${current.shares} ${tradeSymbol}.`,
        });
        return;
      }
      const proceeds = qty * price;
      const newShares = current.shares - qty;
      setPositions((prev) => ({
        ...prev,
        [tradeSymbol]: {
          shares: newShares,
          buyPrice: newShares > 0 ? current.buyPrice : 0,
        },
      }));
      setCash((c) => c + proceeds);
      setTradeMsg({
        type: "success",
        text: `Продано ${qty} ${tradeSymbol} по ${fmtUsd(price)} за акцию.`,
      });
    }
  }

  function handleReset() {
    setPositions(initialPositions());
    setCash(STARTING_CASH);
    setTradeMsg({ type: "success", text: "Портфель сброшен к исходному состоянию." });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            status === "live"
              ? "bg-emerald-500 animate-pulse"
              : status === "stale"
                ? "bg-amber-500"
                : status === "error"
                  ? "bg-red-500"
                  : "bg-zinc-400"
          }`}
        />
        <span className="text-zinc-500">
          {status === "loading" && "Загрузка котировок..."}
          {status === "live" &&
            `Котировки Finnhub обновлены ${lastUpdated?.toLocaleTimeString("ru-RU")}`}
          {status === "stale" &&
            `Не удалось обновить — показаны последние котировки (${lastUpdated?.toLocaleTimeString("ru-RU") ?? "—"})`}
          {status === "error" && "Не удалось получить котировки с Finnhub"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
          <div className="text-sm text-zinc-500">Стоимость портфеля</div>
          <div className="text-2xl font-semibold mt-1">
            {fmtUsd(totalValue)}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
          <div className="text-sm text-zinc-500">Вложено</div>
          <div className="text-2xl font-semibold mt-1">
            {fmtUsd(totalCost)}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
          <div className="text-sm text-zinc-500">Свободные средства</div>
          <div className="text-2xl font-semibold mt-1">{fmtUsd(cash)}</div>
        </div>
        <div
          className={`rounded-2xl p-5 border ${
            isUp
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
          }`}
        >
          <div className="text-sm text-zinc-500">Общий P&amp;L</div>
          <div
            className={`text-2xl font-semibold mt-1 ${
              isUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isUp ? "+" : ""}
            {fmtUsd(totalPnl)}{" "}
            <span className="text-base font-medium">
              ({fmtPct(totalPnlPct)})
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-semibold">Торговля (демо)</h2>
          <button
            onClick={handleReset}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2"
          >
            Сбросить портфель
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Тикер</label>
            <select
              value={tradeSymbol}
              onChange={(e) => {
                setTradeSymbol(e.target.value);
                setTradeMsg(null);
              }}
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            >
              {holdings.map((h) => (
                <option key={h.symbol} value={h.symbol}>
                  {h.symbol}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Количество</label>
            <input
              type="number"
              min={1}
              value={tradeQty}
              onChange={(e) => {
                setTradeQty(e.target.value);
                setTradeMsg(null);
              }}
              className="w-24 rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Цена сейчас</label>
            <div className="px-3 py-2 text-sm text-zinc-500">
              {fmtUsd(currentPriceFor(tradeSymbol))}
            </div>
          </div>
          <button
            onClick={() => handleTrade("buy")}
            className="rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-medium hover:bg-emerald-700 transition"
          >
            Купить
          </button>
          <button
            onClick={() => handleTrade("sell")}
            className="rounded-full bg-red-600 text-white px-5 py-2 text-sm font-medium hover:bg-red-700 transition"
          >
            Продать
          </button>
        </div>
        {tradeMsg && (
          <p
            className={`text-xs mt-3 ${
              tradeMsg.type === "error"
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {tradeMsg.text}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10 text-left text-zinc-500">
              <th className="px-4 py-3 font-medium">Тикер</th>
              <th className="px-4 py-3 font-medium">Кол-во</th>
              <th className="px-4 py-3 font-medium text-right">
                Цена покупки
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Текущая цена
              </th>
              <th className="px-4 py-3 font-medium text-right">
                Рыночная стоимость
              </th>
              <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
              <th className="px-4 py-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((base) => {
              const row = rows.find((r) => r.symbol === base.symbol);
              const isLive = livePrices[base.symbol] != null;
              const price = currentPriceFor(base.symbol);
              return (
                <tr
                  key={base.symbol}
                  className="border-b border-black/5 dark:border-white/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold">{base.symbol}</div>
                    <div className="text-zinc-500 text-xs">{base.name}</div>
                  </td>
                  <td className="px-4 py-3">{row?.shares ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    {row ? fmtUsd(row.buyPrice) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        isLive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : ""
                      }
                    >
                      {fmtUsd(price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row ? fmtUsd(row.marketValue) : fmtUsd(0)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      row && row.pnl >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {row ? (
                      <>
                        {row.pnl >= 0 ? "+" : ""}
                        {fmtUsd(row.pnl)}
                        <div className="text-xs font-normal">
                          {fmtPct(row.pnlPct)}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setTradeSymbol(base.symbol);
                        setTradeQty("1");
                        setTradeMsg(null);
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2"
                    >
                      Выбрать
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-400">
        {hasLiveData
          ? "Текущие цены обновляются с рынка через Finnhub каждые 15 секунд (бесплатный тариф, возможна небольшая задержка)."
          : "Показаны ориентировочные цены до первого успешного ответа API."}{" "}
        Сделки — демонстрационные, исполняются по текущей отображаемой цене
        и хранятся только в этом браузере.
      </p>
    </div>
  );
}
