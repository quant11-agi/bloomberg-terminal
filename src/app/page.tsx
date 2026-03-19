"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TickerTape from "@/components/TickerTape";
import MarketOverview from "@/components/MarketOverview";
import StockTable from "@/components/StockTable";
import Chart from "@/components/Chart";
import NewsFeed from "@/components/NewsFeed";
import ForexPanel from "@/components/ForexPanel";
import CommoditiesPanel from "@/components/CommoditiesPanel";
import SectorHeatmap from "@/components/SectorHeatmap";
import MarketMovers from "@/components/MarketMovers";

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TickerTape />

      <main className="flex-1 p-2 gap-2 grid grid-cols-1 lg:grid-cols-12 auto-rows-min">
        {/* Left column: Markets + Forex + Commodities */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <MarketOverview />
          <ForexPanel />
          <CommoditiesPanel />
        </div>

        {/* Center column: Chart + Stock Table + Movers */}
        <div className="lg:col-span-6 flex flex-col gap-2">
          <Chart symbol={selectedSymbol} />
          <MarketMovers />
          <StockTable onSelectSymbol={setSelectedSymbol} />
        </div>

        {/* Right column: News + Sectors */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <NewsFeed />
          <SectorHeatmap />
        </div>
      </main>

      {/* Footer status bar */}
      <footer className="flex items-center justify-between px-4 py-1.5 bg-[#0a0a0a] border-t border-[var(--bb-border)] text-[10px] text-[var(--bb-muted)]">
        <div className="flex items-center gap-4">
          <span>Data: Simulated (set NEXT_PUBLIC_FINNHUB_KEY for live)</span>
          <span>•</span>
          <span>Refresh: 2-5s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[var(--bb-green)] inline-block" />
          <span>Connected</span>
        </div>
      </footer>
    </div>
  );
}
