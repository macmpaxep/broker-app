"use client";

import { useEffect, useState } from "react";
import { TIMEFRAMES, type Timeframe } from "@/lib/portfolio";
import type { CustomRange } from "./useHistory";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtRangeLabel(range: CustomRange) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

export default function PeriodPicker({
  timeframe,
  customRange,
  onTimeframeChange,
  onCustomRangeChange,
}: {
  timeframe: Timeframe;
  customRange: CustomRange | null;
  onTimeframeChange: (tf: Timeframe) => void;
  onCustomRangeChange: (range: CustomRange | null) => void;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(customRange?.from ?? "");
  const [draftTo, setDraftTo] = useState(customRange?.to ?? "");
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = todayStr();
    setToday(t);
    setDraftTo((prev) => prev || customRange?.to || t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openPanel() {
    setDraftFrom(customRange?.from ?? "");
    setDraftTo(customRange?.to ?? todayStr());
    setPanelOpen(true);
  }

  function apply() {
    if (!draftFrom || !draftTo || draftFrom > draftTo) return;
    onCustomRangeChange({ from: draftFrom, to: draftTo });
    setPanelOpen(false);
  }

  function pickPreset(tf: Timeframe) {
    onCustomRangeChange(null);
    onTimeframeChange(tf);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.key}
            onClick={() => pickPreset(tf.key)}
            className="flex-1 rounded-full py-1.5 text-xs font-semibold transition"
            style={
              !customRange && timeframe === tf.key
                ? { background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }
                : { color: "var(--vx-text-faint)" }
            }
          >
            {tf.label}
          </button>
        ))}
        <button
          onClick={openPanel}
          aria-label="Выбрать период по датам"
          className="shrink-0 rounded-full w-9 flex items-center justify-center transition"
          style={
            customRange
              ? { background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }
              : { color: "var(--vx-text-faint)", border: "1px solid var(--vx-border)" }
          }
        >
          📅
        </button>
      </div>

      {customRange && (
        <button
          onClick={openPanel}
          className="self-start text-xs font-medium px-2.5 py-1 rounded-full transition"
          style={{ background: "var(--vx-surface-2)", color: "var(--vx-violet)" }}
        >
          {fmtRangeLabel(customRange)} ✕ изменить
        </button>
      )}

      {panelOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setPanelOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 flex flex-col gap-4"
            style={{ background: "var(--vx-surface)", border: "1px solid var(--vx-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Свой период</h3>
              <button
                onClick={() => setPanelOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--vx-surface-2)" }}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                  С
                </label>
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo || today || undefined}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm vx-num"
                  style={{
                    background: "var(--vx-surface-2)",
                    border: "1px solid var(--vx-border)",
                    color: "var(--vx-text)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "var(--vx-text-faint)" }}>
                  По
                </label>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom}
                  max={today || undefined}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm vx-num"
                  style={{
                    background: "var(--vx-surface-2)",
                    border: "1px solid var(--vx-border)",
                    color: "var(--vx-text)",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {TIMEFRAMES.filter((tf) => tf.key !== "1D").map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => {
                    onCustomRangeChange(null);
                    onTimeframeChange(tf.key);
                    setPanelOpen(false);
                  }}
                  className="flex-1 rounded-full py-1.5 text-xs font-medium transition"
                  style={{
                    background: "var(--vx-surface-2)",
                    color: "var(--vx-text-faint)",
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <button
              onClick={apply}
              disabled={!draftFrom || !draftTo || draftFrom > draftTo}
              className="rounded-full py-2.5 text-sm font-semibold transition disabled:opacity-40"
              style={{ background: "var(--vx-brand)", color: "var(--vx-brand-ink)" }}
            >
              Показать
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
