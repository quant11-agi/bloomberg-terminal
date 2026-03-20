"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries, ColorType } from "lightweight-charts";
import { fetchChart, fetchQuote } from "@/lib/market-data";
import { StockQuote } from "@/lib/types";

const TIMEFRAMES = [
  { label: "1D", range: "1d" },
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
  const [activeTf, setActiveTf] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [candleCount, setCandleCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setStock(null);
    fetchQuote(symbol).then(setStock);
    const interval = setInterval(() => fetchQuote(symbol).then(setStock), 15000);
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    setLoading(true);
    setError(false);
    setCandleCount(0);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#12121c" },
        textColor: "#7a8a9a",
        fontFamily: "Consolas, Monaco, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e2a3a" },
        horzLines: { color: "#1e2a3a" },
      },
      crosshair: {
        vertLine: { color: "#ff9e2c", width: 1, style: 2 },
        horzLine: { color: "#ff9e2c", width: 1, style: 2 },
      },
      timeScale: { borderColor: "#1e2a3a", timeVisible: false },
      rightPriceScale: { borderColor: "#1e2a3a" },
      width: containerRef.current.clientWidth,
      height: 350,
    });

    chartRef.current = chart;

    fetchChart(symbol, TIMEFRAMES[activeTf].range)
      .then((candles) => {
        if (!chartRef.current) return;

        if (candles.length === 0) {
          setError(true);
          setLoading(false);
          return;
        }

        setCandleCount(candles.length);

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
          candles
            .filter((c) => c.volume > 0)
            .map((c) => ({
              time: c.time,
              value: c.volume,
              color: c.close >= c.open ? "rgba(0,210,106,0.3)" : "rgba(255,59,59,0.3)",
            })) as any
        );

        chart.timeScale().fitContent();
        setLoading(false);
      })
      .catch(() => {
        setError(true);
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
  }, [symbol, activeTf, retryKey]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <span className="text-[var(--bb-orange)] font-bold">{symbol}</span>
          {stock && (
            <>
              <span className="text-[var(--bb-text)] font-normal text-[10px]">{stock.name}</span>
              <span className="text-[var(--bb-text)] text-sm font-mono">{stock.price.toFixed(2)}</span>
              <span className={`text-[10px] font-bold ${stock.changePercent >= 0 ? "gain" : "loss"}`}>
                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!loading && candleCount > 0 && (
            <span className="text-[9px] text-[var(--bb-muted)] mr-2">{candleCount} bars</span>
          )}
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
      <div className="relative">
        <div ref={containerRef} className="w-full" />
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#12121c] bg-opacity-80">
            <div className="text-center">
              <div className="text-[var(--bb-orange)] text-xs mb-1">Loading chart...</div>
              <div className="text-[var(--bb-muted)] text-[10px]">{symbol} · {TIMEFRAMES[activeTf].label}</div>
            </div>
          </div>
        )}
        {/* Error state */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#12121c]" style={{ minHeight: 200 }}>
            <div className="text-center">
              <div className="text-[var(--bb-red)] text-xs mb-1">No chart data available</div>
              <div className="text-[var(--bb-muted)] text-[10px] mb-2">
                Could not load data for {symbol}
              </div>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="text-[10px] text-[var(--bb-orange)] hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
