"use client";

import { useEffect, useState } from "react";
import { getNews } from "@/lib/market-data";
import { NewsItem } from "@/lib/types";
import { timeAgo, CATEGORY_COLORS } from "@/lib/utils";

const CATEGORIES = ["all", "technology", "economy", "markets", "commodities", "crypto"];

export default function NewsView() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getNews().then(setNews);
    const interval = setInterval(() => getNews().then(setNews), 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered =
    activeCategory === "all" ? news : news.filter((n) => n.category === activeCategory);

  return (
    <div className="p-2 max-w-5xl mx-auto">
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span>Breaking News</span>
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-red)] inline-block" />
          </div>
          <span className="text-[10px] text-[var(--bb-muted)]">{filtered.length} stories</span>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-0 border-b border-[var(--bb-border)] px-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 text-[10px] uppercase tracking-wider transition-colors relative ${
                activeCategory === cat
                  ? "text-[var(--bb-orange)]"
                  : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--bb-orange)]" />
              )}
            </button>
          ))}
        </div>

        {/* News list */}
        <div className="divide-y divide-[var(--bb-border)]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="px-4 py-4 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general
                    } bg-[#1a1a1a]`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--bb-text)] leading-snug mb-1">
                    {item.headline}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--bb-muted)]">
                    <span className="font-bold">{item.source}</span>
                    <span>•</span>
                    <span>{timeAgo(item.datetime)}</span>
                  </div>
                  {expandedId === item.id && (
                    <p className="mt-3 text-xs text-[var(--bb-muted)] leading-relaxed border-l-2 border-[var(--bb-orange)] pl-3">
                      {item.summary}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-[var(--bb-muted)] text-xs">
                  {expandedId === item.id ? "▲" : "▼"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-[var(--bb-muted)] text-xs">
            No news in this category
          </div>
        )}
      </div>
    </div>
  );
}
