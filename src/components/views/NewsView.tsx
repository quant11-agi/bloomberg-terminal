"use client";

import { useCallback, useState } from "react";
import { fetchNews } from "@/lib/market-data";
import { NewsItem } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

const CATEGORIES = ["all", "technology", "economy", "markets", "commodities", "crypto"];

const CATEGORY_COLORS: Record<string, string> = {
  technology: "text-[var(--bb-blue)]",
  economy: "text-[var(--bb-yellow)]",
  markets: "text-[var(--bb-green)]",
  commodities: "text-[var(--bb-orange)]",
  crypto: "text-purple-400",
  general: "text-[var(--bb-muted)]",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NewsView() {
  const fetcher = useCallback(() => fetchNews(), []);
  const { data: news, loading } = useLiveData<NewsItem[]>(fetcher, 120000);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allNews = news || [];
  const filtered = activeCategory === "all" ? allNews : allNews.filter((n) => n.category === activeCategory);

  return (
    <div className="p-2 max-w-5xl mx-auto">
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span>Breaking News</span>
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-red)] inline-block" />
          </div>
          <span className="text-[10px] text-[var(--bb-muted)]">
            {loading ? "Loading..." : `${filtered.length} stories`}
          </span>
        </div>

        <div className="flex items-center gap-0 border-b border-[var(--bb-border)] px-3">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 text-[10px] uppercase tracking-wider transition-colors relative ${
                activeCategory === cat ? "text-[var(--bb-orange)]" : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
              }`}>
              {cat}
              {activeCategory === cat && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--bb-orange)]" />}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[var(--bb-border)]">
          {filtered.map((item) => (
            <div key={item.id} className="px-4 py-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general} bg-[#1a1a1a]`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--bb-text)] leading-snug mb-1">{item.headline}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--bb-muted)]">
                    <span className="font-bold">{item.source}</span>
                    <span>•</span>
                    <span>{timeAgo(item.datetime)}</span>
                  </div>
                  {expandedId === item.id && (
                    <div className="mt-3">
                      <p className="text-xs text-[var(--bb-muted)] leading-relaxed border-l-2 border-[var(--bb-orange)] pl-3">
                        {item.summary}
                      </p>
                      {item.url && item.url !== "#" && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block mt-2 text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)]">
                          Read full article →
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-[var(--bb-muted)] text-xs">
                  {expandedId === item.id ? "▲" : "▼"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && allNews.length === 0 && (
          <div className="p-8 text-center text-[var(--bb-muted)] text-xs">Loading news...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-[var(--bb-muted)] text-xs">No news in this category</div>
        )}
      </div>
    </div>
  );
}
