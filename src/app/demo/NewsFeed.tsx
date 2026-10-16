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
          <a
            key={item.uuid}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-64 rounded-2xl overflow-hidden flex flex-col snap-start transition active:opacity-80"
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
          </a>
        ))}
      </div>
    </div>
  );
}
