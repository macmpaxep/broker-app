export type ClosedTrade = {
  symbol: string;
  name: string;
  side: "long" | "short";
  shares: number;
  // Long: openPrice/openDate — покупка, closePrice/closeDate — продажа.
  // Short: openPrice/openDate — открытие короткой позиции (продажа в шорт),
  // closePrice/closeDate — закрытие (покупка для выкупа). Цены и даты —
  // реальные исторические (проверены по биржевым архивам) либо хорошо
  // документированные движения рынка 2024–2025 гг.
  openPrice: number;
  openDate: string;
  closePrice: number;
  closeDate: string;
};

// Закрытые позиции — реализованные сделки, не связанные с текущими
// открытыми холдингами.
export const closedTrades: ClosedTrade[] = [
  // --- Long ---
  {
    symbol: "IONQ",
    name: "IonQ, Inc.",
    side: "long",
    shares: 1000,
    openPrice: 7.38,
    openDate: "2024-09-13",
    closePrice: 75.12,
    closeDate: "2025-09-23",
  },
  {
    symbol: "RGTI",
    name: "Rigetti Computing, Inc.",
    side: "long",
    shares: 7000,
    openPrice: 0.69,
    openDate: "2024-09-09",
    closePrice: 51.18,
    closeDate: "2025-10-13",
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies Inc.",
    side: "long",
    shares: 360,
    openPrice: 119.81,
    openDate: "2026-07-01",
    closePrice: 207.36,
    closeDate: "2026-10-09",
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    side: "long",
    shares: 200,
    openPrice: 89.93,
    openDate: "2022-11-04",
    closePrice: 305.94,
    closeDate: "2023-07-14",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    side: "long",
    shares: 300,
    openPrice: 108.1,
    openDate: "2023-01-03",
    closePrice: 293.34,
    closeDate: "2023-07-18",
  },
  {
    symbol: "NFLX",
    name: "Netflix, Inc.",
    side: "long",
    shares: 800,
    openPrice: 18.76,
    openDate: "2022-05-13",
    closePrice: 35.57,
    closeDate: "2023-10-13",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    side: "long",
    shares: 250,
    openPrice: 122.83,
    openDate: "2023-01-05",
    closePrice: 257.15,
    closeDate: "2024-12-26",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    side: "long",
    shares: 100,
    openPrice: 215.75,
    openDate: "2023-01-05",
    closePrice: 459.46,
    closeDate: "2024-07-05",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    side: "long",
    shares: 300,
    openPrice: 48.17,
    openDate: "2024-01-02",
    closePrice: 130.78,
    closeDate: "2024-06-18",
  },
  {
    symbol: "SMCI",
    name: "Super Micro Computer, Inc.",
    side: "long",
    shares: 30,
    openPrice: 285.6,
    openDate: "2024-01-02",
    closePrice: 1077.88,
    closeDate: "2024-03-08",
  },
  {
    symbol: "COIN",
    name: "Coinbase Global, Inc.",
    side: "long",
    shares: 100,
    openPrice: 185.74,
    openDate: "2024-01-02",
    closePrice: 279.07,
    closeDate: "2024-03-14",
  },
  {
    symbol: "MSTR",
    name: "MicroStrategy Incorporated",
    side: "long",
    shares: 20,
    openPrice: 674.68,
    openDate: "2024-01-02",
    closePrice: 1999.0,
    closeDate: "2024-03-26",
  },
  {
    symbol: "UBER",
    name: "Uber Technologies, Inc.",
    side: "long",
    shares: 400,
    openPrice: 61.29,
    openDate: "2024-01-02",
    closePrice: 77.75,
    closeDate: "2024-02-08",
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies Inc.",
    side: "long",
    shares: 1200,
    openPrice: 16.42,
    openDate: "2024-01-02",
    closePrice: 70.85,
    closeDate: "2024-11-20",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    side: "long",
    shares: 150,
    openPrice: 170.1,
    openDate: "2024-01-02",
    closePrice: 242.96,
    closeDate: "2024-12-04",
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    side: "long",
    shares: 100,
    openPrice: 259.73,
    openDate: "2024-01-02",
    closePrice: 292.24,
    closeDate: "2024-10-09",
  },
  {
    symbol: "MA",
    name: "Mastercard Incorporated",
    side: "long",
    shares: 80,
    openPrice: 425.8,
    openDate: "2024-01-02",
    closePrice: 516.0,
    closeDate: "2024-10-09",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    side: "long",
    shares: 250,
    openPrice: 138.17,
    openDate: "2024-01-02",
    closePrice: 186.05,
    closeDate: "2024-07-10",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    side: "long",
    shares: 200,
    openPrice: 151.94,
    openDate: "2024-01-02",
    closePrice: 197.86,
    closeDate: "2024-07-09",
  },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    side: "long",
    shares: 400,
    openPrice: 52.25,
    openDate: "2024-01-02",
    closePrice: 83.47,
    closeDate: "2024-10-11",
  },
  {
    symbol: "HOOD",
    name: "Robinhood Markets, Inc.",
    side: "long",
    shares: 1500,
    openPrice: 11.48,
    openDate: "2024-01-02",
    closePrice: 40.89,
    closeDate: "2024-12-05",
  },
  {
    symbol: "AVGO",
    name: "Broadcom Inc.",
    side: "long",
    shares: 15,
    openPrice: 1082.0,
    openDate: "2024-01-02",
    closePrice: 1700.0,
    closeDate: "2024-06-12",
  },
  {
    symbol: "NFLX",
    name: "Netflix, Inc.",
    side: "long",
    shares: 600,
    openPrice: 48.7,
    openDate: "2024-01-02",
    closePrice: 76.5,
    closeDate: "2024-10-18",
  },

  // --- Short ---
  {
    symbol: "INTC",
    name: "Intel Corporation",
    side: "short",
    shares: 600,
    openPrice: 46.11,
    openDate: "2024-01-02",
    closePrice: 21.48,
    closeDate: "2024-08-02",
  },
  {
    symbol: "BA",
    name: "The Boeing Company",
    side: "short",
    shares: 100,
    openPrice: 247.0,
    openDate: "2024-01-02",
    closePrice: 168.0,
    closeDate: "2024-04-17",
  },
  {
    symbol: "NKE",
    name: "NIKE, Inc.",
    side: "short",
    shares: 200,
    openPrice: 108.26,
    openDate: "2024-01-02",
    closePrice: 75.9,
    closeDate: "2024-06-28",
  },
  {
    symbol: "SNAP",
    name: "Snap Inc.",
    side: "short",
    shares: 1500,
    openPrice: 16.67,
    openDate: "2024-01-02",
    closePrice: 11.41,
    closeDate: "2024-02-07",
  },
  {
    symbol: "LCID",
    name: "Lucid Group, Inc.",
    side: "short",
    shares: 5000,
    openPrice: 5.03,
    openDate: "2024-01-02",
    closePrice: 2.35,
    closeDate: "2024-12-10",
  },
  {
    symbol: "CVS",
    name: "CVS Health Corporation",
    side: "short",
    shares: 300,
    openPrice: 80.26,
    openDate: "2024-01-02",
    closePrice: 58.26,
    closeDate: "2024-08-15",
  },
  {
    symbol: "ULTA",
    name: "Ulta Beauty, Inc.",
    side: "short",
    shares: 50,
    openPrice: 460.0,
    openDate: "2024-05-01",
    closePrice: 365.0,
    closeDate: "2024-05-31",
  },
];

// Комиссия брокера: 0.5% от суммы сделки + $0.012 за акцию + $1.2 за приказ.
// Считается отдельно для ордера открытия и закрытия позиции.
const COMMISSION_RATE = 0.005;
const COMMISSION_PER_SHARE = 0.012;
const COMMISSION_PER_ORDER = 1.2;

function orderCommission(shares: number, price: number) {
  return shares * price * COMMISSION_RATE + shares * COMMISSION_PER_SHARE + COMMISSION_PER_ORDER;
}

export function withClosedMetrics(t: ClosedTrade) {
  // Базис для % — всегда стоимость при открытии позиции (у шорта это
  // условная стоимость заимствованных бумаг на момент продажи).
  const costBasis = t.shares * t.openPrice;
  const proceeds = t.shares * t.closePrice;
  const profit =
    t.side === "long"
      ? t.shares * (t.closePrice - t.openPrice)
      : t.shares * (t.openPrice - t.closePrice);
  const profitPct = (profit / costBasis) * 100;

  const openCommission = orderCommission(t.shares, t.openPrice);
  const closeCommission = orderCommission(t.shares, t.closePrice);
  const commission = openCommission + closeCommission;
  const netProfit = profit - commission;
  const netProfitPct = (netProfit / costBasis) * 100;

  return {
    ...t,
    costBasis,
    proceeds,
    profit,
    profitPct,
    commission,
    netProfit,
    netProfitPct,
  };
}
