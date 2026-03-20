"use client";

import { useCallback } from "react";
import { fetchCommodities } from "@/lib/market-data";
import { CommodityQuote } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

interface Props {
  onViewAll?: () => void;
}

export default function CommoditiesPanel({ onViewAll }: Props) {
  const fetcher = useCallback(() => fetchCommodities(), []);
  const { data: commodities, loading } = useLiveData<CommodityQuote[]>(fetcher, 15000);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Commodities</span>
        {onViewAll && (
          <button onClick={onViewAll} className="text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] transition-colors">
            View All →
          </button>
        )}
      </div>
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--bb-muted)] border-b border-[var(--bb-border)]">
              <th className="text-left py-2 px-3 font-medium">Name</th>
              <th className="text-right py-2 px-3 font-medium">Price</th>
              <th className="text-right py-2 px-3 font-medium">% Chg</th>
            </tr>
          </thead>
          <tbody>
            {(commodities || []).map((c) => (
              <tr key={c.symbol} className="border-b border-[var(--bb-border)] hover:bg-[#1a1a2e] cursor-pointer transition-colors" onClick={onViewAll}>
                <td className="py-2 px-3"><span className="font-bold text-[var(--bb-text)]">{c.name}</span></td>
                <td className="text-right py-2 px-3 font-mono">
                  {c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="text-right py-2 px-3">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    c.changePercent >= 0 ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]" : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                  }`}>
                    {c.changePercent >= 0 ? "+" : ""}{c.changePercent.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
            {loading && !(commodities?.length) && (
              <tr><td colSpan={3} className="py-4 text-center text-[var(--bb-muted)] text-xs">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
