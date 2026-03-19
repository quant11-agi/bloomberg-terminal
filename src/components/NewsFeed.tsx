"use client";

import { useEffect, useState } from "react";
import { getNews } from "@/lib/market-data";
import { NewsItem } from "@/lib/types";
import { timeAgo, CATEGORY_COLORS } from "@/lib/utils";

interface Props {
  compact?: boolean;
  onViewAll?: () => void;
}

export default function NewsFeed({ compact, onViewAll }: Props) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getNews().then(setNews);
    const interval = setInterval(() => getNews().then(setNews), 60000);
    return () => clearInterval(interval);
  }, []);

  const displayNews = compact ? news.slice(0, 8) : news;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span>Breaking News</span>
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-red)] inline-block" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--bb-muted)]">{news.length} stories</span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] transition-colors"
            >
              View All →
            </button>
          )}
        </div>
      </div>
      <div className={`overflow-auto ${compact ? "max-h-[500px]" : "max-h-[600px]"}`}>
        {displayNews.map((item) => (
          <div
            key={item.id}
            className="px-3 py-2.5 border-b border-[var(--bb-border)] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            <h3 className="text-xs font-semibold leading-snug text-[var(--bb-text)]">
              {item.headline}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] uppercase font-bold ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general}`}
              >
                {item.category}
              </span>
              <span className="text-[10px] text-[var(--bb-muted)]">{item.source}</span>
              <span className="text-[10px] text-[var(--bb-muted)]">•</span>
              <span className="text-[10px] text-[var(--bb-muted)]">{timeAgo(item.datetime)}</span>
            </div>
            {expandedId === item.id && (
              <p className="mt-2 text-[11px] text-[var(--bb-muted)] leading-relaxed border-l-2 border-[var(--bb-orange)] pl-3">
                {item.summary}
              </p>
            )}
          </div>
        ))}
        {compact && news.length > 8 && onViewAll && (
          <button
            onClick={onViewAll}
            className="w-full py-2 text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] hover:bg-[#1a1a1a] transition-colors"
          >
            + {news.length - 8} more stories →
          </button>
        )}
      </div>
    </div>
  );
}
