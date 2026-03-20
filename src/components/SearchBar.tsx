"use client";

import { useState, useEffect, useRef } from "react";
import { searchSymbols, SearchResult } from "@/lib/market-data";

interface Props {
  onSelectSymbol: (symbol: string) => void;
  onQueryChange: (q: string) => void;
}

export default function SearchBar({ onSelectSymbol, onQueryChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Expose the input to external focus (/ shortcut)
  useEffect(() => {
    const el = document.getElementById("bb-search");
    if (el && inputRef.current && el !== inputRef.current) {
      // Replace the old element reference
    }
  }, []);

  useEffect(() => {
    onQueryChange(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchSymbols(query);
      setResults(res);
      setIsOpen(res.length > 0);
      setLoading(false);
      setSelectedIndex(-1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      selectResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const selectResult = (result: SearchResult) => {
    onSelectSymbol(result.symbol);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const typeColors: Record<string, string> = {
    EQUITY: "text-[var(--bb-blue)]",
    ETF: "text-[var(--bb-green)]",
    INDEX: "text-[var(--bb-orange)]",
    CRYPTOCURRENCY: "text-purple-400",
    CURRENCY: "text-[var(--bb-yellow)]",
    FUTURE: "text-[var(--bb-orange)]",
  };

  return (
    <div ref={containerRef} className="hidden md:block relative">
      <input
        ref={inputRef}
        id="bb-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search symbols... ( / )"
        className="bg-[#1a1a1a] border border-[var(--bb-border)] rounded px-3 py-1 text-xs text-[var(--bb-text)] w-64 focus:border-[var(--bb-orange)] focus:outline-none placeholder:text-[var(--bb-muted)] font-mono"
      />
      {query && (
        <button onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--bb-muted)] hover:text-[var(--bb-text)] text-xs">
          ×
        </button>
      )}
      {loading && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-[var(--bb-muted)]">...</div>
      )}

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bb-panel)] border border-[var(--bb-border)] rounded shadow-lg z-50 max-h-80 overflow-auto">
          {results.map((result, i) => (
            <div key={result.symbol}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                i === selectedIndex ? "bg-[#1a1a1a]" : "hover:bg-[#141414]"
              }`}
              onClick={() => selectResult(result)}
              onMouseEnter={() => setSelectedIndex(i)}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[var(--bb-text)]">{result.symbol}</span>
                <span className="text-[10px] text-[var(--bb-muted)] truncate max-w-[160px]">{result.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] uppercase font-bold ${typeColors[result.type] || "text-[var(--bb-muted)]"}`}>
                  {result.type}
                </span>
                <span className="text-[9px] text-[var(--bb-muted)]">{result.exchange}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
