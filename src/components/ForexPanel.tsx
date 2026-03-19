"use client";

import { useEffect, useState } from "react";
import { getCurrencies } from "@/lib/market-data";
import { CurrencyPair } from "@/lib/types";

export default function ForexPanel() {
  const [currencies, setCurrencies] = useState<CurrencyPair[]>([]);

  useEffect(() => {
    setCurrencies(getCurrencies());
    const interval = setInterval(() => setCurrencies(getCurrencies()), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Forex & Crypto</span>
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
            {currencies.map((c) => (
              <tr key={c.pair} className="border-b border-[var(--bb-border)] hover:bg-[#1a1a1a]">
                <td className="py-2 px-3 font-bold text-[var(--bb-yellow)]">{c.pair}</td>
                <td className="text-right py-2 px-3 font-mono">
                  {c.rate > 1000 ? c.rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : c.rate.toFixed(4)}
                </td>
                <td className={`text-right py-2 px-3 font-mono ${c.change >= 0 ? "gain" : "loss"}`}>
                  {c.change >= 0 ? "+" : ""}
                  {c.change > 100 ? c.change.toFixed(2) : c.change.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
