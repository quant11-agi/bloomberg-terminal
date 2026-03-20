"use client";

import { useCallback, useState } from "react";
import { fetchCommodities } from "@/lib/market-data";
import { CommodityQuote } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

export default function CommoditiesView() {
  const fetcher = useCallback(() => fetchCommodities(), []);
  const { data: commodities, loading } = useLiveData<CommodityQuote[]>(fetcher, 15000);
  const [selected, setSelected] = useState<string | null>(null);

  const allCommodities = commodities || [];
  const selectedComm = allCommodities.find((c) => c.symbol === selected);

  return (
    <div className="p-2 gap-2 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="panel">
          <div className="panel-header">
            <span>Commodities</span>
            <span className="text-[10px] text-[var(--bb-muted)]">{loading ? "Loading..." : `${allCommodities.length} instruments`}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
            {allCommodities.map((c) => {
              const isSelected = selected === c.symbol;
              return (
                <div key={c.symbol} onClick={() => setSelected(isSelected ? null : c.symbol)}
                  className={`p-4 border border-[var(--bb-border)] cursor-pointer transition-colors ${
                    isSelected ? "bg-[#1a1a1a] border-[var(--bb-orange)]" : "hover:bg-[#141414]"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[var(--bb-text)]">{c.name}</span>
                    <span className="text-[10px] text-[var(--bb-muted)]">{c.symbol}</span>
                  </div>
                  <div className="text-2xl font-mono text-[var(--bb-text)] mb-1">
                    ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono ${c.change >= 0 ? "gain" : "loss"}`}>
                      {c.change >= 0 ? "+" : ""}{c.change.toFixed(2)}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.changePercent >= 0 ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]" : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                    }`}>
                      {c.changePercent >= 0 ? "+" : ""}{c.changePercent.toFixed(2)}%
                    </span>
                  </div>
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
                {selectedComm.change >= 0 ? "+" : ""}{selectedComm.change.toFixed(2)} ({selectedComm.changePercent >= 0 ? "+" : ""}{selectedComm.changePercent.toFixed(2)}%)
              </div>
              <div className="space-y-3 text-xs">
                <InfoRow label="Symbol" value={selectedComm.symbol} />
                <InfoRow label="Open" value={`$${(selectedComm.price - selectedComm.change).toFixed(2)}`} />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--bb-muted)] text-xs">Click a commodity to view details</div>
          )}
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
