import IdeasFeed from "./IdeasFeed";

export default function IdeasPage() {
  return (
    <main className="flex flex-col flex-1 px-4 sm:px-8 pt-6 pb-4 gap-5 max-w-5xl w-full mx-auto">
      <header>
        <div
          className="text-xs font-semibold tracking-[0.14em] uppercase"
          style={{ color: "var(--vx-brand)" }}
        >
          Vertex Capital
        </div>
        <h1 className="text-2xl font-semibold mt-0.5 vx-num">Идеи</h1>
        <p className="text-sm mt-1" style={{ color: "var(--vx-text-faint)" }}>
          Новости рынка, переосмысленные ИИ (Claude) в формате коротких
          инвестиционных идей. Источник — заголовки Yahoo Finance.
        </p>
      </header>

      <IdeasFeed />
    </main>
  );
}
