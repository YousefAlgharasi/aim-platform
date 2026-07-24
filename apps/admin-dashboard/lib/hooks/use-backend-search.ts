import { useState, useCallback, useRef, useEffect } from 'react';
import { backendFetch } from '../api/client-api-helpers';

export function useBackendSearch<T>(endpointPrefix: string, resourceLabel: string) {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBySearch = useCallback(async (queryParam: string) => {
    const trimmed = queryParam.trim();
    if (!trimmed) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch(`${endpointPrefix}/${trimmed}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      setItems(data);
      setSearched(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : `Failed to load ${resourceLabel}.`);
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [endpointPrefix, resourceLabel]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const filtered = filter === 'all'
    ? items
    : items.filter((item) => (item as Record<string, unknown>).status === filter);

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    items,
    filtered,
    loading,
    error,
    searched,
    fetchBySearch,
  };
}

