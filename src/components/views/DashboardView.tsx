"use client";

import { ViewType } from "@/app/page";
import MarketOverview from "@/components/MarketOverview";
import StockTable from "@/components/StockTable";
import Chart from "@/components/Chart";
import NewsFeed from "@/components/NewsFeed";
import ForexPanel from "@/components/ForexPanel";
import CommoditiesPanel from "@/components/CommoditiesPanel";
import SectorHeatmap from "@/components/SectorHeatmap";
import MarketMovers from "@/components/MarketMovers";
import TreasuryYields from "@/components/TreasuryYields";

interface Props {
  selectedSymbol: string;
  setSelectedSymbol: (s: string) => void;
  searchQuery: string;
  watchlist: string[];
  toggleWatchlist: (s: string) => void;
  setActiveView: (v: ViewType) => void;
}

export default function DashboardView({
  selectedSymbol,
  setSelectedSymbol,
  searchQuery,
  watchlist,
  toggleWatchlist,
  setActiveView,
}: Props) {
  return (
    <div className="p-1 gap-1 grid grid-cols-1 lg:grid-cols-12 auto-rows-min">
      {/* Left column */}
      <div className="lg:col-span-3 flex flex-col gap-2">
        <MarketOverview />
        <TreasuryYields />
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
