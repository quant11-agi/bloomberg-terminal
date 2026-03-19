"use client";

import { useApp } from "@/lib/context";
import Chart from "@/components/Chart";
import StockTable from "@/components/StockTable";
import MarketMovers from "@/components/MarketMovers";
import StockDetail from "@/components/StockDetail";

export default function EquitiesView() {
  const { selectedSymbol, setSelectedSymbol, searchQuery, watchlist, toggleWatchlist } = useApp();

  return (
    <div className="p-2 gap-2 grid grid-cols-1 lg:grid-cols-12 auto-rows-min">
      {/* Left: full stock table */}
      <div className="lg:col-span-5 flex flex-col gap-2">
        <StockTable
          onSelectSymbol={setSelectedSymbol}
          searchQuery={searchQuery}
          watchlist={watchlist}
          toggleWatchlist={toggleWatchlist}
          expanded
        />
      </div>

      {/* Right: chart + detail */}
      <div className="lg:col-span-7 flex flex-col gap-2">
        <Chart symbol={selectedSymbol} />
        <StockDetail
          symbol={selectedSymbol}
          isWatchlisted={watchlist.includes(selectedSymbol)}
          toggleWatchlist={toggleWatchlist}
        />
        <MarketMovers onSelectSymbol={setSelectedSymbol} />
      </div>
    </div>
  );
}
