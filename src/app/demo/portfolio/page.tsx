import Link from "next/link";
import LivePortfolio from "../LivePortfolio";

export default function PortfolioPage() {
  return (
    <main className="flex flex-col flex-1 px-4 sm:px-8 pt-6 pb-4 gap-5 max-w-5xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <div
            className="text-xs font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--vx-brand)" }}
          >
            Vertex Capital
          </div>
          <h1 className="text-2xl font-semibold mt-0.5 vx-num">
            Демо-портфель
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo/portfolio/trades"
            className="rounded-full px-4 py-2 text-sm font-semibold transition active:opacity-80"
            style={{
              background: "var(--vx-surface)",
              border: "1px solid var(--vx-border)",
              color: "var(--vx-text)",
            }}
          >
            Сделки
          </Link>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }}
          >
            ДА
          </div>
        </div>
      </header>

      <LivePortfolio />
    </main>
  );
}
