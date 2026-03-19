export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  prevPrice?: number;
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
  prevPrice?: number;
  sharesOutstanding?: number;
  pe?: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  datetime: number;
  summary: string;
  url: string;
  category: string;
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
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
