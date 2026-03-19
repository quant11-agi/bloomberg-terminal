"use client";

import { useEffect, useState, useMemo } from "react";
import { getStocks } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";

interface Props {
  onSelectSymbol?: (symbol: string) => void;
}

export default function MarketMovers({ onSelectSymbol }: Props) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);

  useEffect(() => {
    setStocks(getStocks());
    const interval = setInterval(() => setStocks(getStocks()), 3000);
    return () => clearInterval(interval);
  }, []);

  const { gainers, losers, mostActive } = useMemo(() => ({
    gainers: [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
    losers: [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
    mostActive: [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5),
  }), [stocks]);

  const MoverList = ({ title, items, color }: { title: string; items: StockQuote[]; color: string }) => (
    <div>
      <h3 className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${color}`}>{title}</h3>
      {items.map((s) => (
        <div
          key={s.symbol}
          className={`flex items-center justify-between py-1 text-xs border-b border-[var(--bb-border)] ${
            onSelectSymbol ? "cursor-pointer hover:bg-[#1a1a1a]" : ""
          } transition-colors`}
          onClick={() => onSelectSymbol?.(s.symbol)}
        >
          <span className="font-bold text-[var(--bb-blue)]">{s.symbol}</span>
          <span className="font-mono">{s.price.toFixed(2)}</span>
          <span className={`font-mono text-[10px] font-bold ${s.changePercent >= 0 ? "gain" : "loss"}`}>
            {s.changePercent >= 0 ? "+" : ""}
            {s.changePercent.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Market Movers</span>
      </div>
      <div className="p-3 grid grid-cols-3 gap-4">
        <MoverList title="Top Gainers" items={gainers} color="text-[var(--bb-green)]" />
        <MoverList title="Top Losers" items={losers} color="text-[var(--bb-red)]" />
        <MoverList title="Most Active" items={mostActive} color="text-[var(--bb-yellow)]" />
      </div>
    </div>
  );
}
