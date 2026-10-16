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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
          return;
        }
        setIdeas(json.ideas ?? []);
      })
      .catch((err) => !cancelled && setError(String(err)));
    return () => {
      cancelled = true;
    };
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
        {Array.from({ length: 4 }).map((_, i) => (
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
    <div className="flex flex-col gap-3">
      {ideas.map((idea) => (
        <a
          key={idea.uuid}
          href={idea.link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-3xl p-4 flex gap-3 transition active:opacity-80"
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
        </a>
      ))}
    </div>
  );
}
