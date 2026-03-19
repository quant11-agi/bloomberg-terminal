"use client";

import { useEffect, useState } from "react";
import { getCommodities } from "@/lib/market-data";
import { CommodityQuote } from "@/lib/types";
import Sparkline from "@/components/Sparkline";

export default function CommoditiesView() {
  const [commodities, setCommodities] = useState<CommodityQuote[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    setCommodities(getCommodities());
    const interval = setInterval(() => {
      const data = getCommodities();
      setCommodities(data);
      setHistory((prev) => {
        const next = { ...prev };
        data.forEach((c) => {
          const arr = next[c.symbol] || [];
          next[c.symbol] = [...arr.slice(-49), c.price];
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectedComm = commodities.find((c) => c.symbol === selected);

  return (
    <div className="p-2 gap-2 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="panel">
          <div className="panel-header">
            <span>Commodities</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
            {commodities.map((c) => {
              const sparkData = history[c.symbol] || [];
              const isSelected = selected === c.symbol;
              return (
                <div
                  key={c.symbol}
                  onClick={() => setSelected(isSelected ? null : c.symbol)}
                  className={`p-4 border border-[var(--bb-border)] cursor-pointer transition-colors ${
                    isSelected ? "bg-[#1a1a1a] border-[var(--bb-orange)]" : "hover:bg-[#141414]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[var(--bb-text)]">{c.name}</span>
                    <span className="text-[10px] text-[var(--bb-muted)]">{c.symbol}</span>
                  </div>
                  <div className="text-2xl font-mono text-[var(--bb-text)] mb-1">
                    ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${c.change >= 0 ? "gain" : "loss"}`}>
                      {c.change >= 0 ? "+" : ""}
                      {c.change.toFixed(2)}
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.changePercent >= 0
                          ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]"
                          : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                      }`}
                    >
                      {c.changePercent >= 0 ? "+" : ""}
                      {c.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  {sparkData.length > 2 && (
                    <div className="mt-3 h-10">
                      <Sparkline data={sparkData} positive={c.change >= 0} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-2">
        <div className="panel">
          <div className="panel-header">
            <span>{selectedComm ? selectedComm.name : "Select a Commodity"}</span>
          </div>
          {selectedComm ? (
            <div className="p-4">
              <div className="text-3xl font-mono text-[var(--bb-text)] mb-1">
                ${selectedComm.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-sm font-mono mb-4 ${selectedComm.change >= 0 ? "gain" : "loss"}`}>
                {selectedComm.change >= 0 ? "+" : ""}
                {selectedComm.change.toFixed(2)} ({selectedComm.changePercent >= 0 ? "+" : ""}
                {selectedComm.changePercent.toFixed(2)}%)
              </div>
              <div className="space-y-3 text-xs">
                <InfoRow label="Symbol" value={selectedComm.symbol} />
                <InfoRow label="Day High" value={`$${(selectedComm.price + Math.abs(selectedComm.change) * 0.6).toFixed(2)}`} />
                <InfoRow label="Day Low" value={`$${(selectedComm.price - Math.abs(selectedComm.change) * 1.1).toFixed(2)}`} />
                <InfoRow label="Open" value={`$${(selectedComm.price - selectedComm.change).toFixed(2)}`} />
                <InfoRow label="Prev Close" value={`$${(selectedComm.price - selectedComm.change).toFixed(2)}`} />
              </div>
              {(history[selectedComm.symbol] || []).length > 2 && (
                <div className="mt-4">
                  <div className="text-[10px] text-[var(--bb-muted)] uppercase tracking-wider mb-2">
                    Price History
                  </div>
                  <div className="h-24">
                    <Sparkline data={history[selectedComm.symbol]} positive={selectedComm.change >= 0} large />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--bb-muted)] text-xs">
              Click a commodity to view details
            </div>
          )}
        </div>

        {/* Commodity futures */}
        <div className="panel">
          <div className="panel-header"><span>Futures Calendar</span></div>
          <div className="p-3 text-xs">
            {["Front Month", "2nd Month", "3rd Month", "6th Month"].map((label, i) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-[var(--bb-border)]">
                <span className="text-[var(--bb-muted)]">{label}</span>
                <span className="font-mono text-[var(--bb-text)]">
                  {selectedComm
                    ? `$${(selectedComm.price + (i - 1) * selectedComm.price * 0.005).toFixed(2)}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[var(--bb-border)] pb-1">
      <span className="text-[var(--bb-muted)]">{label}</span>
      <span className="font-mono text-[var(--bb-text)]">{value}</span>
    </div>
  );
}

