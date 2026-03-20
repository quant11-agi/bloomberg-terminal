"use client";

import { useCallback } from "react";
import { fetchSectors } from "@/lib/market-data";
import { SectorPerformance } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";

export default function SectorHeatmap() {
  const fetcher = useCallback(() => fetchSectors(), []);
  const { data: sectors, loading } = useLiveData<SectorPerformance[]>(fetcher, 30000);

  const sorted = [...(sectors || [])].sort((a, b) => b.changePercent - a.changePercent);
  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s.changePercent)), 0.5);

  return (
    <div className="panel">
      <div className="panel-header">
        <span>Sector Performance</span>
        {loading && !(sectors?.length) && <span className="text-[10px] text-[var(--bb-muted)]">Loading...</span>}
      </div>
      <div className="p-1.5 grid grid-cols-2 gap-1">
        {sorted.map((sector) => {
          const intensity = Math.min(Math.abs(sector.changePercent) / maxAbs, 1);
          const bg = sector.changePercent >= 0
            ? `rgba(0, 210, 106, ${0.1 + intensity * 0.3})`
            : `rgba(255, 59, 59, ${0.1 + intensity * 0.3})`;
          return (
            <div key={sector.sector} className="flex items-center justify-between px-2 py-1.5 rounded text-[11px]" style={{ background: bg }}>
              <span className="text-[var(--bb-text)] truncate mr-2">{sector.sector}</span>
              <span className={`font-mono font-bold ${sector.changePercent >= 0 ? "gain" : "loss"}`}>
                {sector.changePercent >= 0 ? "+" : ""}{sector.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
