"use client";

import { useEffect, useState } from "react";

function getTimeInZone(tz: string): string {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getMarketStatus(tz: string, openHour: number, openMin: number, closeHour: number, closeMin: number): boolean {
  const now = new Date();
  const dayStr = now.toLocaleString("en-US", { timeZone: tz, weekday: "short" });
  if (dayStr === "Sat" || dayStr === "Sun") return false;
  const h = Number(now.toLocaleString("en-US", { timeZone: tz, hour: "numeric", hour12: false }));
  const m = Number(now.toLocaleString("en-US", { timeZone: tz, minute: "numeric" }));
  const total = h * 60 + m;
  return total >= openHour * 60 + openMin && total < closeHour * 60 + closeMin;
}

const MARKETS = [
  { label: "NYC", tz: "America/New_York", oh: 9, om: 30, ch: 16, cm: 0 },
  { label: "LON", tz: "Europe/London", oh: 8, om: 0, ch: 16, cm: 30 },
  { label: "TKY", tz: "Asia/Tokyo", oh: 9, om: 0, ch: 15, cm: 0 },
  { label: "HKG", tz: "Asia/Hong_Kong", oh: 9, om: 30, ch: 16, cm: 0 },
];

export default function StatusBar() {
  const [times, setTimes] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const update = () => {
      const t: Record<string, string> = {};
      const s: Record<string, boolean> = {};
      for (const m of MARKETS) {
        t[m.label] = getTimeInZone(m.tz);
        s[m.label] = getMarketStatus(m.tz, m.oh, m.om, m.ch, m.cm);
      }
      setTimes(t);
      setStatuses(s);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="flex items-center justify-between px-3 py-1 bg-[#080810] border-t border-[var(--bb-border)] text-[9px] font-mono">
      <div className="flex items-center gap-3">
        {MARKETS.map((m) => (
          <span key={m.label} className="flex items-center gap-1">
            <span className={`w-1 h-1 rounded-full inline-block ${statuses[m.label] ? "bg-[var(--bb-green)] live-dot" : "bg-[var(--bb-muted)]"}`} />
            <span className={statuses[m.label] ? "text-[var(--bb-green)]" : "text-[var(--bb-muted)]"}>{m.label}</span>
            <span className="text-[var(--bb-text)]">{times[m.label] || "--:--:--"}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[var(--bb-muted)]">
        <span><kbd className="text-[var(--bb-orange)]">/</kbd> Search</span>
        <span><kbd className="text-[var(--bb-orange)]">1-6</kbd> Views</span>
        <span><kbd className="text-[var(--bb-orange)]">ESC</kbd> Home</span>
        <span className="flex items-center gap-1">
          <span className="live-dot w-1 h-1 rounded-full bg-[var(--bb-green)] inline-block" />
          <span className="text-[var(--bb-green)]">CONNECTED</span>
        </span>
      </div>
    </footer>
  );
}
