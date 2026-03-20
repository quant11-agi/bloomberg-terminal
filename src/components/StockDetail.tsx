"use client";

import { useEffect, useState } from "react";
import { fetchQuote } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";

interface Props {
  symbol: string;
  isWatchlisted: boolean;
  toggleWatchlist: (s: string) => void;
}

export default function StockDetail({ symbol, isWatchlisted, toggleWatchlist }: Props) {
  const [stock, setStock] = useState<StockQuote | null>(null);

  useEffect(() => {
    fetchQuote(symbol).then(setStock);
    const interval = setInterval(() => fetchQuote(symbol).then(setStock), 15000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (!stock) return (
    <div className="panel">
      <div className="panel-header"><span>Loading {symbol}...</span></div>
      <div className="p-4 text-center text-[var(--bb-muted)] text-xs">Fetching quote data...</div>
    </div>
  );

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span>{stock.symbol}</span>
          <span className="text-[var(--bb-text)] text-[10px] font-normal">{stock.name}</span>
        </div>
        <button onClick={() => toggleWatchlist(stock.symbol)}
          className={`text-sm transition-colors ${isWatchlisted ? "text-[var(--bb-orange)]" : "text-[var(--bb-muted)] hover:text-[var(--bb-orange)]"}`}
          title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}>
          {isWatchlisted ? "★" : "☆"}
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-2xl font-mono text-[var(--bb-text)]">{stock.price.toFixed(2)}</span>
          <span className={`text-sm font-mono font-bold ${stock.change >= 0 ? "gain" : "loss"}`}>
            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs">
          <Stat label="Open" value={stock.open > 0 ? stock.open.toFixed(2) : "—"} />
          <Stat label="High" value={stock.high > 0 ? stock.high.toFixed(2) : "—"} />
          <Stat label="Low" value={stock.low > 0 ? stock.low.toFixed(2) : "—"} />
          <Stat label="Volume" value={formatVolume(stock.volume)} />
          <Stat label="Prev Close" value={stock.prevClose ? stock.prevClose.toFixed(2) : "—"} />
          <Stat label="Mkt Cap" value={stock.marketCap ? formatMarketCap(stock.marketCap) : "—"} />
          <Stat label="Day Range" value={stock.low > 0 && stock.high > 0 ? `${stock.low.toFixed(2)} - ${stock.high.toFixed(2)}` : "—"} />
        </div>
        {/* Price range bar */}
        {stock.low > 0 && stock.high > 0 && stock.high > stock.low && (
          <div className="mt-3">
            <div className="text-[10px] text-[var(--bb-muted)] mb-1">Day Range</div>
            <div className="relative h-2 bg-[#1a1a1a] rounded-full">
              <div className="absolute top-0 h-full bg-gradient-to-r from-[var(--bb-red)] via-[var(--bb-yellow)] to-[var(--bb-green)] rounded-full opacity-30" style={{ left: "0%", width: "100%" }} />
              <div className="absolute top-[-2px] w-2 h-2 bg-[var(--bb-orange)] rounded-full border border-[var(--bb-dark)]"
                style={{ left: `${((stock.price - stock.low) / (stock.high - stock.low)) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--bb-muted)] mt-0.5">
              <span>{stock.low.toFixed(2)}</span>
              <span>{stock.high.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-[var(--bb-muted)]">{label}</div>
      <div className="font-mono text-[var(--bb-text)]">{value}</div>
    </div>
  );
}

function formatVolume(v: number): string {
  if (!v) return "—";
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toString();
}

function formatMarketCap(v: number): string {
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
  return "$" + (v / 1e6).toFixed(0) + "M";
}
