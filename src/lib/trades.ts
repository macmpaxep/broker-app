export type ClosedTrade = {
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
  buyDate?: string;
  sellPrice: number;
  sellDate: string;
};

// Закрытые позиции — реализованные сделки, не связанные с текущими
// открытыми холдингами. buyPrice здесь — историческая цена покупки именно
// этой проданной партии акций (может отличаться от текущей средней цены
// по открытой позиции того же тикера).
export const closedTrades: ClosedTrade[] = [
  {
    symbol: "IONQ",
    name: "IonQ, Inc.",
    shares: 1000,
    buyPrice: 7.38,
    buyDate: "2024-09-13",
    sellPrice: 75.12,
    sellDate: "2025-09-23",
  },
  {
    symbol: "RGTI",
    name: "Rigetti Computing, Inc.",
    shares: 7000,
    buyPrice: 0.69,
    buyDate: "2024-09-09",
    sellPrice: 51.18,
    sellDate: "2025-10-13",
  },
  {
    symbol: "PLTR",
    name: "Palantir Technologies Inc.",
    shares: 360,
    buyPrice: 119.81,
    buyDate: "2026-07-01",
    sellPrice: 207.36,
    sellDate: "2026-10-09",
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    shares: 200,
    buyPrice: 89.93,
    buyDate: "2022-11-04",
    sellPrice: 305.94,
    sellDate: "2023-07-14",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    shares: 300,
    buyPrice: 108.1,
    buyDate: "2023-01-03",
    sellPrice: 293.34,
    sellDate: "2023-07-18",
  },
  {
    symbol: "NFLX",
    name: "Netflix, Inc.",
    shares: 800,
    buyPrice: 18.76,
    buyDate: "2022-05-13",
    sellPrice: 35.57,
    sellDate: "2023-10-13",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 250,
    buyPrice: 122.83,
    buyDate: "2023-01-05",
    sellPrice: 257.15,
    sellDate: "2024-12-26",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 100,
    buyPrice: 215.75,
    buyDate: "2023-01-05",
    sellPrice: 459.46,
    sellDate: "2024-07-05",
  },
];

// Комиссия брокера: 0.5% от суммы сделки + $0.012 за акцию + $1.2 за приказ.
// Считается отдельно для ордера на покупку и на продажу (это два разных
// приказа), итоговая комиссия по закрытой позиции — их сумма.
const COMMISSION_RATE = 0.005;
const COMMISSION_PER_SHARE = 0.012;
const COMMISSION_PER_ORDER = 1.2;

function orderCommission(shares: number, price: number) {
  return shares * price * COMMISSION_RATE + shares * COMMISSION_PER_SHARE + COMMISSION_PER_ORDER;
}

export function withClosedMetrics(t: ClosedTrade) {
  const costBasis = t.shares * t.buyPrice;
  const proceeds = t.shares * t.sellPrice;
  const profit = proceeds - costBasis;
  const profitPct = (profit / costBasis) * 100;

  const buyCommission = orderCommission(t.shares, t.buyPrice);
  const sellCommission = orderCommission(t.shares, t.sellPrice);
  const commission = buyCommission + sellCommission;
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
