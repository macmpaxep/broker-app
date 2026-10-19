"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryPoint, Timeframe } from "@/lib/portfolio";

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtUsdCompact(n: number) {
  if (n >= 1000) {
    return `$${(n / 1000).toLocaleString("en-US", {
      maximumFractionDigits: n >= 10000 ? 0 : 1,
    })}k`;
  }
  return `$${n.toFixed(0)}`;
}

function fmtTooltipDate(d: string, timeframe: Timeframe) {
  const date = new Date(d);
  if (timeframe === "1D") {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: timeframe === "ALL" ? "2-digit" : undefined,
  });
}

// Короткие подписи для оси X — формат меняется в зависимости от периода,
// как в TradingView: внутри дня показываем время, на недельных/месячных
// окнах — число и месяц, на годовом горизонте — месяц и год.
function fmtAxisDate(d: string, timeframe: Timeframe) {
  const date = new Date(d);
  if (timeframe === "1D") {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  if (timeframe === "1W") {
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
  }
  if (timeframe === "ALL") {
    return date.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" });
  }
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

export default function TimeSeriesChart({
  data,
  timeframe,
  color,
  label = "Цена",
  height = 224,
}: {
  data: HistoryPoint[];
  timeframe: Timeframe;
  color: string;
  label?: string;
  height?: number;
}) {
  const gradientId = useId();

  // Показываем ~5-6 подписей независимо от числа точек в датасете —
  // Recharts interval задаёт, сколько тиков пропускать между видимыми.
  const desiredTicks = 6;
  const tickInterval =
    data.length > desiredTicks ? Math.ceil(data.length / desiredTicks) - 1 : 0;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--vx-border)"
            vertical={false}
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => fmtAxisDate(String(d), timeframe)}
            interval={tickInterval}
            tick={{
              fill: "var(--vx-text-faint)",
              fontSize: 11,
              fontFamily: "var(--font-display)",
            }}
            axisLine={{ stroke: "var(--vx-border)" }}
            tickLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            tickFormatter={fmtUsdCompact}
            tick={{
              fill: "var(--vx-text-faint)",
              fontSize: 11,
              fontFamily: "var(--font-display)",
            }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickCount={5}
          />
          <Tooltip
            formatter={(value) => [fmtUsd(Number(value)), label]}
            labelFormatter={(l) => fmtTooltipDate(String(l), timeframe)}
            contentStyle={{
              background: "var(--vx-surface-2)",
              border: "1px solid var(--vx-border)",
              borderRadius: 14,
              fontSize: 12,
              color: "var(--vx-text)",
              fontFamily: "var(--font-display)",
            }}
            itemStyle={{ color: "var(--vx-text)" }}
            labelStyle={{ color: "var(--vx-text-dim)" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
