"use client";

import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/yahooNews";

function timeAgo(unixSeconds: number) {
  const diffMs = Date.now() - unixSeconds * 1000;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error || !json.news?.length) {
          setError(json.error ?? "Нет новостей");
          return;
        }
        setNews(json.news);
      })
      .catch((err) => !cancelled && setError(String(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error && !news) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2
        className="text-xs font-semibold tracking-[0.1em] uppercase px-1"
        style={{ color: "var(--vx-text-faint)" }}
      >
        Новости рынка
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
        {!news &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-64 h-32 rounded-2xl animate-pulse snap-start"
              style={{ background: "var(--vx-surface-2)" }}
            />
          ))}
        {news?.map((item) => (
          <button
            key={item.uuid}
            onClick={() => setSelected(item)}
            className="shrink-0 w-64 rounded-2xl overflow-hidden flex flex-col text-left snap-start transition active:opacity-80"
            style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
          >
            {item.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnail}
                alt=""
                className="w-full h-28 object-cover"
              />
            ) : (
              <div
                className="w-full h-28 flex items-center justify-center"
                style={{ background: "var(--vx-surface-2)" }}
              >
                <span className="text-2xl">📰</span>
              </div>
            )}
            <div className="p-3 flex flex-col gap-1.5">
              <p className="text-sm font-medium leading-snug line-clamp-2">
                {item.title}
              </p>
              <div
                className="text-[11px] flex items-center justify-between"
                style={{ color: "var(--vx-text-faint)" }}
              >
                <span className="truncate">{item.publisher}</span>
                <span className="shrink-0 ml-2">{timeAgo(item.publishedAt)}</span>
              </div>
            </div>
          </button>
        ))}
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
                style={{ background: "var(--vx-surface-2)", color: "var(--vx-text-faint)" }}
              >
                Новость
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
              {selected.title}
            </h2>

            <div
              className="text-xs flex items-center gap-1.5"
              style={{ color: "var(--vx-text-faint)" }}
            >
              <span className="truncate">{selected.publisher}</span>
              <span>·</span>
              <span className="shrink-0">{timeAgo(selected.publishedAt)}</span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "var(--vx-text-dim)" }}>
              Полный текст статьи доступен на сайте издателя — публичная лента
              Yahoo Finance отдаёт только заголовок и превью, без текста
              статьи.
            </p>

            <a
              href={selected.link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-center transition active:opacity-80"
              style={{ background: "var(--vx-surface-2)", color: "var(--vx-text)", border: "1px solid var(--vx-border)" }}
            >
              Читать на {selected.publisher} ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
