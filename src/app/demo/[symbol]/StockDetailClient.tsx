"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { holdings, stockHistory, TIMEFRAMES, type Timeframe } from "@/lib/portfolio";
import { useDemoPortfolio } from "../useDemoPortfolio";
import Logo from "../Logo";
import StockChart from "./StockChart";

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

export default function StockDetailClient({ symbol }: { symbol: string }) {
  const base = holdings.find((h) => h.symbol === symbol);

  const {
    quotes,
    profiles,
    summary,
    currentPriceFor,
    trade,
    tradeMsg,
    setTradeMsg,
  } = useDemoPortfolio();

  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [qty, setQty] = useState("1");

  if (!base) {
    notFound();
  }

  const quote = quotes[symbol];
  const profile = profiles[symbol];
  const price = currentPriceFor(symbol);
  const changePct = quote?.changePct ?? null;
  const changeAbs = quote?.change ?? null;
  const isUp = (changePct ?? 0) >= 0;

  const position = summary.rows.find((r) => r.symbol === symbol);

  const history = useMemo(
    () =>
      stockHistory(
        symbol,
        timeframe,
        {
          buyPrice: base.buyPrice,
          buyDate: base.buyDate,
          currentPrice: price || base.currentPrice,
          prevClose: quote?.prevClose ?? null,
        },
        new Date()
      ),
    [symbol, timeframe, base, price, quote?.prevClose]
  );

  const chartColor = isUp ? "#10b981" : "#ef4444";

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <header className="flex items-center gap-3 px-4 sm:px-10 py-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
        <Link
          href="/demo"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          aria-label="Назад"
        >
          ←
        </Link>
        <Logo symbol={symbol} logo={profile?.logo} size={32} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-tight">{symbol}</div>
          <div className="text-xs text-zinc-500 truncate leading-tight">
            {profile?.name ?? base.name}
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 px-4 sm:px-10 py-6 gap-6 max-w-2xl w-full mx-auto">
        <div>
          <div className="text-3xl font-semibold tabular-nums">
            {fmtUsd(price)}
          </div>
          <div
            className={`text-sm font-medium mt-1 ${
              isUp
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {changeAbs != null ? `${isUp ? "+" : ""}${changeAbs.toFixed(2)}` : ""}{" "}
            {changePct != null ? `(${fmtPct(changePct)})` : ""}{" "}
            <span className="text-zinc-400 font-normal">за день</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-4">
          <StockChart data={history} timeframe={timeframe} color={chartColor} />
          <div className="flex justify-between mt-3 gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`flex-1 rounded-full py-1.5 text-xs font-medium transition ${
                  timeframe === tf.key
                    ? "bg-foreground text-background"
                    : "text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-3">
            {timeframe === "ALL"
              ? `С даты условной покупки (${new Date(base.buyDate).toLocaleDateString("ru-RU")}) — смоделированная траектория к текущей цене.`
              : "Смоделированная траектория для наглядности, не биржевые исторические данные."}
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
          <h2 className="font-semibold mb-3">Ваша позиция</h2>
          {position ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-zinc-500 text-xs">Количество</div>
                <div className="font-medium mt-0.5">{position.shares} шт.</div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs">Средняя цена покупки</div>
                <div className="font-medium mt-0.5">
                  {fmtUsd(position.buyPrice)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs">Рыночная стоимость</div>
                <div className="font-medium mt-0.5">
                  {fmtUsd(position.marketValue)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 text-xs">P&amp;L</div>
                <div
                  className={`font-medium mt-0.5 ${
                    position.pnl >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {position.pnl >= 0 ? "+" : ""}
                  {fmtUsd(position.pnl)} ({fmtPct(position.pnlPct)})
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              В портфеле нет этой позиции.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
          <h2 className="font-semibold mb-3">Торговля (демо)</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Количество</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => {
                  setQty(e.target.value);
                  setTradeMsg(null);
                }}
                className="w-24 rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => trade(symbol, "buy", Math.floor(Number(qty)))}
              className="rounded-full bg-emerald-600 text-white px-5 py-2 text-sm font-medium hover:bg-emerald-700 transition"
            >
              Купить
            </button>
            <button
              onClick={() => trade(symbol, "sell", Math.floor(Number(qty)))}
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
      </main>
    </div>
  );
}
