import { useState, useEffect, useCallback, useRef } from 'react';
import { backendFetch } from '../api/client-api-helpers';

export function useAdminFetch<T>(endpoint: string, initialFilter?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (filterVal?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const query = filterVal && filterVal !== 'all' ? `?status=${filterVal}` : '';
      const res = await backendFetch(`${endpoint}${query}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      setData(items);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData(initialFilter);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, initialFilter]);

  return { data, loading, error, refetch: fetchData };
}

