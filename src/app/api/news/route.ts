import { NextResponse } from "next/server";

// Decode HTML entities server-side so clients never see raw &amp; etc.
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// Multiple RSS feeds for broader coverage + category mapping
const RSS_FEEDS = [
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", source: "CNBC", category: "markets" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15838459", source: "CNBC Markets", category: "markets" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258", source: "CNBC Economy", category: "economy" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910", source: "CNBC Tech", category: "technology" },
  { url: "https://feeds.marketwatch.com/marketwatch/topstories/", source: "MarketWatch", category: "markets" },
];

// Finnhub (optional, if key is set)
const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY || "";

function mapCategory(cat: string): string {
  const lower = cat.toLowerCase();
  if (lower.includes("tech")) return "technology";
  if (lower.includes("business") || lower.includes("market")) return "markets";
  if (lower.includes("econom") || lower.includes("politic")) return "economy";
  if (lower.includes("energy") || lower.includes("commodit")) return "commodities";
  if (lower.includes("crypto") || lower.includes("bitcoin")) return "crypto";
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

function parseRSSItems(xml: string, source: string, defaultCategory: string) {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1]
      || block.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "#";
    const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1]
      || block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";

    if (title) {
      items.push({
        id: `rss-${source.replace(/\s/g, "")}-${items.length}`,
        headline: decodeEntities(title.replace(/<[^>]*>/g, "")),
        source,
        datetime: pubDate ? new Date(pubDate).getTime() : Date.now(),
        summary: decodeEntities(desc.replace(/<[^>]*>/g, "").trim()).slice(0, 300),
        url: link,
        category: defaultCategory,
        image: null,
      });
    }
  }
  return items;
}

export async function GET() {
  let allNews: any[] = [];

  // Fetch all RSS feeds in parallel
  const rssResults = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const res = await fetchWithTimeout(feed.url);
      if (!res || !res.ok) return [];
      const text = await res.text();
      return parseRSSItems(text, feed.source, feed.category);
    })
  );

  for (const result of rssResults) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      allNews = [...allNews, ...result.value];
    }
  }

  // Optionally add Finnhub news
  if (FINNHUB_KEY) {
    try {
      const res = await fetchWithTimeout(
        `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`
      );
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const fhNews = data.slice(0, 15).map((item: any, i: number) => ({
            id: `fh-${i}`,
            headline: decodeEntities(item.headline || ""),
            source: item.source || "Finnhub",
            datetime: (item.datetime || 0) * 1000,
            summary: decodeEntities(item.summary || ""),
            url: item.url || "#",
            category: mapCategory(item.category || "general"),
            image: item.image || null,
          }));
          allNews = [...allNews, ...fhNews];
        }
      }
    } catch {
      // Skip Finnhub
    }
  }

  // Sort by most recent and deduplicate by headline prefix
  const seen = new Set<string>();
  const unique = allNews
    .filter((item) => item.headline && item.headline.length > 10) // filter junk
    .sort((a, b) => b.datetime - a.datetime)
    .filter((item) => {
      const key = item.headline.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);

  return NextResponse.json(unique, {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
  });
}
