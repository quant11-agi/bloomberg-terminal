"use client";

import { useCallback } from "react";
import { fetchCurrencies } from "@/lib/market-data";
import { CurrencyPair } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";
import { useState } from "react";
import MiniChart from "@/components/MiniChart";
import { CardGridSkeleton } from "@/components/LoadingSkeleton";

const PAIR_TO_YAHOO: Record<string, string> = {
  "EUR/USD": "EURUSD=X",
  "GBP/USD": "GBPUSD=X",
  "USD/JPY": "JPY=X",
  "USD/CHF": "CHF=X",
  "AUD/USD": "AUDUSD=X",
  "USD/CAD": "CADUSD=X",
  "USD/CNY": "CNY=X",
  "BTC/USD": "BTC-USD",
  "ETH/USD": "ETH-USD",
};

export default function ForexView() {
  const fetcher = useCallback(() => fetchCurrencies(), []);
  const { data: currencies, loading } = useLiveData<CurrencyPair[]>(fetcher, 15000);
  const [selected, setSelected] = useState<string | null>(null);

  const allCurrencies = currencies || [];
  const selectedPair = allCurrencies.find((c) => c.pair === selected);

  return (
    <div className="p-1 gap-1 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="panel">
          <div className="panel-header">
            <span>Foreign Exchange & Crypto</span>
            <span className="text-[10px] text-[var(--bb-muted)]">
              {loading ? "Loading..." : `${allCurrencies.length} pairs`}
            </span>
          </div>
          {loading && allCurrencies.length === 0 && <CardGridSkeleton count={9} />}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
            {allCurrencies.map((c) => {
              const isSelected = selected === c.pair;
              const changePct = c.rate !== 0 ? (c.change / (c.rate - c.change)) * 100 : 0;
              return (
                <div key={c.pair} onClick={() => setSelected(isSelected ? null : c.pair)}
                  className={`p-4 border border-[var(--bb-border)] cursor-pointer transition-colors ${
                    isSelected ? "bg-[#1a1a2e] border-[var(--bb-orange)]" : "hover:bg-[#161622]"
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[var(--bb-yellow)]">{c.pair}</span>
                    <span className={`text-[10px] font-bold ${changePct >= 0 ? "gain" : "loss"}`}>
                      {changePct >= 0 ? "▲" : "▼"} {Math.abs(changePct).toFixed(3)}%
                    </span>
                  </div>
                  <div className="text-xl font-mono text-[var(--bb-text)] mb-2">
                    {c.rate > 1000 ? c.rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : c.rate.toFixed(4)}
                  </div>
                  <div className={`text-xs font-mono ${c.change >= 0 ? "gain" : "loss"}`}>
                    {c.change >= 0 ? "+" : ""}{c.change > 100 ? c.change.toFixed(2) : c.change.toFixed(4)}
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
            <span>{selectedPair ? selectedPair.pair : "Select a Pair"}</span>
          </div>
          {selectedPair ? (
            <div className="p-4">
              <div className="text-3xl font-mono text-[var(--bb-text)] mb-1">
                {selectedPair.rate > 1000
                  ? selectedPair.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : selectedPair.rate.toFixed(4)}
              </div>
              <div className={`text-sm font-mono mb-3 ${selectedPair.change >= 0 ? "gain" : "loss"}`}>
                {selectedPair.change >= 0 ? "+" : ""}{selectedPair.change > 100 ? selectedPair.change.toFixed(2) : selectedPair.change.toFixed(4)}
                {" "}({((selectedPair.change / (selectedPair.rate - selectedPair.change)) * 100).toFixed(3)}%)
              </div>
              {PAIR_TO_YAHOO[selectedPair.pair] && (
                <div className="mb-3 rounded overflow-hidden border border-[var(--bb-border)]">
                  <MiniChart
                    symbol={PAIR_TO_YAHOO[selectedPair.pair]}
                    height={120}
                    positive={selectedPair.change >= 0}
                  />
                </div>
              )}
              <div className="space-y-3 text-xs">
                <DetailRow label="Bid" value={selectedPair.rate > 1000 ? (selectedPair.rate - 5).toFixed(2) : (selectedPair.rate - 0.0002).toFixed(4)} />
                <DetailRow label="Ask" value={selectedPair.rate > 1000 ? (selectedPair.rate + 5).toFixed(2) : (selectedPair.rate + 0.0002).toFixed(4)} />
                <DetailRow label="Spread" value={selectedPair.rate > 1000 ? "10.00" : "0.0004"} />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--bb-muted)] text-xs">Click a currency pair to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between border-b border-[var(--bb-border)] pb-1">
      <span className="text-[var(--bb-muted)]">{label}</span>
      <span className={`font-mono ${positive === true ? "gain" : positive === false ? "loss" : "text-[var(--bb-text)]"}`}>{value}</span>
    </div>
  );
}
