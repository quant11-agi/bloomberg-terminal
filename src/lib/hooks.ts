"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Custom hook for polling data at a regular interval.
 * Deduplicates fetch logic and handles cleanup automatically.
 */
export function usePolling<T>(
  fetcher: () => T | Promise<T>,
  intervalMs: number,
  deps: unknown[] = []
): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const result = await fetcher();
      if (!cancelled) setData(result);
    };

    update();
    const interval = setInterval(update, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);

  return data;
}

/**
 * Custom hook for tracking price history over time.
 * Stores up to `maxLength` data points per key.
 */
export function usePriceHistory<T>(
  data: T[] | null,
  keyFn: (item: T) => string,
  valueFn: (item: T) => number,
  maxLength: number = 50
): Record<string, number[]> {
  const historyRef = useRef<Record<string, number[]>>({});
  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (!data) return;
    const next = { ...historyRef.current };
    data.forEach((item) => {
      const key = keyFn(item);
      const arr = next[key] || [];
      next[key] = [...arr.slice(-(maxLength - 1)), valueFn(item)];
    });
    historyRef.current = next;
    setHistory(next);
  }, [data, keyFn, valueFn, maxLength]);

  return history;
}

/**
 * Stable callback wrapper for use in usePriceHistory.
 * Prevents unnecessary re-renders when passing inline functions.
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: unknown[]) => ref.current(...args), []) as T;
}
