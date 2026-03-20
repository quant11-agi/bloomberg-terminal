export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  epsTrailingTwelveMonths?: number;
  dividendYield?: number;
  avgVolume?: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  datetime: number;
  summary: string;
  url: string;
  category: string;
  image?: string | null;
}

export interface SectorPerformance {
  sector: string;
  changePercent: number;
}

export interface CurrencyPair {
  pair: string;
  rate: number;
  change: number;
}

export interface CommodityQuote {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}
