"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic hook for polling live data from async fetchers.
 * Handles loading, error, and previous-value tracking for flash animations.
 */
export function useLiveData<T>(
  fetcher: () => Promise<T | null>,
  intervalMs: number = 15000
): { data: T | null; loading: boolean; error: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        if (result !== null) {
          setData(result);
          setError(false);
        }
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) {
        setError(true);
        setLoading(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const interval = setInterval(refresh, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh, intervalMs]);

  return { data, loading, error, refresh };
}
