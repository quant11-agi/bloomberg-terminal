"use client";

import { useApp } from "@/lib/context";
import MarketOverview from "@/components/MarketOverview";
import StockTable from "@/components/StockTable";
import Chart from "@/components/Chart";
import NewsFeed from "@/components/NewsFeed";
import ForexPanel from "@/components/ForexPanel";
import CommoditiesPanel from "@/components/CommoditiesPanel";
import SectorHeatmap from "@/components/SectorHeatmap";
import MarketMovers from "@/components/MarketMovers";

export default function DashboardView() {
  const { selectedSymbol, setSelectedSymbol, searchQuery, watchlist, toggleWatchlist, setActiveView } = useApp();

  return (
    <div className="p-2 gap-2 grid grid-cols-1 lg:grid-cols-12 auto-rows-min">
      {/* Left column */}
      <div className="lg:col-span-3 flex flex-col gap-2">
        <MarketOverview />
        <ForexPanel onViewAll={() => setActiveView("forex")} />
        <CommoditiesPanel onViewAll={() => setActiveView("commodities")} />
      </div>

      {/* Center column */}
      <div className="lg:col-span-6 flex flex-col gap-2">
        <Chart symbol={selectedSymbol} />
        <MarketMovers onSelectSymbol={setSelectedSymbol} />
        <StockTable
          onSelectSymbol={setSelectedSymbol}
          searchQuery={searchQuery}
          watchlist={watchlist}
          toggleWatchlist={toggleWatchlist}
        />
      </div>

      {/* Right column */}
      <div className="lg:col-span-3 flex flex-col gap-2">
        <NewsFeed compact onViewAll={() => setActiveView("news")} />
        <SectorHeatmap />
      </div>
    </div>
  );
}
