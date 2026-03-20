"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from "lightweight-charts";
import { fetchChart, fetchQuote, ChartCandle } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";

const TIMEFRAMES = [
  { label: "1W", range: "5d" },
  { label: "1M", range: "1mo" },
  { label: "3M", range: "3mo" },
  { label: "6M", range: "6mo" },
  { label: "1Y", range: "1y" },
];

export default function Chart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [activeTf, setActiveTf] = useState(2); // 3M default
  const [loading, setLoading] = useState(true);

  // Fetch quote for header
  useEffect(() => {
    fetchQuote(symbol).then(setStock);
    const interval = setInterval(() => fetchQuote(symbol).then(setStock), 15000);
    return () => clearInterval(interval);
  }, [symbol]);

  // Fetch and render chart
  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    setLoading(true);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#111111" },
        textColor: "#888888",
        fontFamily: "Consolas, Monaco, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      crosshair: {
        vertLine: { color: "#ff8c00", width: 1, style: 2 },
        horzLine: { color: "#ff8c00", width: 1, style: 2 },
      },
      timeScale: { borderColor: "#2a2a2a", timeVisible: false },
      rightPriceScale: { borderColor: "#2a2a2a" },
      width: containerRef.current.clientWidth,
      height: 350,
    });

    chartRef.current = chart;

    fetchChart(symbol, TIMEFRAMES[activeTf].range).then((candles) => {
      if (!chartRef.current || candles.length === 0) {
        setLoading(false);
        return;
      }

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00d26a",
        downColor: "#ff3b3b",
        borderDownColor: "#ff3b3b",
        borderUpColor: "#00d26a",
        wickDownColor: "#ff3b3b",
        wickUpColor: "#00d26a",
      });
      candleSeries.setData(candles as any);

      // Volume histogram with real data
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeries.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(0,210,106,0.3)" : "rgba(255,59,59,0.3)",
        })) as any
      );

      chart.timeScale().fitContent();
      setLoading(false);
    });

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chart.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, activeTf]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span>{symbol}</span>
          {stock && (
            <>
              <span className="text-[var(--bb-text)] text-sm font-mono">{stock.price.toFixed(2)}</span>
              <span className={`text-[10px] font-bold ${stock.changePercent >= 0 ? "gain" : "loss"}`}>
                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </span>
            </>
          )}
          {loading && <span className="text-[10px] text-[var(--bb-muted)]">Loading...</span>}
        </div>
        <div className="flex items-center gap-0">
          {TIMEFRAMES.map((tf, i) => (
            <button key={tf.label} onClick={() => setActiveTf(i)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                activeTf === i ? "bg-[var(--bb-orange)] text-black" : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
              }`}>
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
