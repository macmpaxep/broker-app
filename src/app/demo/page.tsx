import Link from "next/link";
import { portfolioSummary } from "@/lib/portfolio";
import PortfolioChart from "./PortfolioChart";
import LivePortfolio from "./LivePortfolio";

export default function DemoPage() {
  const { totalCost } = portfolioSummary();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-black/10 dark:border-white/10 bg-white dark:bg-black">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Vertex Capital
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">Демо-счёт</span>
          <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-medium text-sm">
            ДА
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 px-6 sm:px-10 py-8 gap-8 max-w-5xl w-full mx-auto">
        <div>
          <h1 className="text-2xl font-semibold">Демо-портфель</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Условная покупка на $40,000 совершена в несколько приёмов между
            15 июля и 9 сентября 2024 года. Текущие цены обновляются в
            реальном времени через Finnhub.
          </p>
        </div>

        <LivePortfolio />

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-5">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold">Рост портфеля</h2>
            <span className="text-xs text-zinc-500">
              15 июл. 2024 — сегодня
            </span>
          </div>
          <PortfolioChart costBasis={totalCost} />
          <p className="text-xs text-zinc-400 mt-2">
            История — смоделированная траектория для наглядности, не
            биржевые исторические данные.
          </p>
        </div>
      </main>
    </div>
  );
}
