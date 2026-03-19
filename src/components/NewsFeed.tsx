"use client";

import { useEffect, useState } from "react";
import { getNews } from "@/lib/market-data";
import { NewsItem } from "@/lib/types";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
  technology: "text-[var(--bb-blue)]",
  economy: "text-[var(--bb-yellow)]",
  markets: "text-[var(--bb-green)]",
  commodities: "text-[var(--bb-orange)]",
  crypto: "text-purple-400",
  general: "text-[var(--bb-muted)]",
};

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getNews().then(setNews);
    const interval = setInterval(() => getNews().then(setNews), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span>Breaking News</span>
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-red)] inline-block" />
        </div>
        <span className="text-[10px] text-[var(--bb-muted)]">{news.length} stories</span>
      </div>
      <div className="overflow-auto max-h-[600px]">
        {news.map((item) => (
          <div
            key={item.id}
            className="px-3 py-2.5 border-b border-[var(--bb-border)] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xs font-semibold leading-snug text-[var(--bb-text)]">
                {item.headline}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-bold ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general}`}>
                {item.category}
              </span>
              <span className="text-[10px] text-[var(--bb-muted)]">{item.source}</span>
              <span className="text-[10px] text-[var(--bb-muted)]">•</span>
              <span className="text-[10px] text-[var(--bb-muted)]">{timeAgo(item.datetime)}</span>
            </div>
            {expandedId === item.id && (
              <p className="mt-2 text-[11px] text-[var(--bb-muted)] leading-relaxed">
                {item.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
