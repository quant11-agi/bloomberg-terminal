"use client";

import { useCallback } from "react";
import { fetchIndices } from "@/lib/market-data";
import { MarketIndex } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

interface Props {
  onSelectSymbol?: (symbol: string) => void;
}

export default function TickerTape({ onSelectSymbol }: Props) {
  const fetcher = useCallback(() => fetchIndices(), []);
  const { data: indices } = useLiveData<MarketIndex[]>(fetcher, 15000);

  if (!indices || indices.length === 0) return null;

  const items = [...indices, ...indices];

  return (
    <div className="w-full overflow-hidden bg-[#0a0a12] border-b border-[var(--bb-border)]">
      <div className="ticker-animate flex whitespace-nowrap py-1.5">
        {items.map((idx, i) => (
          <span key={`${idx.symbol}-${i}`} className={`inline-flex items-center mx-4 text-xs ${onSelectSymbol ? "cursor-pointer hover:opacity-80" : ""}`} onClick={() => onSelectSymbol?.(idx.symbol)}>
            <span className="font-bold text-[var(--bb-orange)] mr-1.5">{idx.symbol}</span>
            <span className="text-[var(--bb-text)] mr-1.5">
              {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
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
