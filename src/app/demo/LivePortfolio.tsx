"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BUY_DATE,
  portfolioHistoryTF,
  TIMEFRAMES,
  type Timeframe,
} from "@/lib/portfolio";
import { WATCHLIST } from "@/lib/watchlist";
import { useDemoPortfolio } from "./useDemoPortfolio";
import { usePortfolioHistory } from "./useHistory";
import Logo from "./Logo";
import TimeSeriesChart from "./TimeSeriesChart";

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
  const pnlColor = isUp ? "var(--vx-positive)" : "var(--vx-negative)";

  const [tradeSymbol, setTradeSymbol] = useState(WATCHLIST[0].symbol);
  const [tradeQty, setTradeQty] = useState("1");
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");

  const { data: realHistory, error: historyError } = usePortfolioHistory(
    timeframe,
    BUY_DATE
  );
  // Запасной вариант — смоделированная траектория, только если реальные
  // данные недоступны (например, Yahoo Finance недоступен/лимит).
  const fallbackHistory = historyError
    ? portfolioHistoryTF(timeframe, totalValue, totalCost, new Date())
    : null;
  const history = realHistory ?? fallbackHistory;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-xs">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background:
              status === "live"
                ? "var(--vx-positive)"
                : status === "stale"
                  ? "#ffb84d"
                  : status === "error"
                    ? "var(--vx-negative)"
                    : "var(--vx-text-faint)",
          }}
        />
        <span style={{ color: "var(--vx-text-faint)" }}>
          {status === "loading" && "Загрузка котировок..."}
          {status === "live" &&
            `Обновлено ${lastUpdated?.toLocaleTimeString("ru-RU")}`}
          {status === "stale" && "Не удалось обновить — последние котировки"}
          {status === "error" && "Не удалось получить котировки"}
        </span>
      </div>

      {/* Сводка портфеля */}
      <div
        className="rounded-3xl p-5 flex flex-col gap-4"
        style={{
          background:
            "linear-gradient(160deg, var(--vx-surface) 0%, var(--vx-surface-2) 100%)",
          border: "1px solid var(--vx-border)",
        }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div
              className="text-xs font-medium"
              style={{ color: "var(--vx-text-faint)" }}
            >
              Стоимость портфеля
            </div>
            <div className="vx-num text-3xl font-semibold mt-1">
              {fmtUsd(totalValue + cash)}
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-xs font-medium"
              style={{ color: "var(--vx-text-faint)" }}
            >
              P&amp;L
            </div>
            <div
              className="vx-num text-lg font-semibold mt-1 whitespace-nowrap"
              style={{ color: pnlColor }}
            >
              {isUp ? "+" : ""}
              {fmtUsd(totalPnl)}
            </div>
            <div
              className="vx-num text-xs font-medium"
              style={{ color: pnlColor }}
            >
              {fmtPct(totalPnlPct)}
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-3 pt-3 border-t"
          style={{ borderColor: "var(--vx-border)" }}
        >
          <div>
            <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
              Вложено
            </div>
            <div className="vx-num text-sm font-medium mt-0.5">
              {fmtUsd(totalCost)}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
              Свободные средства
            </div>
            <div className="vx-num text-sm font-medium mt-0.5">
              {fmtUsd(cash)}
            </div>
          </div>
        </div>
      </div>

      {/* График роста портфеля с выбором периода */}
      <div
        className="rounded-3xl p-4"
        style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
      >
        {history ? (
          <TimeSeriesChart
            data={history}
            timeframe={timeframe}
            color="var(--vx-chart)"
            label="Стоимость"
          />
        ) : (
          <div
            className="h-[224px] w-full rounded-2xl animate-pulse"
            style={{ background: "var(--vx-surface-2)" }}
          />
        )}
        <div className="flex gap-1 mt-2">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className="flex-1 rounded-full py-1.5 text-xs font-semibold transition"
              style={
                timeframe === tf.key
                  ? { background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }
                  : { color: "var(--vx-text-faint)" }
              }
            >
              {tf.label}
            </button>
          ))}
        </div>
        {historyError && (
          <p className="text-xs mt-3 font-medium" style={{ color: "#ffb84d" }}>
            ⚠ Не удалось загрузить реальную историю цен — показан
            приблизительный смоделированный график.
          </p>
        )}
      </div>

      {/* Компактный список позиций */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
      >
        {rows.length === 0 && (
          <p className="px-4 py-6 text-sm" style={{ color: "var(--vx-text-faint)" }}>
            В портфеле пока нет открытых позиций. Купите акцию в разделе
            «Котировки» или через форму ниже.
          </p>
        )}
        {rows.map((row, i) => {
          const q = quotes[row.symbol];
          const profile = profiles[row.symbol];
          const changePct = q?.changePct ?? null;
          const dayUp = (changePct ?? 0) >= 0;
          const posUp = row.pnl >= 0;

          return (
            <Link
              key={row.symbol}
              href={`/demo/${row.symbol}`}
              className="flex items-center gap-3 px-4 py-3.5 transition active:opacity-70"
              style={{
                borderTop: i !== 0 ? "1px solid var(--vx-border)" : undefined,
              }}
            >
              <Logo symbol={row.symbol} logo={profile?.logo} />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-[15px]">{row.symbol}</span>
                  <span className="vx-num font-semibold text-[15px] tabular-nums">
                    {fmtUsd(currentPriceFor(row.symbol))}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "var(--vx-text-faint)" }}
                  >
                    {row.shares} шт. по {fmtUsd(row.buyPrice)}
                  </span>
                  <span
                    className="text-xs font-medium tabular-nums flex items-center gap-1.5"
                    style={{ color: posUp ? "var(--vx-positive)" : "var(--vx-negative)" }}
                  >
                    {fmtUsd(row.marketValue)}
                    <span style={{ color: dayUp ? "var(--vx-positive)" : "var(--vx-negative)" }}>
                      {changePct != null ? fmtPct(changePct) : "—"}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Торговая панель */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-semibold">Торговля (демо)</h2>
          <button
            onClick={reset}
            className="text-xs underline underline-offset-2"
            style={{ color: "var(--vx-text-faint)" }}
          >
            Сбросить портфель
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
              Тикер
            </label>
            <select
              value={tradeSymbol}
              onChange={(e) => {
                setTradeSymbol(e.target.value);
                setTradeMsg(null);
              }}
              className="rounded-xl px-3 py-2 text-sm"
              style={{
                background: "var(--vx-surface-2)",
                border: "1px solid var(--vx-border)",
                color: "var(--vx-text)",
              }}
            >
              {WATCHLIST.map((w) => (
                <option key={w.symbol} value={w.symbol}>
                  {w.symbol}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
              Количество
            </label>
            <input
              type="number"
              min={1}
              value={tradeQty}
              onChange={(e) => {
                setTradeQty(e.target.value);
                setTradeMsg(null);
              }}
              className="w-24 rounded-xl px-3 py-2 text-sm vx-num"
              style={{
                background: "var(--vx-surface-2)",
                border: "1px solid var(--vx-border)",
                color: "var(--vx-text)",
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
              Цена сейчас
            </label>
            <div
              className="px-3 py-2 text-sm vx-num"
              style={{ color: "var(--vx-text-faint)" }}
            >
              {fmtUsd(currentPriceFor(tradeSymbol))}
            </div>
          </div>
          <button
            onClick={() => trade(tradeSymbol, "buy", Math.floor(Number(tradeQty)))}
            className="rounded-full px-5 py-2 text-sm font-semibold transition active:opacity-80"
            style={{ background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }}
          >
            Купить
          </button>
          <button
            onClick={() => trade(tradeSymbol, "sell", Math.floor(Number(tradeQty)))}
            className="rounded-full px-5 py-2 text-sm font-semibold transition active:opacity-80"
            style={{ background: "var(--vx-surface-2)", color: "var(--vx-negative)", border: "1px solid var(--vx-border)" }}
          >
            Продать
          </button>
        </div>
        {tradeMsg && (
          <p
            className="text-xs mt-3"
            style={{
              color: tradeMsg.type === "error" ? "var(--vx-negative)" : "var(--vx-positive)",
            }}
          >
            {tradeMsg.text}
          </p>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
        Котировки и логотипы — через Finnhub, обновляются каждые 30 секунд
        (бесплатный тариф, возможна небольшая задержка). Сделки —
        демонстрационные, хранятся только в этом браузере.
      </p>
    </div>
  );
}
