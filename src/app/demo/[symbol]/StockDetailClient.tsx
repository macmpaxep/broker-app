"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { holdings, stockHistory, TIMEFRAMES, type Timeframe } from "@/lib/portfolio";
import { useDemoPortfolio } from "../useDemoPortfolio";
import { useStockHistory } from "../useHistory";
import Logo from "../Logo";
import TimeSeriesChart from "../TimeSeriesChart";

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
  const accent = isUp ? "var(--vx-positive)" : "var(--vx-negative)";

  const position = summary.rows.find((r) => r.symbol === symbol);

  const { data: realHistory, error: historyError } = useStockHistory(
    symbol,
    timeframe,
    base?.buyDate ?? ""
  );
  // Запасной вариант — смоделированная траектория, только если реальные
  // данные недоступны (например, Yahoo Finance недоступен/лимит).
  const fallbackHistory =
    historyError && base
      ? stockHistory(
          symbol,
          timeframe,
          {
            buyPrice: base.buyPrice,
            buyDate: base.buyDate,
            currentPrice: price || base.currentPrice,
            prevClose: quote?.prevClose ?? null,
          },
          new Date()
        )
      : null;
  const history = realHistory ?? fallbackHistory;

  return (
    <>
      <header
        className="flex items-center gap-3 px-4 sm:px-8 py-4 sticky top-0 z-10"
        style={{
          background: "color-mix(in srgb, var(--vx-bg) 92%, transparent)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--vx-border)",
        }}
      >
        <Link
          href="/demo"
          className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
          style={{ background: "var(--vx-surface)" }}
          aria-label="Назад"
        >
          ←
        </Link>
        <Logo symbol={symbol} logo={profile?.logo} size={32} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-tight">{symbol}</div>
          <div
            className="text-xs truncate leading-tight"
            style={{ color: "var(--vx-text-faint)" }}
          >
            {profile?.name ?? base.name}
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 px-4 sm:px-8 py-6 gap-5 max-w-2xl w-full mx-auto">
        <div>
          <div className="vx-num text-4xl font-semibold tabular-nums">
            {fmtUsd(price)}
          </div>
          <div
            className="text-sm font-medium mt-1 vx-num"
            style={{ color: accent }}
          >
            {changeAbs != null ? `${isUp ? "+" : ""}${changeAbs.toFixed(2)}` : ""}{" "}
            {changePct != null ? `(${fmtPct(changePct)})` : ""}{" "}
            <span style={{ color: "var(--vx-text-faint)" }} className="font-normal">
              за день
            </span>
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
        >
          {history ? (
            <TimeSeriesChart data={history} timeframe={timeframe} color={accent} />
          ) : (
            <div
              className="h-[224px] w-full rounded-2xl animate-pulse"
              style={{ background: "var(--vx-surface-2)" }}
            />
          )}
          <div className="flex justify-between mt-3 gap-1">
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
          {historyError ? (
            <p
              className="text-xs mt-3 font-medium"
              style={{ color: "#ffb84d" }}
            >
              ⚠ Не удалось загрузить реальную историю цен — показан
              приблизительный смоделированный график.
            </p>
          ) : (
            <p className="text-xs mt-3" style={{ color: "var(--vx-text-faint)" }}>
              Реальные исторические котировки (Yahoo Finance).
            </p>
          )}
        </div>

        <div
          className="rounded-3xl p-5"
          style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
        >
          <h2 className="font-semibold mb-3">Ваша позиция</h2>
          {position ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                  Количество
                </div>
                <div className="vx-num font-medium mt-0.5">{position.shares} шт.</div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                  Средняя цена покупки
                </div>
                <div className="vx-num font-medium mt-0.5">
                  {fmtUsd(position.buyPrice)}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                  Рыночная стоимость
                </div>
                <div className="vx-num font-medium mt-0.5">
                  {fmtUsd(position.marketValue)}
                </div>
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                  P&amp;L
                </div>
                <div
                  className="vx-num font-medium mt-0.5"
                  style={{ color: position.pnl >= 0 ? "var(--vx-positive)" : "var(--vx-negative)" }}
                >
                  {position.pnl >= 0 ? "+" : ""}
                  {fmtUsd(position.pnl)} ({fmtPct(position.pnlPct)})
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--vx-text-faint)" }}>
              В портфеле нет этой позиции.
            </p>
          )}
        </div>

        <div
          className="rounded-3xl p-5"
          style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
        >
          <h2 className="font-semibold mb-3">Торговля (демо)</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                Количество
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => {
                  setQty(e.target.value);
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
            <button
              onClick={() => trade(symbol, "buy", Math.floor(Number(qty)))}
              className="rounded-full px-5 py-2 text-sm font-semibold transition active:opacity-80"
              style={{ background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }}
            >
              Купить
            </button>
            <button
              onClick={() => trade(symbol, "sell", Math.floor(Number(qty)))}
              className="rounded-full px-5 py-2 text-sm font-semibold transition active:opacity-80"
              style={{
                background: "var(--vx-surface-2)",
                color: "var(--vx-negative)",
                border: "1px solid var(--vx-border)",
              }}
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
      </main>
    </>
  );
}
