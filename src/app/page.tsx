"use client";

import { AppProvider, useApp } from "@/lib/context";
import Header from "@/components/Header";
import TickerTape from "@/components/TickerTape";
import ErrorBoundary from "@/components/ErrorBoundary";
import DashboardView from "@/components/views/DashboardView";
import EquitiesView from "@/components/views/EquitiesView";
import ForexView from "@/components/views/ForexView";
import CommoditiesView from "@/components/views/CommoditiesView";
import NewsView from "@/components/views/NewsView";
import WatchlistView from "@/components/views/WatchlistView";

function AppContent() {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TickerTape />

      <main className="flex-1 overflow-auto" role="main">
        <ErrorBoundary>
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "equities" && <EquitiesView />}
          {activeView === "forex" && <ForexView />}
          {activeView === "commodities" && <CommoditiesView />}
          {activeView === "news" && <NewsView />}
          {activeView === "watchlist" && <WatchlistView />}
        </ErrorBoundary>
      </main>

      <footer
        className="flex items-center justify-between px-4 py-1.5 bg-[#0a0a0a] border-t border-[var(--bb-border)] text-[10px] text-[var(--bb-muted)]"
        role="contentinfo"
      >
        <div className="flex items-center gap-4">
          <span>Data: Simulated (set NEXT_PUBLIC_FINNHUB_KEY for live)</span>
          <span>•</span>
          <span>Refresh: 2-5s</span>
          <span>•</span>
          <span className="text-[var(--bb-orange)]">/ Search</span>
          <span className="text-[var(--bb-orange)]">ESC Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-green)] inline-block" aria-hidden="true" />
          <span>Connected</span>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
