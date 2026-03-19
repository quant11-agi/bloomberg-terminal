"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ViewType = "dashboard" | "equities" | "forex" | "commodities" | "news" | "watchlist";

interface AppState {
  activeView: ViewType;
  setActiveView: (v: ViewType) => void;
  selectedSymbol: string;
  setSelectedSymbol: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load watchlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bb-watchlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setWatchlist(parsed);
      }
    } catch {
      // localStorage unavailable or corrupted data
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bb-watchlist", JSON.stringify(watchlist));
    } catch {
      // localStorage unavailable
    }
  }, [watchlist]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveView("dashboard");
        setSearchQuery("");
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.getElementById("bb-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedSymbol,
        setSelectedSymbol,
        searchQuery,
        setSearchQuery,
        watchlist,
        toggleWatchlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
