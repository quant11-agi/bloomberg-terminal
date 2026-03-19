"use client";

import { useEffect, useState } from "react";
import { ViewType } from "@/app/page";

const NAV_ITEMS: { key: ViewType; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "equities", label: "Equities" },
  { key: "forex", label: "Forex" },
  { key: "commodities", label: "Commodities" },
  { key: "news", label: "News" },
  { key: "watchlist", label: "Watchlist" },
];

interface HeaderProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  watchlistCount: number;
}

export default function Header({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  watchlistCount,
}: HeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0a0a0a] border-b border-[var(--bb-border)]">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView("dashboard")}
            className="text-[var(--bb-orange)] font-bold text-lg tracking-wider hover:opacity-80 transition-opacity"
          >
            BLOOMBERG<span className="text-[var(--bb-text)]">TERMINAL</span>
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="live-dot w-2 h-2 rounded-full bg-[var(--bb-green)] inline-block" />
            <span className="text-[10px] text-[var(--bb-green)] uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex items-center relative">
          <input
            id="bb-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbols... ( / )"
            className="bg-[#1a1a1a] border border-[var(--bb-border)] rounded px-3 py-1 text-xs text-[var(--bb-text)] w-56 focus:border-[var(--bb-orange)] focus:outline-none placeholder:text-[var(--bb-muted)] font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-[var(--bb-muted)] hover:text-[var(--bb-text)] text-xs"
            >
              ×
            </button>
          )}
        </div>

        <div className="text-xs text-[var(--bb-muted)] font-mono">{time}</div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-0 px-4 border-t border-[var(--bb-border)]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`px-4 py-2 text-[11px] uppercase tracking-wider transition-colors relative ${
              activeView === item.key
                ? "text-[var(--bb-orange)]"
                : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
            }`}
          >
            {item.label}
            {item.key === "watchlist" && watchlistCount > 0 && (
              <span className="ml-1 bg-[var(--bb-orange)] text-black text-[9px] px-1 rounded-full font-bold">
                {watchlistCount}
              </span>
            )}
            {activeView === item.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--bb-orange)]" />
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}
