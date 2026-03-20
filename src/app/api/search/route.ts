import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const result: any = await yahooFinance.search(query, { newsCount: 0, quotesCount: 12 });
    const quotes = (result.quotes || []).map((q: any) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: q.quoteType || "EQUITY",
      exchange: q.exchange || "",
    }));

    return NextResponse.json(quotes, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error: any) {
    console.error("Search API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
