"use client";

import { useCallback } from "react";
import { fetchCurrencies } from "@/lib/market-data";
import { CurrencyPair } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

interface Props {
  onViewAll?: () => void;
}

export default function ForexPanel({ onViewAll }: Props) {
  const fetcher = useCallback(() => fetchCurrencies(), []);
  const { data: currencies, loading } = useLiveData<CurrencyPair[]>(fetcher, 15000);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Forex & Crypto</span>
        {onViewAll && (
          <button onClick={onViewAll} className="text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] transition-colors">
            View All →
          </button>
        )}
      </div>
      <div className="overflow-auto max-h-[300px]">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[var(--bb-muted)] border-b border-[var(--bb-border)]">
              <th className="text-left py-2 px-3 font-medium">Pair</th>
              <th className="text-right py-2 px-3 font-medium">Rate</th>
              <th className="text-right py-2 px-3 font-medium">Chg</th>
            </tr>
          </thead>
          <tbody>
            {(currencies || []).map((c) => (
              <tr key={c.pair} className="border-b border-[var(--bb-border)] hover:bg-[#1a1a2e] cursor-pointer transition-colors" onClick={onViewAll}>
                <td className="py-2 px-3 font-bold text-[var(--bb-yellow)]">{c.pair}</td>
                <td className="text-right py-2 px-3 font-mono">
                  {c.rate > 1000 ? c.rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : c.rate.toFixed(4)}
                </td>
                <td className={`text-right py-2 px-3 font-mono ${c.change >= 0 ? "gain" : "loss"}`}>
                  {c.change >= 0 ? "+" : ""}{c.change > 100 ? c.change.toFixed(2) : c.change.toFixed(4)}
                </td>
              </tr>
            ))}
            {loading && !(currencies?.length) && (
              <tr><td colSpan={3} className="py-4 text-center text-[var(--bb-muted)] text-xs">Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
