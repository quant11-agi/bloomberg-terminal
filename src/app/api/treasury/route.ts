import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

const TREASURY_SYMBOLS: Record<string, string> = {
  "13W": "^IRX",
  "5Y": "^FVX",
  "10Y": "^TNX",
  "30Y": "^TYX",
};

export async function GET() {
  try {
    const symbols = Object.values(TREASURY_SYMBOLS);
    const results = await yahooFinance.quote(symbols);
    const quotes: any[] = Array.isArray(results) ? results : [results];

    const yields = Object.entries(TREASURY_SYMBOLS).map(([label, sym]) => {
      const q = quotes.find((quote: any) => quote.symbol === sym);
      return {
        label,
        symbol: sym,
        yield: q?.regularMarketPrice ?? 0,
        change: q?.regularMarketChange ?? 0,
        changePercent: q?.regularMarketChangePercent ?? 0,
      };
    });

    return NextResponse.json(yields, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (error: any) {
    console.error("Treasury API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
