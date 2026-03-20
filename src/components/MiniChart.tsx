"use client";

import { useEffect, useRef } from "react";
import { createChart, AreaSeries, ColorType } from "lightweight-charts";
import { fetchChart } from "@/lib/market-data";

interface Props {
  symbol: string;
  height?: number;
  positive?: boolean;
}

export default function MiniChart({ symbol, height = 150, positive = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#7a8a9a",
        fontFamily: "Consolas, Monaco, monospace",
        fontSize: 9,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "#1e2a3a" },
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      timeScale: { visible: false },
      rightPriceScale: { borderVisible: false },
      width: containerRef.current.clientWidth,
      height,
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    fetchChart(symbol, "1mo").then((candles) => {
      if (!chartRef.current || candles.length === 0) return;

      const color = positive ? "#00d26a" : "#ff3b3b";
      const series = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor: positive ? "rgba(0,210,106,0.2)" : "rgba(255,59,59,0.2)",
        bottomColor: "transparent",
        lineWidth: 2,
      });
      series.setData(
        candles.map((c) => ({ time: c.time, value: c.close })) as any
      );
      chart.timeScale().fitContent();
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
  }, [symbol, height, positive]);

  return <div ref={containerRef} className="w-full" />;
}
