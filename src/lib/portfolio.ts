export type Holding = {
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: string;
};

// Покупка совершена 16 декабря 2024 года на сумму ~$40,000.
// buyPrice — реальная цена закрытия на 16.12.2024 (проверено по историческим
// данным). currentPrice — ориентировочная котировка, используется как
// запасной вариант до первого ответа live-API.
export const BUY_DATE = "2024-12-16";

export const holdings: Holding[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    shares: 50,
    buyPrice: 131.66,
    currentPrice: 221.49,
    buyDate: BUY_DATE,
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    shares: 53,
    buyPrice: 126.69,
    currentPrice: 570.81,
    buyDate: BUY_DATE,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    shares: 29,
    buyPrice: 232.93,
    currentPrice: 254.18,
    buyDate: BUY_DATE,
  },
  {
    symbol: "HOOD",
    name: "Robinhood Markets, Inc.",
    shares: 154,
    buyPrice: 43.2,
    currentPrice: 101.09,
    buyDate: BUY_DATE,
  },
  {
    symbol: "IONQ",
    name: "IonQ, Inc.",
    shares: 159,
    buyPrice: 41.81,
    currentPrice: 31.42,
    buyDate: BUY_DATE,
  },
  {
    symbol: "RGTI",
    name: "Rigetti Computing, Inc.",
    shares: 791,
    buyPrice: 8.43,
    currentPrice: 11.67,
    buyDate: BUY_DATE,
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

export function portfolioSummary(
  livePrices?: Record<string, number>,
  positionOverrides?: Record<string, PositionOverride>
) {
  const rows = holdings
    .map((h) => {
      const override = positionOverrides?.[h.symbol];
      const merged = {
        ...h,
        ...(override ?? {}),
        ...(livePrices?.[h.symbol] != null
          ? { currentPrice: livePrices[h.symbol] }
          : {}),
      };
      return merged;
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

// Синтетический дневной ряд стоимости портфеля от даты покупки до сегодня.
// Начинается с суммы вложений, заканчивается текущей рыночной стоимостью,
// с правдоподобными колебаниями по пути (не биржевые исторические данные).
// Принимает "сегодня" аргументом, чтобы вычисляться на клиенте (new Date()
// недетерминирован и не подходит для серверного пререндера).
export function portfolioHistory(now: Date): HistoryPoint[] {
  const { totalCost, totalValue } = portfolioSummary();
  const start = new Date(BUY_DATE);
  const end = now;
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86_400_000)
  );

  const rand = mulberry32(20241216);
  const logStart = Math.log(totalCost);
  const logEnd = Math.log(totalValue);

  // Случайное блуждание, "привязанное" к конечной точке (brownian bridge),
  // чтобы траектория была плавной, но заканчивалась точно в totalValue.
  const noise: number[] = [0];
  let acc = 0;
  for (let i = 1; i <= days; i++) {
    acc += (rand() - 0.5) * 0.045;
    noise.push(acc);
  }
  const noiseEnd = noise[days];

  const points: HistoryPoint[] = [];
  for (let i = 0; i <= days; i++) {
    const t = i / days;
    const bridgeNoise = noise[i] - t * noiseEnd;
    const logValue = logStart + (logEnd - logStart) * t + bridgeNoise;
    const date = new Date(start.getTime() + i * 86_400_000);
    points.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(Math.exp(logValue) * 100) / 100,
    });
  }
  // Гарантируем точное совпадение первой и последней точки с реальными цифрами.
  points[0].value = Math.round(totalCost * 100) / 100;
  points[points.length - 1].value = Math.round(totalValue * 100) / 100;
  return points;
}
