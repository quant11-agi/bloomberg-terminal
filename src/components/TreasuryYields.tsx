"use client";

import { useCallback } from "react";
import { useLiveData } from "@/lib/use-live-data";

interface TreasuryYield {
  label: string;
  yield: number;
  change: number;
  changePercent: number;
}

async function fetchTreasury(): Promise<TreasuryYield[]> {
  try {
    const res = await fetch("/api/treasury");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default function TreasuryYields() {
  const fetcher = useCallback(() => fetchTreasury(), []);
  const { data: yields, loading } = useLiveData<TreasuryYield[]>(fetcher, 30000);

  const allYields = yields || [];

  return (
    <div className="panel">
      <div className="panel-header">
        <span>US Treasury Yields</span>
        {loading && !yields && <span className="text-[10px] text-[var(--bb-muted)]">Loading...</span>}
      </div>
      <div className="p-1.5">
        {/* Yield curve visualization */}
        {allYields.length > 0 && (
          <div className="flex items-end justify-between gap-1 h-16 mb-1.5 px-1">
            {allYields.map((y) => {
              const maxYield = Math.max(...allYields.map((v) => v.yield), 1);
              const height = (y.yield / maxYield) * 100;
              return (
                <div key={y.label} className="flex flex-col items-center flex-1">
                  <span className="text-[8px] text-[var(--bb-text)] font-mono mb-0.5">
                    {y.yield.toFixed(2)}%
                  </span>
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${height}%`,
                      background: y.change >= 0
                        ? "linear-gradient(to top, rgba(0,210,106,0.3), rgba(0,210,106,0.6))"
                        : "linear-gradient(to top, rgba(255,59,59,0.3), rgba(255,59,59,0.6))",
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[8px] text-[var(--bb-muted)] mt-0.5">{y.label}</span>
                </div>
              );
            })}
          </div>
        )}
        {/* Data rows */}
        <table className="w-full text-[10px]">
          <tbody>
            {allYields.map((y) => (
              <tr key={y.label} className="border-b border-[var(--bb-border)]">
                <td className="py-0.5 px-1 font-bold text-[var(--bb-cyan)]">{y.label}</td>
                <td className="py-0.5 px-1 text-right font-mono text-[var(--bb-text)]">{y.yield.toFixed(3)}%</td>
                <td className={`py-0.5 px-1 text-right font-mono ${y.change >= 0 ? "gain" : "loss"}`}>
                  {y.change >= 0 ? "+" : ""}{y.change.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
