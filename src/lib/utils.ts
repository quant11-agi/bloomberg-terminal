/**
 * Shared utility functions used across multiple components.
 */

/** Format a timestamp as a relative time string (e.g. "5m ago", "2h ago"). */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Format a volume number with K/M/B suffixes. */
export function formatVolume(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toString();
}

/** Format a market cap value with $T/$B/$M suffixes. */
export function formatMarketCap(v: number): string {
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(1) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
  return "$" + (v / 1e6).toFixed(0) + "M";
}

/** Category color mapping for news items. */
export const CATEGORY_COLORS: Record<string, string> = {
  technology: "text-[var(--bb-blue)]",
  economy: "text-[var(--bb-yellow)]",
  markets: "text-[var(--bb-green)]",
  commodities: "text-[var(--bb-orange)]",
  crypto: "text-purple-400",
  general: "text-[var(--bb-muted)]",
};
