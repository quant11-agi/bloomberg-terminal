"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { fetchIndices } from "@/lib/market-data";
import { MarketIndex } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

export default function MarketOverview() {
  const fetcher = useCallback(() => fetchIndices(), []);
  const { data: indices, loading } = useLiveData<MarketIndex[]>(fetcher, 15000);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const prevRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (indices) {
      setPrevPrices(prevRef.current);
      const map: Record<string, number> = {};
      indices.forEach((idx) => (map[idx.symbol] = idx.price));
      prevRef.current = map;
    }
  }, [indices]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Global Markets</span>
        <span className="text-[10px] text-[var(--bb-muted)]">
          {loading ? "Loading..." : "Live"}
        </span>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--bb-muted)] border-b border-[var(--bb-border)]">
              <th className="text-left py-1 px-2 font-medium">Index</th>
              <th className="text-right py-1 px-2 font-medium">Last</th>
              <th className="text-right py-1 px-2 font-medium">Chg</th>
              <th className="text-right py-1 px-2 font-medium">% Chg</th>
            </tr>
          </thead>
          <tbody>
            {(indices || []).map((idx) => {
              const prev = prevPrices[idx.symbol];
              const flashClass = prev
                ? idx.price > prev ? "flash-gain" : idx.price < prev ? "flash-loss" : ""
                : "";
              return (
                <tr key={idx.symbol} className={`border-b border-[var(--bb-border)] hover:bg-[#1a1a2e] ${flashClass}`}>
                  <td className="py-1 px-2">
                    <div className="font-bold text-[var(--bb-orange)]">{idx.symbol}</div>
                    <div className="text-[10px] text-[var(--bb-muted)]">{idx.name}</div>
                  </td>
                  <td className="text-right py-1 px-2 font-mono">
                    {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`text-right py-1 px-2 font-mono ${idx.change >= 0 ? "gain" : "loss"}`}>
                    {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)}
                  </td>
                  <td className="text-right py-1 px-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      idx.changePercent >= 0
                        ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]"
                        : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                    }`}>
                      {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {loading && !indices && (
              <tr><td colSpan={4} className="py-4 text-center text-[var(--bb-muted)] text-xs">Loading market data...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
