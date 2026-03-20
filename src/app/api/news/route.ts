import { NextResponse } from "next/server";

// Use multiple free news sources
const NEWS_SOURCES = [
  {
    url: "https://newsdata.io/api/1/latest?apikey=pub_64259d35e5a347c5b835e1c02c06cd3f5ffab&category=business&language=en&size=10",
    parse: (data: any) =>
      (data.results || []).map((item: any, i: number) => ({
        id: item.article_id || `nd-${i}`,
        headline: item.title,
        source: item.source_name || item.source_id || "NewsData",
        datetime: new Date(item.pubDate).getTime(),
        summary: item.description || "",
        url: item.link || "#",
        category: mapCategory(item.category?.[0] || "general"),
        image: item.image_url || null,
      })),
  },
  {
    // Finnhub free news (needs key, optional)
    url: `https://finnhub.io/api/v1/news?category=general&token=${process.env.NEXT_PUBLIC_FINNHUB_KEY || ""}`,
    enabled: !!process.env.NEXT_PUBLIC_FINNHUB_KEY,
    parse: (data: any) =>
      (Array.isArray(data) ? data : []).slice(0, 15).map((item: any, i: number) => ({
        id: String(item.id || `fh-${i}`),
        headline: item.headline,
        source: item.source,
        datetime: (item.datetime || 0) * 1000,
        summary: item.summary || "",
        url: item.url || "#",
        category: mapCategory(item.category || "general"),
        image: item.image || null,
      })),
  },
];

// RSS feed fallback - CNBC
const RSS_URL = "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114";

function mapCategory(cat: string): string {
  const lower = cat.toLowerCase();
  if (lower.includes("tech")) return "technology";
  if (lower.includes("business") || lower.includes("market")) return "markets";
  if (lower.includes("econom") || lower.includes("politic")) return "economy";
  if (lower.includes("energy") || lower.includes("commodit")) return "commodities";
  if (lower.includes("crypto")) return "crypto";
  return "markets";
}

async function fetchWithTimeout(url: string, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function fetchRSSNews() {
  try {
    const res = await fetchWithTimeout(RSS_URL);
    if (!res || !res.ok) return [];
    const text = await res.text();
    // Simple XML parse for RSS items
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null && items.length < 15) {
      const xml = match[1];
      const title = xml.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || xml.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const link = xml.match(/<link>(.*?)<\/link>/)?.[1] || "#";
      const desc = xml.match(/<description><!\[CDATA\[(.*?)\]\]>/)?.[1] || xml.match(/<description>(.*?)<\/description>/)?.[1] || "";
      const pubDate = xml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      if (title) {
        items.push({
          id: `rss-${items.length}`,
          headline: title,
          source: "CNBC",
          datetime: pubDate ? new Date(pubDate).getTime() : Date.now(),
          summary: desc.replace(/<[^>]*>/g, "").slice(0, 300),
          url: link,
          category: "markets",
          image: null,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  let allNews: any[] = [];

  // Try each source
  for (const source of NEWS_SOURCES) {
    if (source.enabled === false) continue;
    try {
      const res = await fetchWithTimeout(source.url);
      if (res && res.ok) {
        const data = await res.json();
        const parsed = source.parse(data);
        if (parsed.length > 0) {
          allNews = [...allNews, ...parsed];
        }
      }
    } catch {
      // Continue to next source
    }
  }

  // Fallback to RSS if no API news
  if (allNews.length === 0) {
    allNews = await fetchRSSNews();
  }

  // Sort by most recent and deduplicate by headline
  const seen = new Set<string>();
  const unique = allNews
    .sort((a, b) => b.datetime - a.datetime)
    .filter((item) => {
      const key = item.headline.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);

  return NextResponse.json(unique, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
  });
}
