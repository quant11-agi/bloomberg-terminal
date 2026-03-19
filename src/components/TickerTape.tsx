"use client";

import { useEffect, useState } from "react";
import { getIndices } from "@/lib/market-data";
import { MarketIndex } from "@/lib/types";

export default function TickerTape() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);

  useEffect(() => {
    setIndices(getIndices());
    const interval = setInterval(() => setIndices(getIndices()), 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [...indices, ...indices]; // duplicate for seamless loop

  return (
    <div className="w-full overflow-hidden bg-[#0d0d0d] border-b border-[var(--bb-border)]">
      <div className="ticker-animate flex whitespace-nowrap py-1.5">
        {items.map((idx, i) => (
          <span key={`${idx.symbol}-${i}`} className="inline-flex items-center mx-4 text-xs">
            <span className="font-bold text-[var(--bb-orange)] mr-1.5">{idx.symbol}</span>
            <span className="text-[var(--bb-text)] mr-1.5">{idx.price.toLocaleString()}</span>
            <span className={idx.change >= 0 ? "gain" : "loss"}>
              {idx.change >= 0 ? "+" : ""}
              {idx.change.toFixed(2)} ({idx.changePercent >= 0 ? "+" : ""}
              {idx.changePercent.toFixed(2)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
