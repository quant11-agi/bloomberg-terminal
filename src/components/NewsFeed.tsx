"use client";

import { useCallback } from "react";
import { fetchNews } from "@/lib/market-data";
import { NewsItem } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";
import { useState } from "react";
import { NewsSkeleton } from "@/components/LoadingSkeleton";

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

interface Props {
  compact?: boolean;
  onViewAll?: () => void;
}

export default function NewsFeed({ compact, onViewAll }: Props) {
  const fetcher = useCallback(() => fetchNews(), []);
  const { data: news, loading } = useLiveData<NewsItem[]>(fetcher, 120000);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allNews = news || [];
  const displayNews = compact ? allNews.slice(0, 8) : allNews;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span>Breaking News</span>
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-red)] inline-block" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--bb-muted)]">
            {loading ? "Loading..." : `${allNews.length} stories`}
          </span>
          {onViewAll && (
            <button onClick={onViewAll} className="text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] transition-colors">
              View All →
            </button>
          )}
        </div>
      </div>
      <div className={`overflow-auto ${compact ? "max-h-[500px]" : "max-h-[600px]"}`}>
        {displayNews.map((item) => (
          <div key={item.id}
            className="px-2 py-1.5 border-b border-[var(--bb-border)] hover:bg-[#1a1a2e] cursor-pointer transition-colors"
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
            <h3 className="text-xs font-semibold leading-snug text-[var(--bb-text)]">{item.headline}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] uppercase font-bold ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.general}`}>
                {item.category}
              </span>
              <span className="text-[10px] text-[var(--bb-muted)]">{item.source}</span>
              <span className="text-[10px] text-[var(--bb-muted)]">•</span>
              <span className="text-[10px] text-[var(--bb-muted)]">{timeAgo(item.datetime)}</span>
            </div>
            {expandedId === item.id && (
              <div className="mt-2">
                <p className="text-[11px] text-[var(--bb-muted)] leading-relaxed border-l-2 border-[var(--bb-orange)] pl-3">
                  {item.summary}
                </p>
                {item.url && item.url !== "#" && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block mt-1 text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)]">
                    Read full article →
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && allNews.length === 0 && <NewsSkeleton count={6} />}
        {compact && allNews.length > 8 && onViewAll && (
          <button onClick={onViewAll}
            className="w-full py-2 text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] hover:bg-[#1a1a2e] transition-colors">
            + {allNews.length - 8} more stories →
          </button>
        )}
      </div>
    </div>
  );
}
