"use client";

import { useEffect, useState } from "react";
import { getCurrencies } from "@/lib/market-data";
import { CurrencyPair } from "@/lib/types";
import Sparkline from "@/components/Sparkline";

export default function ForexView() {
  const [currencies, setCurrencies] = useState<CurrencyPair[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    setCurrencies(getCurrencies());
    const interval = setInterval(() => {
      const data = getCurrencies();
      setCurrencies(data);
      setHistory((prev) => {
        const next = { ...prev };
        data.forEach((c) => {
          const arr = next[c.pair] || [];
          next[c.pair] = [...arr.slice(-29), c.rate];
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectedPair = currencies.find((c) => c.pair === selected);

  return (
    <div className="p-2 gap-2 grid grid-cols-1 lg:grid-cols-12">
      {/* Currency grid */}
      <div className="lg:col-span-8">
        <div className="panel">
          <div className="panel-header">
            <span>Foreign Exchange & Crypto</span>
            <span className="text-[10px] text-[var(--bb-muted)]">{currencies.length} pairs</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0">
            {currencies.map((c) => {
              const sparkData = history[c.pair] || [];
              const isSelected = selected === c.pair;
              const changePct = c.rate !== 0 ? (c.change / (c.rate - c.change)) * 100 : 0;
              return (
                <div
                  key={c.pair}
                  onClick={() => setSelected(isSelected ? null : c.pair)}
                  className={`p-4 border border-[var(--bb-border)] cursor-pointer transition-colors ${
                    isSelected ? "bg-[#1a1a1a] border-[var(--bb-orange)]" : "hover:bg-[#141414]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[var(--bb-yellow)]">{c.pair}</span>
                    <span className={`text-[10px] font-bold ${changePct >= 0 ? "gain" : "loss"}`}>
                      {changePct >= 0 ? "▲" : "▼"} {Math.abs(changePct).toFixed(3)}%
                    </span>
                  </div>
                  <div className="text-xl font-mono text-[var(--bb-text)] mb-2">
                    {c.rate > 1000
                      ? c.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : c.rate.toFixed(4)}
                  </div>
                  <div className={`text-xs font-mono ${c.change >= 0 ? "gain" : "loss"}`}>
                    {c.change >= 0 ? "+" : ""}
                    {c.change > 100 ? c.change.toFixed(2) : c.change.toFixed(4)}
                  </div>
                  {/* Mini sparkline */}
                  {sparkData.length > 2 && (
                    <div className="mt-2 h-8">
                      <Sparkline data={sparkData} positive={c.change >= 0} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-4 flex flex-col gap-2">
        <div className="panel">
          <div className="panel-header">
            <span>{selectedPair ? selectedPair.pair : "Select a Pair"}</span>
          </div>
          {selectedPair ? (
            <div className="p-4">
              <div className="text-3xl font-mono text-[var(--bb-text)] mb-4">
                {selectedPair.rate > 1000
                  ? selectedPair.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : selectedPair.rate.toFixed(4)}
              </div>
              <div className="space-y-3 text-xs">
                <DetailRow label="Change" value={selectedPair.change > 100 ? selectedPair.change.toFixed(2) : selectedPair.change.toFixed(4)} positive={selectedPair.change >= 0} />
                <DetailRow
                  label="Change %"
                  value={`${((selectedPair.change / (selectedPair.rate - selectedPair.change)) * 100).toFixed(3)}%`}
                  positive={selectedPair.change >= 0}
                />
                <DetailRow label="Bid" value={(selectedPair.rate - 0.0002).toFixed(4)} />
                <DetailRow label="Ask" value={(selectedPair.rate + 0.0002).toFixed(4)} />
                <DetailRow label="Spread" value="0.0004" />
                <DetailRow label="Day High" value={(selectedPair.rate + Math.abs(selectedPair.change) * 0.8).toFixed(4)} />
                <DetailRow label="Day Low" value={(selectedPair.rate - Math.abs(selectedPair.change) * 1.2).toFixed(4)} />
              </div>
              {/* Tick history */}
              {(history[selectedPair.pair] || []).length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] text-[var(--bb-muted)] uppercase tracking-wider mb-2">
                    Recent Ticks
                  </div>
                  <div className="h-20">
                    <Sparkline data={history[selectedPair.pair]} positive={selectedPair.change >= 0} large />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--bb-muted)] text-xs">
              Click a currency pair to view details
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header"><span>Cross Rates</span></div>
          <div className="p-3 text-xs">
            <table className="w-full">
              <thead>
                <tr className="text-[var(--bb-muted)]">
                  <th className="text-left py-1">From \ To</th>
                  <th className="text-right py-1">USD</th>
                  <th className="text-right py-1">EUR</th>
                  <th className="text-right py-1">GBP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--bb-border)]">
                  <td className="py-1 text-[var(--bb-yellow)]">USD</td>
                  <td className="text-right font-mono">1.0000</td>
                  <td className="text-right font-mono">0.9202</td>
                  <td className="text-right font-mono">0.7853</td>
                </tr>
                <tr className="border-t border-[var(--bb-border)]">
                  <td className="py-1 text-[var(--bb-yellow)]">EUR</td>
                  <td className="text-right font-mono">1.0867</td>
                  <td className="text-right font-mono">1.0000</td>
                  <td className="text-right font-mono">0.8535</td>
                </tr>
                <tr className="border-t border-[var(--bb-border)]">
                  <td className="py-1 text-[var(--bb-yellow)]">GBP</td>
                  <td className="text-right font-mono">1.2734</td>
                  <td className="text-right font-mono">1.1716</td>
                  <td className="text-right font-mono">1.0000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between border-b border-[var(--bb-border)] pb-1">
      <span className="text-[var(--bb-muted)]">{label}</span>
      <span className={`font-mono ${positive === true ? "gain" : positive === false ? "loss" : "text-[var(--bb-text)]"}`}>
        {value}
      </span>
    </div>
  );
}

