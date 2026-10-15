"use client";

import {
  Area,
  AreaChart,
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

export default function StockChart({
  data,
  timeframe,
  color,
}: {
  data: HistoryPoint[];
  timeframe: Timeframe;
  color: string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="stockFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            formatter={(value) => [fmtUsd(Number(value)), "Цена"]}
            labelFormatter={(label) => fmtTooltipDate(String(label), timeframe)}
            contentStyle={{
              background: "var(--background)",
              border: "1px solid rgba(128,128,128,0.3)",
              borderRadius: 12,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#stockFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
