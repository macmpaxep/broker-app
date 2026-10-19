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

export function withClosedMetrics(t: ClosedTrade) {
  const costBasis = t.shares * t.buyPrice;
  const proceeds = t.shares * t.sellPrice;
  const profit = proceeds - costBasis;
  const profitPct = (profit / costBasis) * 100;
  return { ...t, costBasis, proceeds, profit, profitPct };
}
