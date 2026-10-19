export type ClosedTrade = {
  symbol: string;
  name: string;
  shares: number;
  buyPrice: number;
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
    sellPrice: 75.12,
    sellDate: "2025-09-23",
  },
  {
    symbol: "RGTI",
    name: "Rigetti Computing, Inc.",
    shares: 7000,
    buyPrice: 0.69,
    sellPrice: 51.18,
    sellDate: "2025-10-13",
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
