"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from "lightweight-charts";
import { generateCandles, getStocks } from "@/lib/market-data";

const TIMEFRAMES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

export default function Chart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const [stock, setStock] = useState(() => getStocks().find((s) => s.symbol === symbol));
  const [activeTf, setActiveTf] = useState(2); // 3M default

  useEffect(() => {
    const interval = setInterval(() => {
      setStock(getStocks().find((s) => s.symbol === symbol));
    }, 2500);
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

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

    const candles = generateCandles(symbol, TIMEFRAMES[activeTf].days);

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00d26a",
      downColor: "#ff3b3b",
      borderDownColor: "#ff3b3b",
      borderUpColor: "#00d26a",
      wickDownColor: "#ff3b3b",
      wickUpColor: "#00d26a",
    });
    candleSeries.setData(candles as any);

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
        value: Math.floor(Math.random() * 50000000) + 10000000,
        color: c.close >= c.open ? "rgba(0,210,106,0.3)" : "rgba(255,59,59,0.3)",
      })) as any
    );

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
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
                {stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
            </>
          )}
        </div>
        {/* Timeframe selector */}
        <div className="flex items-center gap-0">
          {TIMEFRAMES.map((tf, i) => (
            <button
              key={tf.label}
              onClick={() => setActiveTf(i)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                activeTf === i
                  ? "bg-[var(--bb-orange)] text-black"
                  : "text-[var(--bb-muted)] hover:text-[var(--bb-text)]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
