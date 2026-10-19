import { WATCHLIST } from "./watchlist";

export type Holding = {
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: string;
};

// Покупки совершены в разные даты между 15.07.2024 и 09.09.2024 на сумму
// ~$40,000 суммарно. buyPrice — реальная цена закрытия в день покупки
// (проверено по историческим данным). currentPrice — ориентировочная
// котировка, используется как запасной вариант до первого ответа live-API.
// BUY_DATE — самая ранняя дата покупки в портфеле (для общего графика роста).
export const BUY_DATE = "2024-07-15";

export const holdings: Holding[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    shares: 52,
    buyPrice: 128.09,
    currentPrice: 221.49,
    buyDate: "2024-07-15",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    shares: 48,
    buyPrice: 138.32,
    currentPrice: 570.81,
    buyDate: "2024-07-25",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    shares: 41,
    buyPrice: 161.02,
    currentPrice: 254.18,
    buyDate: "2024-08-05",
  },
  {
    symbol: "HOOD",
    name: "Robinhood Markets, Inc.",
    shares: 341,
    buyPrice: 19.55,
    currentPrice: 101.09,
    buyDate: "2024-08-15",
  },
];

export function withMetrics(h: Holding) {
  const costBasis = h.shares * h.buyPrice;
  const marketValue = h.shares * h.currentPrice;
  const pnl = marketValue - costBasis;
  const pnlPct = (pnl / costBasis) * 100;
  return { ...h, costBasis, marketValue, pnl, pnlPct };
}

export type PositionOverride = { shares: number; buyPrice: number };

// Позиции не ограничены исходными 6 акциями — демо позволяет купить любой
// тикер из общего списка (см. WATCHLIST), поэтому строки портфеля строятся
// по объединению исходных holdings и всех ключей positionOverrides.
export function portfolioSummary(
  livePrices?: Record<string, number>,
  positionOverrides?: Record<string, PositionOverride>
) {
  const symbols = new Set<string>(holdings.map((h) => h.symbol));
  if (positionOverrides) {
    for (const symbol of Object.keys(positionOverrides)) symbols.add(symbol);
  }

  const rows = Array.from(symbols)
    .map((symbol) => {
      const base = holdings.find((h) => h.symbol === symbol);
      const meta = WATCHLIST.find((w) => w.symbol === symbol);
      const override = positionOverrides?.[symbol];

      const shares = override?.shares ?? base?.shares ?? 0;
      const buyPrice = override?.buyPrice ?? base?.buyPrice ?? meta?.currentPrice ?? 0;
      const currentPrice =
        livePrices?.[symbol] ?? base?.currentPrice ?? meta?.currentPrice ?? buyPrice;

      const h: Holding = {
        symbol,
        name: base?.name ?? meta?.name ?? symbol,
        shares,
        buyPrice,
        currentPrice,
        buyDate: base?.buyDate ?? BUY_DATE,
      };
      return h;
    })
    .filter((h) => h.shares > 0)
    .map(withMetrics);
  const totalCost = rows.reduce((s, r) => s + r.costBasis, 0);
  const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  return { rows, totalCost, totalValue, totalPnl, totalPnlPct };
}

export type HistoryPoint = { date: string; value: number };

// Детерминированный псевдослучайный генератор (для стабильного SSR/CSR рендера).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  }
  return h;
}

// Универсальный "мост" из startValue в endValue за `steps` шагов с
// правдоподобным случайным шумом (детерминирован по seed — одинаковый
// результат на сервере и клиенте для одного и того же тикера/таймфрейма).
export function bridgeSeries(
  seed: string,
  startValue: number,
  endValue: number,
  steps: number,
  amplitude = 0.04
): number[] {
  const rand = mulberry32(hashString(seed));
  const logStart = Math.log(Math.max(startValue, 0.01));
  const logEnd = Math.log(Math.max(endValue, 0.01));

  const noise: number[] = [0];
  let acc = 0;
  for (let i = 1; i <= steps; i++) {
    acc += (rand() - 0.5) * amplitude;
    noise.push(acc);
  }
  const noiseEnd = noise[steps];

  const values: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bridgeNoise = noise[i] - t * noiseEnd;
    const logValue = logStart + (logEnd - logStart) * t + bridgeNoise;
    values.push(Math.exp(logValue));
  }
  values[0] = startValue;
  values[values.length - 1] = endValue;
  return values;
}

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "ALL";

export const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: "1D", label: "1Д" },
  { key: "1W", label: "1Н" },
  { key: "1M", label: "1М" },
  { key: "3M", label: "3М" },
  { key: "6M", label: "6М" },
  { key: "ALL", label: "Всё" },
];

const SHORT_TF_CONFIG: Record<
  Exclude<Timeframe, "ALL">,
  { steps: number; amplitude: number; startFactor: number; hourly?: boolean }
> = {
  "1D": { steps: 48, amplitude: 0.012, startFactor: 1, hourly: true },
  "1W": { steps: 56, amplitude: 0.018, startFactor: 0.96 },
  "1M": { steps: 60, amplitude: 0.03, startFactor: 0.9 },
  "3M": { steps: 90, amplitude: 0.045, startFactor: 0.82 },
  "6M": { steps: 120, amplitude: 0.055, startFactor: 0.72 },
};

// Генерирует ряд значений для заданного таймфрейма: для коротких окон —
// смоделированная правдоподобная траектория к endValue (нет доступа к
// историческим внутридневным свечам на бесплатном тарифе API), для "ALL" —
// реальная точка отсчёта (allStart/allStartValue) с тем же методом.
function seriesForTimeframe(
  seedKey: string,
  timeframe: Timeframe,
  params: {
    endValue: number;
    prevValue: number | null;
    allStartValue: number;
    allStartDate: string;
  },
  now: Date
): HistoryPoint[] {
  const { endValue, prevValue, allStartValue, allStartDate } = params;

  if (timeframe === "ALL") {
    const start = new Date(allStartDate);
    const days = Math.max(
      1,
      Math.round((now.getTime() - start.getTime()) / 86_400_000)
    );
    const values = bridgeSeries(
      `${seedKey}:ALL`,
      allStartValue,
      endValue,
      days,
      0.045
    );
    return values.map((value, i) => {
      const date = new Date(start.getTime() + i * 86_400_000);
      return { date: date.toISOString().slice(0, 10), value };
    });
  }

  const { steps, amplitude, startFactor, hourly } = SHORT_TF_CONFIG[timeframe];
  const startValue =
    timeframe === "1D" ? (prevValue ?? endValue * 0.995) : endValue * startFactor;
  const values = bridgeSeries(
    `${seedKey}:${timeframe}`,
    startValue,
    endValue,
    steps,
    amplitude
  );

  const stepMs = hourly ? (6.5 * 3600_000) / steps : 86_400_000;
  const spanStart = now.getTime() - stepMs * steps;

  return values.map((value, i) => ({
    date: new Date(spanStart + i * stepMs).toISOString(),
    value,
  }));
}

// График отдельной акции для заданного таймфрейма. Для "ALL" точка отсчёта —
// реальная цена покупки этой акции.
export function stockHistory(
  symbol: string,
  timeframe: Timeframe,
  params: {
    buyPrice: number;
    buyDate: string;
    currentPrice: number;
    prevClose: number | null;
  },
  now: Date
): HistoryPoint[] {
  return seriesForTimeframe(
    symbol,
    timeframe,
    {
      endValue: params.currentPrice,
      prevValue: params.prevClose,
      allStartValue: params.buyPrice,
      allStartDate: params.buyDate,
    },
    now
  );
}

// График стоимости всего портфеля для заданного таймфрейма. Для "ALL" —
// реальная суммарная стоимость вложений (totalCost) на дату самой ранней
// покупки в портфеле.
export function portfolioHistoryTF(
  timeframe: Timeframe,
  totalValue: number,
  totalCost: number,
  now: Date
): HistoryPoint[] {
  return seriesForTimeframe(
    "PORTFOLIO",
    timeframe,
    {
      endValue: totalValue,
      prevValue: null,
      allStartValue: totalCost,
      allStartDate: BUY_DATE,
    },
    now
  );
}
