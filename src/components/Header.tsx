"use client";

import { useEffect, useState } from "react";
import { ViewType } from "@/app/page";
import SearchBar from "@/components/SearchBar";

const NAV_ITEMS: { key: ViewType; label: string; shortcut: string }[] = [
  { key: "dashboard", label: "Dashboard", shortcut: "1" },
  { key: "equities", label: "Equities", shortcut: "2" },
  { key: "forex", label: "Forex", shortcut: "3" },
  { key: "commodities", label: "Commodities", shortcut: "4" },
  { key: "news", label: "News", shortcut: "5" },
  { key: "watchlist", label: "Watchlist", shortcut: "6" },
  { key: "portfolio", label: "Portfolio", shortcut: "7" },
];

interface HeaderProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  watchlistCount: number;
  onSelectSymbol: (symbol: string) => void;
}

export default function Header({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  watchlistCount,
  onSelectSymbol,
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

  const handleSearchSelect = (symbol: string) => {
    onSelectSymbol(symbol);
    setActiveView("equities");
  };

  return (
    <header className="bg-[#080810] border-b border-[var(--bb-border)]">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView("dashboard")}
            className="text-[var(--bb-orange)] font-bold text-lg tracking-wider hover:opacity-80 transition-opacity">
            BLOOMBERG<span className="text-[var(--bb-text)]">TERMINAL</span>
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="live-dot w-2 h-2 rounded-full bg-[var(--bb-green)] inline-block" />
            <span className="text-[10px] text-[var(--bb-green)] uppercase tracking-wider">Live</span>
          </div>
        </div>

        <SearchBar onSelectSymbol={handleSearchSelect} onQueryChange={setSearchQuery} />

        <div className="text-xs text-[var(--bb-muted)] font-mono">{time}</div>
      </div>

      <nav className="flex items-center gap-0 px-4 border-t border-[var(--bb-border)]">
        {NAV_ITEMS.map((item) => (
          <button key={item.key} onClick={() => setActiveView(item.key)}
            className={`px-4 py-2 text-[11px] uppercase tracking-wider transition-colors relative ${
              activeView === item.key ? "text-[var(--bb-orange)]" : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
            }`}>
            <span className="text-[var(--bb-muted)] mr-1 text-[9px]">{item.shortcut}</span>
            {item.label}
            {item.key === "watchlist" && watchlistCount > 0 && (
              <span className="ml-1 bg-[var(--bb-orange)] text-black text-[9px] px-1 rounded-full font-bold">{watchlistCount}</span>
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
