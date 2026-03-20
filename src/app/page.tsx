"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import TickerTape from "@/components/TickerTape";
import DashboardView from "@/components/views/DashboardView";
import EquitiesView from "@/components/views/EquitiesView";
import ForexView from "@/components/views/ForexView";
import CommoditiesView from "@/components/views/CommoditiesView";
import NewsView from "@/components/views/NewsView";
import WatchlistView from "@/components/views/WatchlistView";

function MarketStatusIndicator() {
  const [status, setStatus] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const nyHour = Number(now.toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", hour12: false }));
      const nyMin = Number(now.toLocaleString("en-US", { timeZone: "America/New_York", minute: "numeric" }));
      const day = Number(now.toLocaleString("en-US", { timeZone: "America/New_York", weekday: "narrow" }));
      const nyDay = now.toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short" });
      const isWeekend = nyDay === "Sat" || nyDay === "Sun";
      const totalMin = nyHour * 60 + nyMin;
      const isOpen = !isWeekend && totalMin >= 570 && totalMin < 960; // 9:30 AM - 4:00 PM ET
      setStatus(isOpen ? "US Market Open" : "US Market Closed");
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);
  const isOpen = status.includes("Open");
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOpen ? "bg-[var(--bb-green)] live-dot" : "bg-[var(--bb-red)]"}`} />
      <span className={isOpen ? "text-[var(--bb-green)]" : "text-[var(--bb-red)]"}>{status}</span>
    </span>
  );
}

export type ViewType = "dashboard" | "equities" | "forex" | "commodities" | "news" | "watchlist";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bb-watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem("bb-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveView("dashboard");
        setSearchQuery("");
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.getElementById("bb-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const viewProps = {
    selectedSymbol,
    setSelectedSymbol,
    searchQuery,
    watchlist,
    toggleWatchlist,
    setActiveView,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        watchlistCount={watchlist.length}
        onSelectSymbol={setSelectedSymbol}
      />
      <TickerTape />

      <main className="flex-1 overflow-auto">
        {activeView === "dashboard" && <DashboardView {...viewProps} />}
        {activeView === "equities" && <EquitiesView {...viewProps} />}
        {activeView === "forex" && <ForexView />}
        {activeView === "commodities" && <CommoditiesView />}
        {activeView === "news" && <NewsView />}
        {activeView === "watchlist" && <WatchlistView {...viewProps} />}
      </main>

      <footer className="flex items-center justify-between px-4 py-1.5 bg-[#0a0a0a] border-t border-[var(--bb-border)] text-[10px] text-[var(--bb-muted)]">
        <div className="flex items-center gap-4">
          <span>Data: Yahoo Finance</span>
          <span>•</span>
          <span>Refresh: 15s</span>
          <span>•</span>
          <MarketStatusIndicator />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[var(--bb-orange)]">/ Search</span>
          <span className="text-[var(--bb-orange)]">ESC Dashboard</span>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-green)] inline-block" />
            <span>Connected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
