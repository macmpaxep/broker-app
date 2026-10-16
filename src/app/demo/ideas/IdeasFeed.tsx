"use client";

import { useEffect, useState } from "react";
import type { Idea } from "@/app/api/ideas/route";

function timeAgo(unixSeconds: number) {
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export default function IdeasFeed() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [nextPage, setNextPage] = useState<number | null>(0);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadPage(page: number) {
    if (page === 0) setIdeas(null);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/ideas?page=${page}`);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        return;
      }
      setIdeas((prev) => (page === 0 ? json.ideas ?? [] : [...(prev ?? []), ...(json.ideas ?? [])]));
      setNextPage(json.nextPage ?? null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div
        className="rounded-3xl p-5 text-sm"
        style={{
          background: "var(--vx-surface)",
          border: "1px solid var(--vx-border)",
          color: "var(--vx-text-faint)",
        }}
      >
        ⚠ Не удалось загрузить идеи: {error}
      </div>
    );
  }

  if (!ideas) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-3xl animate-pulse"
            style={{ background: "var(--vx-surface-2)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {ideas.map((idea) => (
          <button
            key={idea.uuid}
            onClick={() => setSelected(idea)}
            className="rounded-3xl p-4 flex gap-3 text-left transition active:opacity-80"
            style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
          >
            {idea.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={idea.thumbnail}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center"
                style={{ background: "var(--vx-surface-2)" }}
              >
                <span className="text-xl">💡</span>
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <p className="font-semibold text-[15px] leading-snug">
                {idea.headline}
              </p>
              <p
                className="text-sm leading-snug line-clamp-2"
                style={{ color: "var(--vx-text-dim)" }}
              >
                {idea.summary}
              </p>
              <div
                className="text-[11px] flex items-center gap-1.5 mt-0.5"
                style={{ color: "var(--vx-text-faint)" }}
              >
                <span
                  className="px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ background: "var(--vx-surface-2)", color: "var(--vx-violet)" }}
                >
                  AI
                </span>
                <span className="truncate">{idea.publisher}</span>
                <span>·</span>
                <span className="shrink-0">{timeAgo(idea.publishedAt)}</span>
              </div>
            </div>
          </button>
        ))}

        {nextPage != null && (
          <button
            onClick={() => loadPage(nextPage)}
            disabled={loadingMore}
            className="rounded-full py-2.5 text-sm font-semibold transition active:opacity-80"
            style={{
              background: "var(--vx-surface)",
              border: "1px solid var(--vx-border)",
              color: "var(--vx-text-faint)",
            }}
          >
            {loadingMore ? "Загрузка..." : "Показать ещё"}
          </button>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--vx-surface-2)", color: "var(--vx-violet)" }}
              >
                AI-идея
              </span>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--vx-surface-2)" }}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {selected.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.thumbnail}
                alt=""
                className="w-full h-40 rounded-2xl object-cover"
              />
            )}

            <h2 className="text-xl font-semibold leading-snug">
              {selected.headline}
            </h2>

            <p className="text-sm leading-relaxed" style={{ color: "var(--vx-text)" }}>
              {selected.analysis}
            </p>

            <div
              className="text-xs flex items-center gap-1.5"
              style={{ color: "var(--vx-text-faint)" }}
            >
              <span className="truncate">{selected.publisher}</span>
              <span>·</span>
              <span className="shrink-0">{timeAgo(selected.publishedAt)}</span>
            </div>

            <a
              href={selected.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-center transition active:opacity-80"
              style={{ background: "var(--vx-surface-2)", color: "var(--vx-text)", border: "1px solid var(--vx-border)" }}
            >
              Читать оригинал на {selected.publisher} ↗
            </a>

            <p className="text-[11px]" style={{ color: "var(--vx-text-faint)" }}>
              Разбор сгенерирован ИИ (Claude) на основе заголовка новости и не
              является инвестиционной рекомендацией.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
