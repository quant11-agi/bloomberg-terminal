"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchQuote } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";
import { useLiveData } from "@/lib/use-live-data";
import Chart from "@/components/Chart";

interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
}

export default function PortfolioView() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newCost, setNewCost] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bb-portfolio");
    if (saved) setPositions(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("bb-portfolio", JSON.stringify(positions));
  }, [positions]);

  // Fetch quotes for all positions
  useEffect(() => {
    if (positions.length === 0) return;
    const fetchAll = async () => {
      const results: Record<string, StockQuote> = {};
      await Promise.all(
        positions.map(async (p) => {
          const q = await fetchQuote(p.symbol);
          if (q) results[p.symbol] = q;
        })
      );
      setQuotes(results);
    };
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [positions]);

  const addPosition = () => {
    const sym = newSymbol.toUpperCase().trim();
    if (!sym || !newShares || !newCost) return;
    setPositions((prev) => {
      const existing = prev.find((p) => p.symbol === sym);
      if (existing) {
        const totalShares = existing.shares + Number(newShares);
        const totalCost = existing.shares * existing.avgCost + Number(newShares) * Number(newCost);
        return prev.map((p) =>
          p.symbol === sym ? { ...p, shares: totalShares, avgCost: totalCost / totalShares } : p
        );
      }
      return [...prev, { symbol: sym, shares: Number(newShares), avgCost: Number(newCost) }];
    });
    setNewSymbol("");
    setNewShares("");
    setNewCost("");
    setShowAdd(false);
  };

  const removePosition = (symbol: string) => {
    setPositions((prev) => prev.filter((p) => p.symbol !== symbol));
  };

  const totalValue = positions.reduce((sum, p) => {
    const q = quotes[p.symbol];
    return sum + (q ? q.price * p.shares : 0);
  }, 0);

  const totalCost = positions.reduce((sum, p) => sum + p.avgCost * p.shares, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const dayPnL = positions.reduce((sum, p) => {
    const q = quotes[p.symbol];
    return sum + (q ? q.change * p.shares : 0);
  }, 0);

  if (positions.length === 0 && !showAdd) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-[var(--bb-muted)] text-sm mb-2">No positions yet</div>
        <div className="text-[var(--bb-muted)] text-xs mb-4">Add stocks to track your portfolio performance</div>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-xs bg-[var(--bb-orange)] text-black rounded font-bold hover:opacity-90 transition-opacity">
          Add Position
        </button>
      </div>
    );
  }

  return (
    <div className="p-1 gap-1 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="panel">
          <div className="panel-header">
            <span>Portfolio</span>
            <button onClick={() => setShowAdd(!showAdd)}
              className="text-[10px] text-[var(--bb-blue)] hover:text-[var(--bb-orange)] transition-colors">
              + Add Position
            </button>
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-6 px-2 py-1.5 bg-[#161622] border-b border-[var(--bb-border)] text-[10px]">
            <span className="text-[var(--bb-muted)]">Value: <span className="text-[var(--bb-text)] font-mono">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
            <span className="text-[var(--bb-muted)]">Day P&L: <span className={`font-mono font-bold ${dayPnL >= 0 ? "gain" : "loss"}`}>{dayPnL >= 0 ? "+" : ""}${dayPnL.toFixed(2)}</span></span>
            <span className="text-[var(--bb-muted)]">Total P&L: <span className={`font-mono font-bold ${totalPnL >= 0 ? "gain" : "loss"}`}>{totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)} ({totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%)</span></span>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1a1a2e] border-b border-[var(--bb-border)]">
              <input value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} placeholder="Symbol"
                className="bg-[#0c0c14] border border-[var(--bb-border)] rounded px-2 py-1 text-xs text-[var(--bb-text)] w-20 font-mono focus:border-[var(--bb-orange)] focus:outline-none" />
              <input value={newShares} onChange={(e) => setNewShares(e.target.value)} placeholder="Shares" type="number"
                className="bg-[#0c0c14] border border-[var(--bb-border)] rounded px-2 py-1 text-xs text-[var(--bb-text)] w-20 font-mono focus:border-[var(--bb-orange)] focus:outline-none" />
              <input value={newCost} onChange={(e) => setNewCost(e.target.value)} placeholder="Avg Cost" type="number" step="0.01"
                className="bg-[#0c0c14] border border-[var(--bb-border)] rounded px-2 py-1 text-xs text-[var(--bb-text)] w-24 font-mono focus:border-[var(--bb-orange)] focus:outline-none" />
              <button onClick={addPosition} className="px-3 py-1 text-[10px] bg-[var(--bb-green)] text-black rounded font-bold">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-1 text-[10px] text-[var(--bb-muted)] hover:text-[var(--bb-text)]">Cancel</button>
            </div>
          )}

          {/* Positions table */}
          <div className="overflow-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[var(--bb-muted)] border-b border-[var(--bb-border)] bg-[#161622]">
                  <th className="text-left py-1 px-2 font-medium">Symbol</th>
                  <th className="text-right py-1 px-2 font-medium">Shares</th>
                  <th className="text-right py-1 px-2 font-medium">Avg Cost</th>
                  <th className="text-right py-1 px-2 font-medium">Price</th>
                  <th className="text-right py-1 px-2 font-medium">Mkt Value</th>
                  <th className="text-right py-1 px-2 font-medium">Day P&L</th>
                  <th className="text-right py-1 px-2 font-medium">Total P&L</th>
                  <th className="text-right py-1 px-2 font-medium">% Return</th>
                  <th className="py-1 px-1 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {
                  const q = quotes[pos.symbol];
                  const price = q?.price ?? 0;
                  const mktValue = price * pos.shares;
                  const dayPl = (q?.change ?? 0) * pos.shares;
                  const totalPl = (price - pos.avgCost) * pos.shares;
                  const pctReturn = pos.avgCost > 0 ? ((price - pos.avgCost) / pos.avgCost) * 100 : 0;

                  return (
                    <tr key={pos.symbol}
                      className={`border-b border-[var(--bb-border)] hover:bg-[#1a1a2e] cursor-pointer transition-colors ${selectedSymbol === pos.symbol ? "bg-[#1a1a2e]" : ""}`}
                      onClick={() => setSelectedSymbol(pos.symbol)}>
                      <td className="py-1 px-2">
                        <span className="font-bold text-[var(--bb-blue)]">{pos.symbol}</span>
                        {q && <div className="text-[9px] text-[var(--bb-muted)]">{q.name}</div>}
                      </td>
                      <td className="text-right py-1 px-2 font-mono">{pos.shares}</td>
                      <td className="text-right py-1 px-2 font-mono">${pos.avgCost.toFixed(2)}</td>
                      <td className="text-right py-1 px-2 font-mono">{price > 0 ? `$${price.toFixed(2)}` : "—"}</td>
                      <td className="text-right py-1 px-2 font-mono">${mktValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`text-right py-1 px-2 font-mono ${dayPl >= 0 ? "gain" : "loss"}`}>
                        {dayPl >= 0 ? "+" : ""}${dayPl.toFixed(2)}
                      </td>
                      <td className={`text-right py-1 px-2 font-mono ${totalPl >= 0 ? "gain" : "loss"}`}>
                        {totalPl >= 0 ? "+" : ""}${totalPl.toFixed(2)}
                      </td>
                      <td className="text-right py-1 px-2">
                        <span className={`inline-block px-1 py-0.5 rounded text-[9px] font-bold ${
                          pctReturn >= 0 ? "bg-[rgba(0,210,106,0.15)] text-[var(--bb-green)]" : "bg-[rgba(255,59,59,0.15)] text-[var(--bb-red)]"
                        }`}>
                          {pctReturn >= 0 ? "+" : ""}{pctReturn.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-1 px-1">
                        <button onClick={(e) => { e.stopPropagation(); removePosition(pos.symbol); }}
                          className="text-[var(--bb-muted)] hover:text-[var(--bb-red)] text-xs transition-colors" title="Remove">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-1">
        {selectedSymbol && <Chart symbol={selectedSymbol} />}
        {!selectedSymbol && positions.length > 0 && <Chart symbol={positions[0].symbol} />}
      </div>
    </div>
  );
}
