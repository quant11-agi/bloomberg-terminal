import {
  MarketIndex,
  StockQuote,
  NewsItem,
  SectorPerformance,
  CurrencyPair,
  CommodityQuote,
  CandleData,
} from "./types";

// Finnhub API - free tier: 60 calls/min
// Users can set their own key; we use a demo key for initial setup
const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY || "demo";
const FINNHUB_BASE = "https://finnhub.io/api/v1";

async function finnhub(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${FINNHUB_BASE}${endpoint}`);
  url.searchParams.set("token", FINNHUB_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Finnhub ${endpoint}: ${res.status}`);
  return res.json();
}

// ---- Simulated real-time data engine ----
// Because free APIs have rate limits, we seed with realistic base data
// and simulate live ticks for a rich real-time experience.

const BASE_INDICES: MarketIndex[] = [
  { symbol: "SPX", name: "S&P 500", price: 5998.74, change: 18.26, changePercent: 0.31 },
  { symbol: "DJIA", name: "Dow Jones", price: 43789.52, change: -102.35, changePercent: -0.23 },
  { symbol: "COMP", name: "NASDAQ", price: 19432.87, change: 95.43, changePercent: 0.49 },
  { symbol: "RUT", name: "Russell 2000", price: 2087.34, change: 12.56, changePercent: 0.61 },
  { symbol: "VIX", name: "CBOE VIX", price: 14.82, change: -0.73, changePercent: -4.69 },
  { symbol: "FTSE", name: "FTSE 100", price: 8412.56, change: 34.21, changePercent: 0.41 },
  { symbol: "DAX", name: "DAX", price: 19876.43, change: -45.67, changePercent: -0.23 },
  { symbol: "N225", name: "Nikkei 225", price: 39234.56, change: 187.34, changePercent: 0.48 },
  { symbol: "HSI", name: "Hang Seng", price: 20145.67, change: -234.56, changePercent: -1.15 },
  { symbol: "SHCOMP", name: "Shanghai", price: 3178.45, change: 12.34, changePercent: 0.39 },
];

const BASE_STOCKS: StockQuote[] = [
  { symbol: "AAPL", name: "Apple Inc", price: 237.45, change: 3.21, changePercent: 1.37, volume: 54230000, high: 238.90, low: 234.10, open: 235.00 },
  { symbol: "MSFT", name: "Microsoft Corp", price: 452.18, change: -2.45, changePercent: -0.54, volume: 23450000, high: 455.30, low: 450.20, open: 454.00 },
  { symbol: "GOOGL", name: "Alphabet Inc", price: 178.92, change: 1.56, changePercent: 0.88, volume: 18760000, high: 179.80, low: 176.50, open: 177.00 },
  { symbol: "AMZN", name: "Amazon.com", price: 214.67, change: 4.32, changePercent: 2.06, volume: 42310000, high: 215.40, low: 210.10, open: 211.00 },
  { symbol: "NVDA", name: "NVIDIA Corp", price: 142.56, change: 5.78, changePercent: 4.23, volume: 312450000, high: 143.90, low: 136.20, open: 137.50 },
  { symbol: "META", name: "Meta Platforms", price: 612.34, change: -8.12, changePercent: -1.31, volume: 15670000, high: 620.50, low: 608.90, open: 619.00 },
  { symbol: "TSLA", name: "Tesla Inc", price: 342.89, change: 12.45, changePercent: 3.77, volume: 87650000, high: 345.20, low: 328.50, open: 330.00 },
  { symbol: "BRK.B", name: "Berkshire B", price: 478.23, change: 1.89, changePercent: 0.40, volume: 3240000, high: 479.50, low: 475.60, open: 476.00 },
  { symbol: "JPM", name: "JPMorgan Chase", price: 234.56, change: -1.23, changePercent: -0.52, volume: 8970000, high: 236.40, low: 233.10, open: 235.50 },
  { symbol: "V", name: "Visa Inc", price: 298.45, change: 2.34, changePercent: 0.79, volume: 5430000, high: 299.80, low: 295.60, open: 296.00 },
  { symbol: "UNH", name: "UnitedHealth", price: 534.12, change: -4.56, changePercent: -0.85, volume: 4120000, high: 539.80, low: 532.50, open: 538.00 },
  { symbol: "XOM", name: "Exxon Mobil", price: 108.34, change: 0.67, changePercent: 0.62, volume: 12340000, high: 109.20, low: 107.50, open: 107.80 },
  { symbol: "LLY", name: "Eli Lilly", price: 812.45, change: 15.67, changePercent: 1.97, volume: 6780000, high: 815.30, low: 795.40, open: 798.00 },
  { symbol: "AVGO", name: "Broadcom", price: 187.23, change: 3.45, changePercent: 1.88, volume: 24560000, high: 188.50, low: 183.20, open: 184.00 },
  { symbol: "WMT", name: "Walmart", price: 92.34, change: 0.45, changePercent: 0.49, volume: 7890000, high: 92.80, low: 91.50, open: 91.90 },
];

const BASE_CURRENCIES: CurrencyPair[] = [
  { pair: "EUR/USD", rate: 1.0867, change: 0.0023 },
  { pair: "GBP/USD", rate: 1.2734, change: -0.0015 },
  { pair: "USD/JPY", rate: 149.82, change: 0.45 },
  { pair: "USD/CHF", rate: 0.8834, change: -0.0012 },
  { pair: "AUD/USD", rate: 0.6534, change: 0.0034 },
  { pair: "USD/CAD", rate: 1.3612, change: 0.0018 },
  { pair: "USD/CNY", rate: 7.2456, change: -0.0089 },
  { pair: "BTC/USD", rate: 104234.56, change: 1234.56 },
];

const BASE_COMMODITIES: CommodityQuote[] = [
  { name: "Gold", symbol: "XAU", price: 2678.45, change: 12.34, changePercent: 0.46 },
  { name: "Silver", symbol: "XAG", price: 31.23, change: -0.34, changePercent: -1.08 },
  { name: "Crude Oil WTI", symbol: "CL", price: 71.45, change: 0.89, changePercent: 1.26 },
  { name: "Brent Crude", symbol: "BZ", price: 75.67, change: 0.56, changePercent: 0.75 },
  { name: "Natural Gas", symbol: "NG", price: 3.45, change: -0.12, changePercent: -3.36 },
  { name: "Copper", symbol: "HG", price: 4.12, change: 0.05, changePercent: 1.23 },
];

const BASE_SECTORS: SectorPerformance[] = [
  { sector: "Technology", changePercent: 1.24 },
  { sector: "Healthcare", changePercent: 0.87 },
  { sector: "Financials", changePercent: -0.34 },
  { sector: "Energy", changePercent: 0.56 },
  { sector: "Consumer Disc.", changePercent: 1.67 },
  { sector: "Industrials", changePercent: 0.23 },
  { sector: "Communication", changePercent: -0.12 },
  { sector: "Real Estate", changePercent: -0.89 },
  { sector: "Utilities", changePercent: 0.34 },
  { sector: "Materials", changePercent: 0.45 },
  { sector: "Consumer Staples", changePercent: -0.15 },
];

function jitter(value: number, maxPct: number = 0.002): number {
  const pct = (Math.random() - 0.5) * 2 * maxPct;
  return +(value * (1 + pct)).toFixed(value > 100 ? 2 : value > 10 ? 2 : 4);
}

export function getIndices(): MarketIndex[] {
  return BASE_INDICES.map((idx) => {
    const price = jitter(idx.price);
    const change = +(price - (idx.price - idx.change)).toFixed(2);
    const changePercent = +((change / (price - change)) * 100).toFixed(2);
    return { ...idx, price, change, changePercent };
  });
}

export function getStocks(): StockQuote[] {
  return BASE_STOCKS.map((s) => {
    const price = jitter(s.price);
    const change = +(price - s.open).toFixed(2);
    const changePercent = +((change / s.open) * 100).toFixed(2);
    return {
      ...s,
      price,
      change,
      changePercent,
      high: Math.max(s.high, price),
      low: Math.min(s.low, price),
      volume: s.volume + Math.floor(Math.random() * 100000),
    };
  });
}

export function getCurrencies(): CurrencyPair[] {
  return BASE_CURRENCIES.map((c) => ({
    ...c,
    rate: jitter(c.rate, 0.001),
    change: +(c.change + (Math.random() - 0.5) * 0.001).toFixed(4),
  }));
}

export function getCommodities(): CommodityQuote[] {
  return BASE_COMMODITIES.map((c) => {
    const price = jitter(c.price);
    const change = +(c.change + (Math.random() - 0.5) * 0.5).toFixed(2);
    const changePercent = +((change / (price - change)) * 100).toFixed(2);
    return { ...c, price, change, changePercent };
  });
}

export function getSectors(): SectorPerformance[] {
  return BASE_SECTORS.map((s) => ({
    ...s,
    changePercent: +(s.changePercent + (Math.random() - 0.5) * 0.1).toFixed(2),
  }));
}

export function generateCandles(symbol: string, days: number = 90): CandleData[] {
  const candles: CandleData[] = [];
  const stock = BASE_STOCKS.find((s) => s.symbol === symbol) || BASE_STOCKS[0];
  let price = stock.price * 0.85;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = price * 0.02;
    const open = price;
    const close = open + (Math.random() - 0.45) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({
      time: date.toISOString().split("T")[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
    price = close;
  }
  return candles;
}

// --- Live news from Finnhub (falls back to simulated) ---
const SIMULATED_NEWS: NewsItem[] = [
  { id: "1", headline: "Fed Signals Potential Rate Cut in Coming Months Amid Cooling Inflation", source: "Reuters", datetime: Date.now() - 120000, summary: "Federal Reserve officials indicated they may begin cutting interest rates as inflation continues to moderate toward the 2% target.", url: "#", category: "economy" },
  { id: "2", headline: "NVIDIA Surges Past $140 on Record AI Chip Demand Forecast", source: "Bloomberg", datetime: Date.now() - 300000, summary: "NVIDIA shares rallied after the company raised its revenue guidance citing unprecedented demand for AI training and inference hardware.", url: "#", category: "technology" },
  { id: "3", headline: "Treasury Yields Drop as Jobs Data Misses Expectations", source: "CNBC", datetime: Date.now() - 600000, summary: "U.S. Treasury yields fell sharply after the monthly employment report showed weaker-than-expected job creation.", url: "#", category: "markets" },
  { id: "4", headline: "Oil Prices Rise on OPEC+ Supply Cut Extension Agreement", source: "Reuters", datetime: Date.now() - 900000, summary: "Crude oil prices gained after OPEC+ members agreed to extend production cuts through the end of the year.", url: "#", category: "commodities" },
  { id: "5", headline: "Apple Announces $110B Stock Buyback — Largest in History", source: "WSJ", datetime: Date.now() - 1200000, summary: "Apple authorized the largest share repurchase program in corporate history alongside better-than-expected quarterly results.", url: "#", category: "technology" },
  { id: "6", headline: "China Manufacturing PMI Expands for Third Consecutive Month", source: "Financial Times", datetime: Date.now() - 1800000, summary: "China's manufacturing sector continued to expand, signaling stabilization in the world's second-largest economy.", url: "#", category: "economy" },
  { id: "7", headline: "European Banks Rally on Strong Q1 Earnings and Dividend Hikes", source: "Bloomberg", datetime: Date.now() - 2400000, summary: "Major European banks posted better-than-expected first quarter results, with several announcing increased dividends.", url: "#", category: "markets" },
  { id: "8", headline: "Bitcoin Tops $104K as Institutional Inflows Accelerate", source: "CoinDesk", datetime: Date.now() - 3000000, summary: "Bitcoin reached new highs as spot ETF inflows surged to record levels and institutional adoption continued to grow.", url: "#", category: "crypto" },
  { id: "9", headline: "Tesla Deliveries Beat Estimates on Model Y Refresh Demand", source: "Reuters", datetime: Date.now() - 3600000, summary: "Tesla reported higher-than-expected vehicle deliveries, driven by strong demand for the updated Model Y.", url: "#", category: "technology" },
  { id: "10", headline: "Gold Hits $2,680 as Central Banks Continue Record Purchases", source: "Financial Times", datetime: Date.now() - 4200000, summary: "Gold prices reached new highs as central banks around the world continued to diversify reserves away from the dollar.", url: "#", category: "commodities" },
  { id: "11", headline: "JPMorgan Warns of 'Elevated Recession Risk' in 2026 Outlook", source: "CNBC", datetime: Date.now() - 5400000, summary: "JPMorgan's chief economist raised the probability of a U.S. recession, citing persistent policy uncertainty and trade tensions.", url: "#", category: "economy" },
  { id: "12", headline: "Microsoft Azure Revenue Jumps 33% on AI Workload Growth", source: "Bloomberg", datetime: Date.now() - 6600000, summary: "Microsoft's cloud division posted accelerating growth as enterprises ramped up AI-related spending on Azure infrastructure.", url: "#", category: "technology" },
];

export async function getNews(): Promise<NewsItem[]> {
  if (FINNHUB_KEY !== "demo") {
    try {
      const data = await finnhub("/news", { category: "general" });
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 15).map((item: any, i: number) => ({
          id: String(item.id || i),
          headline: item.headline,
          source: item.source,
          datetime: item.datetime * 1000,
          summary: item.summary,
          url: item.url,
          category: item.category || "general",
        }));
      }
    } catch {
      // Fall through to simulated
    }
  }
  return SIMULATED_NEWS;
}
