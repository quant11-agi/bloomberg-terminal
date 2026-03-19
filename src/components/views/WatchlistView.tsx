"use client";

import { useEffect, useState } from "react";
import { getStocks } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";
import { useApp } from "@/lib/context";
import Chart from "@/components/Chart";

export default function WatchlistView() {
  const { selectedSymbol, setSelectedSymbol, watchlist, toggleWatchlist, setActiveView } = useApp();
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStocks(getStocks());
    setLoading(false);
    const interval = setInterval(() => setStocks(getStocks()), 2000);
    return () => clearInterval(interval);
  }, []);

  const watchedStocks = stocks.filter((s) => watchlist.includes(s.symbol));

  if (watchlist.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-[var(--bb-muted)] text-sm mb-2">Your watchlist is empty</div>
        <div className="text-[var(--bb-muted)] text-xs mb-4">
          Click the ★ icon on any stock in the Equities view to add it
        </div>
        <button
          onClick={() => setActiveView("equities")}
          className="px-4 py-2 text-xs bg-[var(--bb-orange)] text-black rounded font-bold hover:opacity-90 transition-opacity"
        >
          Browse Equities
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 gap-2 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="panel">
          <div className="panel-header">
            <span>Watchlist</span>
            <span className="text-[10px] text-[var(--bb-muted)]">{watchlist.length} symbols</span>
          </div>
          {loading ? (
            <div className="p-6 text-center text-[var(--bb-muted)] text-xs">Loading...</div>
          ) : (
            <div className="divide-y divide-[var(--bb-border)]">
              {watchedStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`flex items-center justify-between px-3 py-3 cursor-pointer transition-colors ${
                    selectedSymbol === stock.symbol ? "bg-[#1a1a1a]" : "hover:bg-[#141414]"
                  }`}
                  onClick={() => setSelectedSymbol(stock.symbol)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      className="text-[var(--bb-orange)] hover:text-[var(--bb-red)] transition-colors"
                      title="Remove from watchlist"
                      aria-label={`Remove ${stock.symbol} from watchlist`}
                    >
                      ★
                    </button>
                    <div>
                      <div className="font-bold text-sm text-[var(--bb-blue)]">{stock.symbol}</div>
                      <div className="text-[10px] text-[var(--bb-muted)]">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{stock.price.toFixed(2)}</div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        stock.changePercent >= 0
                          ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]"
                          : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                      }`}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
              {/* Show symbols not found in stocks data */}
              {watchlist
                .filter((s) => !stocks.find((st) => st.symbol === s))
                .map((sym) => (
                  <div key={sym} className="flex items-center justify-between px-3 py-3 opacity-50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleWatchlist(sym)}
                        className="text-[var(--bb-orange)] hover:text-[var(--bb-red)]"
                        aria-label={`Remove ${sym} from watchlist`}
                      >
                        ★
                      </button>
                      <span className="text-sm text-[var(--bb-muted)]">{sym}</span>
                    </div>
                    <span className="text-[10px] text-[var(--bb-muted)]">No data</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7">
        <Chart symbol={selectedSymbol} />
      </div>
    </div>
  );
}
