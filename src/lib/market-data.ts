import { MarketIndex, StockQuote, NewsItem, SectorPerformance, CurrencyPair, CommodityQuote } from "./types";

// ---- Client-side fetchers that call our API routes ----
// All real data comes from yahoo-finance2 via Next.js API routes.
// We cache in memory to avoid hammering the API on every render tick.

interface Cache<T> {
  data: T | null;
  timestamp: number;
}

const caches: Record<string, Cache<any>> = {};

async function fetchCached<T>(key: string, url: string, ttlMs: number): Promise<T | null> {
  const cached = caches[key];
  if (cached && cached.data && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    caches[key] = { data, timestamp: Date.now() };
    return data;
  } catch (err) {
    console.error(`Fetch ${key} failed:`, err);
    return cached?.data || null;
  }
}

// ---- Indices ----
export async function fetchIndices(): Promise<MarketIndex[]> {
  const quotes = await fetchCached<any[]>("indices", "/api/quotes?type=indices", 15000);
  if (!quotes) return [];
  return quotes.map((q) => ({
    symbol: cleanIndexSymbol(q.symbol),
    name: q.name,
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
  }));
}

function cleanIndexSymbol(sym: string): string {
  const map: Record<string, string> = {
    "^GSPC": "SPX",
    "^DJI": "DJIA",
    "^IXIC": "COMP",
    "^RUT": "RUT",
    "^VIX": "VIX",
    "^FTSE": "FTSE",
    "^GDAXI": "DAX",
    "^N225": "N225",
    "^HSI": "HSI",
    "000001.SS": "SHCOMP",
  };
  return map[sym] || sym;
}

// ---- Stocks ----
export async function fetchStocks(): Promise<StockQuote[]> {
  const quotes = await fetchCached<any[]>("stocks", "/api/quotes?type=stocks", 15000);
  if (!quotes) return [];
  return quotes.map((q) => ({
    symbol: q.symbol,
    name: q.name,
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
    volume: q.volume,
    high: q.high,
    low: q.low,
    open: q.open,
    prevClose: q.prevClose,
    marketCap: q.marketCap,
  }));
}

// ---- Forex ----
export async function fetchCurrencies(): Promise<CurrencyPair[]> {
  const quotes = await fetchCached<any[]>("forex", "/api/quotes?type=forex", 15000);
  if (!quotes) return [];
  return quotes.map((q) => ({
    pair: formatForexPair(q.symbol),
    rate: q.price,
    change: q.change,
  }));
}

function formatForexPair(sym: string): string {
  const map: Record<string, string> = {
    "EURUSD=X": "EUR/USD",
    "GBPUSD=X": "GBP/USD",
    "JPY=X": "USD/JPY",
    "CHF=X": "USD/CHF",
    "AUDUSD=X": "AUD/USD",
    "CADUSD=X": "USD/CAD",
    "CNY=X": "USD/CNY",
    "BTC-USD": "BTC/USD",
    "ETH-USD": "ETH/USD",
  };
  return map[sym] || sym;
}

// ---- Commodities ----
const COMMODITY_NAMES: Record<string, string> = {
  "GC=F": "Gold",
  "SI=F": "Silver",
  "CL=F": "Crude Oil WTI",
  "BZ=F": "Brent Crude",
  "NG=F": "Natural Gas",
  "HG=F": "Copper",
};

export async function fetchCommodities(): Promise<CommodityQuote[]> {
  const quotes = await fetchCached<any[]>("commodities", "/api/quotes?type=commodities", 15000);
  if (!quotes) return [];
  return quotes.map((q) => ({
    name: COMMODITY_NAMES[q.symbol] || q.name,
    symbol: q.symbol.replace("=F", ""),
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
  }));
}

// ---- Sectors ----
export async function fetchSectors(): Promise<SectorPerformance[]> {
  const sectors = await fetchCached<any[]>("sectors", "/api/market-summary?type=sectors", 30000);
  if (!sectors) return [];
  return sectors.map((s) => ({
    sector: s.sector,
    changePercent: s.changePercent,
  }));
}

// ---- News ----
export async function fetchNews(): Promise<NewsItem[]> {
  const news = await fetchCached<any[]>("news", "/api/news", 120000);
  if (!news) return [];
  return news;
}

// ---- Search ----
export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ---- Chart ----
export interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchChart(symbol: string, range: string = "3mo"): Promise<ChartCandle[]> {
  try {
    const res = await fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ---- Quote for single symbol ----
export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const q = data[0];
      return {
        symbol: q.symbol,
        name: q.name,
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
        volume: q.volume,
        high: q.high,
        low: q.low,
        open: q.open,
        prevClose: q.prevClose,
        marketCap: q.marketCap,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        trailingPE: q.trailingPE,
        epsTrailingTwelveMonths: q.epsTrailingTwelveMonths,
        dividendYield: q.dividendYield,
        avgVolume: q.avgVolume,
      };
    }
    return null;
  } catch {
    return null;
  }
}
