// Общий список акций для раздела "Котировки" — рыночные данные (цена,
// логотип, дневное изменение) показываются по всем тикерам независимо от
// того, есть ли они в демо-портфеле. currentPrice — грубый ориентир,
// используется только как кратковременный fallback до первого ответа
// live-API (Finnhub), который почти сразу его перекрывает.
export type WatchlistEntry = { symbol: string; name: string; currentPrice: number };

export const WATCHLIST: WatchlistEntry[] = [
  { symbol: "NVDA", name: "NVIDIA Corporation", currentPrice: 221.49 },
  { symbol: "AMD", name: "Advanced Micro Devices", currentPrice: 570.81 },
  { symbol: "AMZN", name: "Amazon.com, Inc.", currentPrice: 254.18 },
  { symbol: "HOOD", name: "Robinhood Markets, Inc.", currentPrice: 101.09 },
  { symbol: "IONQ", name: "IonQ, Inc.", currentPrice: 31.42 },
  { symbol: "RGTI", name: "Rigetti Computing, Inc.", currentPrice: 11.67 },
  { symbol: "AAPL", name: "Apple Inc.", currentPrice: 255 },
  { symbol: "MSFT", name: "Microsoft Corporation", currentPrice: 430 },
  { symbol: "GOOGL", name: "Alphabet Inc.", currentPrice: 195 },
  { symbol: "META", name: "Meta Platforms, Inc.", currentPrice: 620 },
  { symbol: "TSLA", name: "Tesla, Inc.", currentPrice: 260 },
  { symbol: "NFLX", name: "Netflix, Inc.", currentPrice: 950 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", currentPrice: 240 },
  { symbol: "V", name: "Visa Inc.", currentPrice: 310 },
  { symbol: "MA", name: "Mastercard Incorporated", currentPrice: 490 },
  { symbol: "DIS", name: "The Walt Disney Company", currentPrice: 110 },
  { symbol: "KO", name: "The Coca-Cola Company", currentPrice: 68 },
  { symbol: "PEP", name: "PepsiCo, Inc.", currentPrice: 150 },
  { symbol: "WMT", name: "Walmart Inc.", currentPrice: 95 },
  { symbol: "INTC", name: "Intel Corporation", currentPrice: 35 },
];
