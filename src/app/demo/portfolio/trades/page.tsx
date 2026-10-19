import Link from "next/link";
import TradesClient from "./TradesClient";

export default function TradesPage() {
  return (
    <main className="flex flex-col flex-1 px-4 sm:px-8 pt-6 pb-4 gap-5 max-w-5xl w-full mx-auto">
      <header className="flex items-center gap-3">
        <Link
          href="/demo/portfolio"
          className="w-8 h-8 flex items-center justify-center rounded-full shrink-0"
          style={{ background: "var(--vx-surface)" }}
          aria-label="Назад"
        >
          ←
        </Link>
        <div>
          <div
            className="text-xs font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--vx-brand)" }}
          >
            Vertex Capital
          </div>
          <h1 className="text-2xl font-semibold mt-0.5 vx-num">Сделки</h1>
        </div>
      </header>

      <TradesClient />
    </main>
  );
}
