"use client";

// Deterministic widths to avoid SSR hydration mismatches
const ROW_WIDTHS = [65, 45, 72, 55, 48, 60, 42, 70, 50, 58];
const CELL_WIDTHS = [75, 55, 80, 60, 70, 65, 85, 50, 90, 68];

export function PanelSkeleton({ rows = 5, title }: { rows?: number; title?: string }) {
  return (
    <div className="panel">
      {title && (
        <div className="panel-header">
          <span>{title}</span>
          <span className="text-[10px] text-[var(--bb-muted)]">Loading...</span>
        </div>
      )}
      <div className="p-3 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 bg-[#1a1a2e] rounded animate-pulse" style={{ width: `${ROW_WIDTHS[i % ROW_WIDTHS.length]}%` }} />
            <div className="h-3 bg-[#1a1a2e] rounded animate-pulse" style={{ width: `${20 + (i * 3) % 15}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-[var(--bb-border)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-2 px-3">
          <div className="h-3 bg-[#1a1a2e] rounded animate-pulse" style={{ width: `${CELL_WIDTHS[i % CELL_WIDTHS.length]}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border border-[var(--bb-border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3.5 bg-[#1a1a2e] rounded animate-pulse" style={{ width: `${ROW_WIDTHS[i % ROW_WIDTHS.length]}%` }} />
            <div className="h-3 bg-[#1a1a2e] rounded animate-pulse w-12" />
          </div>
          <div className="h-6 bg-[#1a1a2e] rounded animate-pulse w-24 mb-2" />
          <div className="h-3 bg-[#1a1a2e] rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

export function NewsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-3 py-2.5 border-b border-[var(--bb-border)]">
          <div className="h-3.5 bg-[#1a1a2e] rounded animate-pulse mb-1.5" style={{ width: `${ROW_WIDTHS[i % ROW_WIDTHS.length] + 20}%` }} />
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2.5 bg-[#1a1a2e] rounded animate-pulse w-14" />
            <div className="h-2.5 bg-[#1a1a2e] rounded animate-pulse w-10" />
            <div className="h-2.5 bg-[#1a1a2e] rounded animate-pulse w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}
