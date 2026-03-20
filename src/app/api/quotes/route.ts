import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

// Symbols for the dashboard: major stocks, indices, forex, commodities
const STOCK_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B",
  "JPM", "V", "UNH", "XOM", "LLY", "AVGO", "WMT", "MA", "PG", "HD",
  "COST", "NFLX", "CRM", "AMD", "INTC", "DIS", "BA",
];

const INDEX_SYMBOLS = [
  "^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX",
  "^FTSE", "^GDAXI", "^N225", "^HSI", "000001.SS",
];

const FOREX_SYMBOLS = [
  "EURUSD=X", "GBPUSD=X", "JPY=X", "CHF=X", "AUDUSD=X",
  "CADUSD=X", "CNY=X", "BTC-USD", "ETH-USD",
];

const COMMODITY_SYMBOLS = [
  "GC=F", "SI=F", "CL=F", "BZ=F", "NG=F", "HG=F",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "stocks";

  let symbols: string[];
  switch (type) {
    case "indices":
      symbols = INDEX_SYMBOLS;
      break;
    case "forex":
      symbols = FOREX_SYMBOLS;
      break;
    case "commodities":
      symbols = COMMODITY_SYMBOLS;
      break;
    case "all":
      symbols = [...STOCK_SYMBOLS, ...INDEX_SYMBOLS, ...FOREX_SYMBOLS, ...COMMODITY_SYMBOLS];
      break;
    default:
      symbols = STOCK_SYMBOLS;
  }

  // Allow custom symbols from query param
  const custom = searchParams.get("symbols");
  if (custom) {
    symbols = custom.split(",").map((s) => s.trim()).filter(Boolean);
  }

  try {
    const results = await yahooFinance.quote(symbols);
    const quotes = (Array.isArray(results) ? results : [results]).map((q: any) => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      volume: q.regularMarketVolume ?? 0,
      high: q.regularMarketDayHigh ?? 0,
      low: q.regularMarketDayLow ?? 0,
      open: q.regularMarketOpen ?? 0,
      prevClose: q.regularMarketPreviousClose ?? 0,
      marketCap: q.marketCap ?? 0,
      exchange: q.exchange || "",
      quoteType: q.quoteType || "",
      currency: q.currency || "USD",
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? 0,
      trailingPE: q.trailingPE ?? 0,
      epsTrailingTwelveMonths: q.epsTrailingTwelveMonths ?? 0,
      dividendYield: q.dividendYield ?? 0,
      avgVolume: q.averageDailyVolume10Day ?? 0,
    }));

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  } catch (error: any) {
    console.error("Quote API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
