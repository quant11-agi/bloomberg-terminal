"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-[var(--bb-border)]">
      <div className="flex items-center gap-3">
        <div className="text-[var(--bb-orange)] font-bold text-lg tracking-wider">
          BLOOMBERG<span className="text-[var(--bb-text)]">TERMINAL</span>
        </div>
        <div className="flex items-center gap-1.5 ml-4">
          <span className="live-dot w-2 h-2 rounded-full bg-[var(--bb-green)] inline-block" />
          <span className="text-[10px] text-[var(--bb-green)] uppercase tracking-wider">Live</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {["Markets", "Equities", "Forex", "Commodities", "News"].map((item) => (
          <button
            key={item}
            className="px-3 py-1 text-[11px] uppercase tracking-wider text-[var(--bb-muted)] hover:text-[var(--bb-orange)] hover:bg-[#1a1a1a] rounded transition-colors"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="text-xs text-[var(--bb-muted)] font-mono">{time}</div>
    </header>
  );
}
