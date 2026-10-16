"use client";

import Link from "next/link";
import { WATCHLIST } from "@/lib/watchlist";
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

export default function Quotes() {
  const { quotes, profiles, status, lastUpdated, summary, currentPriceFor } =
    useDemoPortfolio();

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

      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
      >
        {WATCHLIST.map((entry, i) => {
          const q = quotes[entry.symbol];
          const profile = profiles[entry.symbol];
          const changePct = q?.changePct ?? null;
          const dayUp = (changePct ?? 0) >= 0;
          const owned = summary.rows.find((r) => r.symbol === entry.symbol);

          return (
            <Link
              key={entry.symbol}
              href={`/demo/${entry.symbol}`}
              className="flex items-center gap-3 px-4 py-3.5 transition active:opacity-70"
              style={{
                borderTop: i !== 0 ? "1px solid var(--vx-border)" : undefined,
              }}
            >
              <Logo symbol={entry.symbol} logo={profile?.logo} />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-[15px]">{entry.symbol}</span>
                  {owned && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "var(--vx-surface-2)",
                        color: "var(--vx-brand)",
                      }}
                    >
                      В портфеле
                    </span>
                  )}
                </div>
                <div
                  className="text-xs truncate leading-tight"
                  style={{ color: "var(--vx-text-faint)" }}
                >
                  {profile?.name ?? entry.name}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="vx-num font-semibold text-[15px] tabular-nums">
                  {fmtUsd(currentPriceFor(entry.symbol))}
                </div>
                <div
                  className="text-xs font-medium tabular-nums"
                  style={{ color: dayUp ? "var(--vx-positive)" : "var(--vx-negative)" }}
                >
                  {changePct != null ? fmtPct(changePct) : "—"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
        Котировки и логотипы — через Finnhub, обновляются каждые 30 секунд
        (бесплатный тариф, возможна небольшая задержка).
      </p>
    </div>
  );
}
