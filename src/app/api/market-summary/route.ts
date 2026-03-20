import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

// Sector ETFs to track sector performance
const SECTOR_ETFS: Record<string, string> = {
  "Technology": "XLK",
  "Healthcare": "XLV",
  "Financials": "XLF",
  "Energy": "XLE",
  "Consumer Disc.": "XLY",
  "Industrials": "XLI",
  "Communication": "XLC",
  "Real Estate": "XLRE",
  "Utilities": "XLU",
  "Materials": "XLB",
  "Consumer Staples": "XLP",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "sectors";

  if (type === "sectors") {
    try {
      const symbols = Object.values(SECTOR_ETFS);
      const results = await yahooFinance.quote(symbols);
      const quotes: any[] = Array.isArray(results) ? results : [results];

      const sectors = Object.entries(SECTOR_ETFS).map(([sector, etf]) => {
        const quote = quotes.find((q: any) => q.symbol === etf);
        return {
          sector,
          etf,
          changePercent: quote?.regularMarketChangePercent ?? 0,
          price: quote?.regularMarketPrice ?? 0,
        };
      });

      return NextResponse.json(sectors, {
        headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
      });
    } catch (error: any) {
      console.error("Sector API error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Trending symbols
  if (type === "trending") {
    try {
      const result: any = await yahooFinance.trendingSymbols("US");
      const symbols = (result.quotes || []).slice(0, 10).map((q: any) => q.symbol);
      if (symbols.length > 0) {
        const quotes = await yahooFinance.quote(symbols);
        const data = (Array.isArray(quotes) ? quotes : [quotes]).map((q: any) => ({
          symbol: q.symbol,
          name: q.shortName || q.symbol,
          price: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
          volume: q.regularMarketVolume ?? 0,
        }));
        return NextResponse.json(data);
      }
      return NextResponse.json([]);
    } catch (error: any) {
      console.error("Trending API error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
