"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { portfolioHistory } from "@/lib/portfolio";

function fmtUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function PortfolioChart({ costBasis }: { costBasis: number }) {
  const [data, setData] = useState<ReturnType<typeof portfolioHistory> | null>(
    null
  );

  useEffect(() => {
    setData(portfolioHistory(new Date()));
  }, []);

  if (!data) {
    return (
      <div className="h-72 w-full animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
    );
  }

  const isUp = data[data.length - 1].value >= costBasis;
  const color = isUp ? "#10b981" : "#ef4444";

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-black/10 dark:text-white/10"
          />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDateShort}
            minTickGap={48}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-zinc-500"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtUsd}
            width={72}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-zinc-500"
            domain={["dataMin - 2000", "dataMax + 2000"]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [fmtUsd(Number(value)), "Стоимость"]}
            labelFormatter={(label) => fmtDateShort(String(label))}
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
            fill="url(#portfolioFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
