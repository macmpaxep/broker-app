"use client";

import { useState } from "react";
import Link from "next/link";
import { holdings } from "@/lib/portfolio";
import { useDemoPortfolio } from "./useDemoPortfolio";
import Logo from "./Logo";

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

export default function LivePortfolio() {
  const {
    quotes,
    profiles,
    status,
    lastUpdated,
    cash,
    summary,
    currentPriceFor,
    trade,
    reset,
    tradeMsg,
    setTradeMsg,
  } = useDemoPortfolio();

  const { rows, totalCost, totalValue, totalPnl, totalPnlPct } = summary;
  const isUp = totalPnl >= 0;

  const [tradeSymbol, setTradeSymbol] = useState(holdings[0].symbol);
  const [tradeQty, setTradeQty] = useState("1");

  return (
    <div className="flex flex-col gap-6">
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
            `Обновлено ${lastUpdated?.toLocaleTimeString("ru-RU")}`}
          {status === "stale" &&
            `Не удалось обновить — показаны последние котировки`}
          {status === "error" && "Не удалось получить котировки"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-4">
          <div className="text-xs text-zinc-500">Портфель</div>
          <div className="text-lg font-semibold mt-0.5">
            {fmtUsd(totalValue)}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-4">
          <div className="text-xs text-zinc-500">Вложено</div>
          <div className="text-lg font-semibold mt-0.5">
            {fmtUsd(totalCost)}
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-4">
          <div className="text-xs text-zinc-500">Средства</div>
          <div className="text-lg font-semibold mt-0.5">{fmtUsd(cash)}</div>
        </div>
        <div
          className={`rounded-2xl p-4 border ${
            isUp
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
          }`}
        >
          <div className="text-xs text-zinc-500">P&amp;L</div>
          <div
            className={`text-lg font-semibold mt-0.5 ${
              isUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isUp ? "+" : ""}
            {fmtUsd(totalPnl)}
            <span className="text-xs font-medium ml-1">
              ({fmtPct(totalPnlPct)})
            </span>
          </div>
        </div>
      </div>

      {/* Компактный список позиций в стиле watchlist */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 overflow-hidden">
        {holdings.map((base, i) => {
          const row = rows.find((r) => r.symbol === base.symbol);
          const q = quotes[base.symbol];
          const profile = profiles[base.symbol];
          const changePct = q?.changePct ?? null;
          const dayUp = (changePct ?? 0) >= 0;

          return (
            <Link
              key={base.symbol}
              href={`/demo/${base.symbol}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.04] transition ${
                i !== 0 ? "border-t border-black/5 dark:border-white/5" : ""
              }`}
            >
              <Logo symbol={base.symbol} logo={profile?.logo} />

              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight">
                  {base.symbol}
                </div>
                <div className="text-xs text-zinc-500 truncate leading-tight">
                  {profile?.name ?? base.name}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-semibold leading-tight tabular-nums">
                  {fmtUsd(currentPriceFor(base.symbol))}
                </div>
                <div
                  className={`text-xs leading-tight tabular-nums ${
                    dayUp
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {changePct != null ? fmtPct(changePct) : "—"}
                </div>
              </div>

              <div className="text-right shrink-0 hidden sm:block w-28">
                <div className="text-xs text-zinc-500 leading-tight">
                  {row?.shares ?? 0} шт.
                </div>
                <div
                  className={`text-xs font-medium leading-tight tabular-nums ${
                    row && row.pnl >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {row ? `${row.pnl >= 0 ? "+" : ""}${fmtUsd(row.pnl)}` : "—"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-semibold">Торговля (демо)</h2>
          <button
            onClick={reset}
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
            onClick={() => trade(tradeSymbol, "buy", Math.floor(Number(tradeQty)))}
            className="rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-medium hover:bg-emerald-700 transition"
          >
            Купить
          </button>
          <button
            onClick={() => trade(tradeSymbol, "sell", Math.floor(Number(tradeQty)))}
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

      <p className="text-xs text-zinc-400">
        Котировки и логотипы — через Finnhub, обновляются каждые 15 секунд
        (бесплатный тариф, возможна небольшая задержка). Сделки —
        демонстрационные, хранятся только в этом браузере.
      </p>
    </div>
  );
}
