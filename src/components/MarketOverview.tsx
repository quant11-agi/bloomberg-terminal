"use client";

import { useEffect, useState } from "react";
import { getIndices } from "@/lib/market-data";
import { MarketIndex } from "@/lib/types";

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    setIndices(getIndices());
    const interval = setInterval(() => {
      setIndices((prev) => {
        const priceMap: Record<string, number> = {};
        prev.forEach((p) => (priceMap[p.symbol] = p.price));
        setPrevPrices(priceMap);
        return getIndices();
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Global Markets</span>
        <span className="text-[10px] text-[var(--bb-muted)]">Auto-refresh 2s</span>
      </div>
      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--bb-muted)] border-b border-[var(--bb-border)]">
              <th className="text-left py-2 px-3 font-medium">Index</th>
              <th className="text-right py-2 px-3 font-medium">Last</th>
              <th className="text-right py-2 px-3 font-medium">Chg</th>
              <th className="text-right py-2 px-3 font-medium">% Chg</th>
            </tr>
          </thead>
          <tbody>
            {indices.map((idx) => {
              const prev = prevPrices[idx.symbol];
              const flashClass = prev
                ? idx.price > prev
                  ? "flash-gain"
                  : idx.price < prev
                  ? "flash-loss"
                  : ""
                : "";
              return (
                <tr
                  key={idx.symbol}
                  className={`border-b border-[var(--bb-border)] hover:bg-[#1a1a1a] transition-colors ${flashClass}`}
                >
                  <td className="py-2 px-3">
                    <div className="font-bold text-[var(--bb-orange)]">{idx.symbol}</div>
                    <div className="text-[10px] text-[var(--bb-muted)]">{idx.name}</div>
                  </td>
                  <td className="text-right py-2 px-3 font-mono">{idx.price.toLocaleString()}</td>
                  <td className={`text-right py-2 px-3 font-mono ${idx.change >= 0 ? "gain" : "loss"}`}>
                    {idx.change >= 0 ? "+" : ""}
                    {idx.change.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        idx.changePercent >= 0
                          ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]"
                          : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                      }`}
                    >
                      {idx.changePercent >= 0 ? "+" : ""}
                      {idx.changePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
