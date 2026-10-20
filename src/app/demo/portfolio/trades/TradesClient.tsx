"use client";

import { useState } from "react";
import Link from "next/link";
import { closedTrades, withClosedMetrics } from "@/lib/trades";
import { useDemoPortfolio } from "../../useDemoPortfolio";
import Logo from "../../Logo";
import PositionBadge from "../../PositionBadge";

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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type Tab = "open" | "closed";

export default function TradesClient() {
  const [tab, setTab] = useState<Tab>("open");
  const { summary, quotes, profiles } = useDemoPortfolio();

  const closed = closedTrades.map(withClosedMetrics);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="flex gap-1 p-1 rounded-full"
        style={{ background: "var(--vx-surface-2)", border: "1px solid var(--vx-border)" }}
      >
        <button
          onClick={() => setTab("open")}
          className="flex-1 rounded-full py-2 text-sm font-semibold transition"
          style={
            tab === "open"
              ? { background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }
              : { color: "var(--vx-text-faint)" }
          }
        >
          Открытые
        </button>
        <button
          onClick={() => setTab("closed")}
          className="flex-1 rounded-full py-2 text-sm font-semibold transition"
          style={
            tab === "closed"
              ? { background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }
              : { color: "var(--vx-text-faint)" }
          }
        >
          Закрытые
        </button>
      </div>

      {tab === "open" ? (
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
        >
          {summary.rows.length === 0 && (
            <p className="px-4 py-6 text-sm" style={{ color: "var(--vx-text-faint)" }}>
              Нет открытых позиций.
            </p>
          )}
          {summary.rows.map((row, i) => {
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
                style={{ borderTop: i !== 0 ? "1px solid var(--vx-border)" : undefined }}
              >
                <Logo symbol={row.symbol} logo={profile?.logo} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-[15px]">{row.symbol}</span>
                      <PositionBadge side="long" />
                    </span>
                    <span className="vx-num font-semibold text-[15px] tabular-nums">
                      {fmtUsd(row.currentPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-xs tabular-nums" style={{ color: "var(--vx-text-faint)" }}>
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
      ) : (
        <div className="flex flex-col gap-3">
          {closed.length === 0 && (
            <p
              className="rounded-3xl p-5 text-sm text-center"
              style={{
                background: "var(--vx-surface)",
                border: "1px solid var(--vx-border)",
                color: "var(--vx-text-faint)",
              }}
            >
              Нет закрытых сделок.
            </p>
          )}
          {closed.map((t) => {
            const up = t.profit >= 0;
            return (
              <div
                key={`${t.symbol}-${t.sellDate}`}
                className="rounded-3xl p-4"
                style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
              >
                <div className="flex items-center gap-3">
                  <Logo symbol={t.symbol} logo={profiles[t.symbol]?.logo} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[15px]">{t.symbol}</span>
                      <PositionBadge side="long" />
                    </div>
                    <div className="text-xs truncate" style={{ color: "var(--vx-text-faint)" }}>
                      {t.name}
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                    style={{ background: "var(--vx-surface-2)", color: "var(--vx-text-faint)" }}
                  >
                    Закрыта
                  </span>
                </div>

                <div
                  className="grid grid-cols-2 gap-3 mt-4 pt-4"
                  style={{ borderTop: "1px solid var(--vx-border)" }}
                >
                  <div>
                    <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                      Продано
                    </div>
                    <div className="vx-num text-sm font-medium mt-0.5">
                      {t.shares} шт. по {fmtUsd(t.sellPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                      Дата продажи
                    </div>
                    <div className="vx-num text-sm font-medium mt-0.5">
                      {fmtDate(t.sellDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                      Цена покупки
                    </div>
                    <div className="vx-num text-sm font-medium mt-0.5">
                      {fmtUsd(t.buyPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                      Сумма продажи
                    </div>
                    <div className="vx-num text-sm font-medium mt-0.5">
                      {fmtUsd(t.proceeds)}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between mt-3 pt-3"
                  style={{ borderTop: "1px solid var(--vx-border)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--vx-text-faint)" }}>
                    Прибыль
                  </span>
                  <span
                    className="vx-num text-base font-semibold"
                    style={{ color: up ? "var(--vx-positive)" : "var(--vx-negative)" }}
                  >
                    {up ? "+" : ""}
                    {fmtUsd(t.profit)}{" "}
                    <span className="text-sm font-medium">({fmtPct(t.profitPct)})</span>
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs font-medium" style={{ color: "var(--vx-text-faint)" }}>
                    Комиссия
                  </span>
                  <span className="vx-num text-sm font-medium" style={{ color: "var(--vx-text-faint)" }}>
                    −{fmtUsd(t.commission)}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between mt-1.5 pt-1.5"
                  style={{ borderTop: "1px solid var(--vx-border)" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--vx-text)" }}>
                    Чистая прибыль
                  </span>
                  <span
                    className="vx-num text-base font-semibold"
                    style={{ color: t.netProfit >= 0 ? "var(--vx-positive)" : "var(--vx-negative)" }}
                  >
                    {t.netProfit >= 0 ? "+" : ""}
                    {fmtUsd(t.netProfit)}{" "}
                    <span className="text-sm font-medium">({fmtPct(t.netProfitPct)})</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
