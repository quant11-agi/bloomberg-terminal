"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { fetchStocks } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

interface Props {
  onSelectSymbol: (symbol: string) => void;
  searchQuery?: string;
  watchlist?: string[];
  toggleWatchlist?: (s: string) => void;
  expanded?: boolean;
}

export default function StockTable({
  onSelectSymbol,
  searchQuery = "",
  watchlist = [],
  toggleWatchlist,
  expanded,
}: Props) {
  const fetcher = useCallback(() => fetchStocks(), []);
  const { data: stocks, loading } = useLiveData<StockQuote[]>(fetcher, 15000);
  const [sortKey, setSortKey] = useState<"changePercent" | "volume" | "symbol">("changePercent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const prevRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (stocks) {
      setPrevPrices(prevRef.current);
      const map: Record<string, number> = {};
      stocks.forEach((s) => (map[s.symbol] = s.price));
      prevRef.current = map;
    }
  }, [stocks]);

  const allStocks = stocks || [];
  const filtered = searchQuery
    ? allStocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allStocks;

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    if (sortKey === "symbol") return mul * a.symbol.localeCompare(b.symbol);
    return mul * ((a[sortKey] as number) - (b[sortKey] as number));
  });

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const arrow = (key: string) => (sortKey === key ? (sortDir === "desc" ? " ▼" : " ▲") : "");

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Top Equities</span>
        <span className="text-[10px] text-[var(--bb-muted)]">
          {loading ? "Loading..." : `${filtered.length} symbols`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
      </div>
      <div className={`overflow-auto ${expanded ? "max-h-[800px]" : "max-h-[600px]"}`}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#1a1a1a] z-10">
            <tr className="text-[var(--bb-muted)] border-b border-[var(--bb-border)]">
              {toggleWatchlist && <th className="py-2 px-2 w-6" />}
              <th className="text-left py-2 px-3 font-medium cursor-pointer hover:text-[var(--bb-orange)]" onClick={() => handleSort("symbol")}>
                Symbol{arrow("symbol")}
              </th>
              <th className="text-right py-2 px-3 font-medium">Last</th>
              <th className="text-right py-2 px-3 font-medium">Chg</th>
              <th className="text-right py-2 px-3 font-medium cursor-pointer hover:text-[var(--bb-orange)]" onClick={() => handleSort("changePercent")}>
                % Chg{arrow("changePercent")}
              </th>
              <th className="text-right py-2 px-3 font-medium cursor-pointer hover:text-[var(--bb-orange)]" onClick={() => handleSort("volume")}>
                Volume{arrow("volume")}
              </th>
              <th className="text-right py-2 px-3 font-medium hidden lg:table-cell">High</th>
              <th className="text-right py-2 px-3 font-medium hidden lg:table-cell">Low</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((stock) => {
              const prev = prevPrices[stock.symbol];
              const flashClass = prev ? (stock.price > prev ? "flash-gain" : stock.price < prev ? "flash-loss" : "") : "";
              const isWatched = watchlist.includes(stock.symbol);
              return (
                <tr key={stock.symbol} className={`border-b border-[var(--bb-border)] hover:bg-[#1a1a1a] cursor-pointer transition-colors ${flashClass}`} onClick={() => onSelectSymbol(stock.symbol)}>
                  {toggleWatchlist && (
                    <td className="py-2 px-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                        className={`transition-colors ${isWatched ? "text-[var(--bb-orange)]" : "text-[var(--bb-border)] hover:text-[var(--bb-orange)]"}`}>
                        {isWatched ? "★" : "☆"}
                      </button>
                    </td>
                  )}
                  <td className="py-2 px-3">
                    <div className="font-bold text-[var(--bb-blue)]">{stock.symbol}</div>
                    <div className="text-[10px] text-[var(--bb-muted)]">{stock.name}</div>
                  </td>
                  <td className="text-right py-2 px-3 font-mono">{stock.price.toFixed(2)}</td>
                  <td className={`text-right py-2 px-3 font-mono ${stock.change >= 0 ? "gain" : "loss"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-3">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      stock.changePercent >= 0 ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]" : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                    }`}>
                      {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right py-2 px-3 font-mono text-[var(--bb-muted)]">
                    {stock.volume > 0 ? (stock.volume / 1e6).toFixed(1) + "M" : "—"}
                  </td>
                  <td className="text-right py-2 px-3 font-mono hidden lg:table-cell">{stock.high > 0 ? stock.high.toFixed(2) : "—"}</td>
                  <td className="text-right py-2 px-3 font-mono hidden lg:table-cell">{stock.low > 0 ? stock.low.toFixed(2) : "—"}</td>
                </tr>
              );
            })}
            {loading && allStocks.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6 text-[var(--bb-muted)] text-xs">Loading equities...</td></tr>
            )}
            {!loading && sorted.length === 0 && (
              <tr><td colSpan={8} className="text-center py-6 text-[var(--bb-muted)] text-xs">No stocks matching &quot;{searchQuery}&quot;</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
