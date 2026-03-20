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
import PortfolioView from "@/components/views/PortfolioView";
import StatusBar from "@/components/StatusBar";

export type ViewType = "dashboard" | "equities" | "forex" | "commodities" | "news" | "watchlist" | "portfolio";

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
      const viewKeys: Record<string, ViewType> = {
        "1": "dashboard", "2": "equities", "3": "forex",
        "4": "commodities", "5": "news", "6": "watchlist", "7": "portfolio",
      };
      if (viewKeys[e.key] && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setActiveView(viewKeys[e.key]);
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
      <TickerTape onSelectSymbol={(sym) => { setSelectedSymbol(sym); setActiveView("equities"); }} />

      <main className="flex-1 overflow-auto">
        {activeView === "dashboard" && <DashboardView {...viewProps} />}
        {activeView === "equities" && <EquitiesView {...viewProps} />}
        {activeView === "forex" && <ForexView />}
        {activeView === "commodities" && <CommoditiesView />}
        {activeView === "news" && <NewsView />}
        {activeView === "watchlist" && <WatchlistView {...viewProps} />}
        {activeView === "portfolio" && <PortfolioView />}
      </main>

      <StatusBar />
    </div>
  );
}
