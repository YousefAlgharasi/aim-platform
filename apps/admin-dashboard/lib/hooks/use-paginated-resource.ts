import { useState, useCallback, useRef, useEffect } from 'react';

type FetcherFn<T, F extends Record<string, unknown>> = (
  page: number,
  filters: F
) => Promise<{ data: T[]; total: number }>;

type UsePaginatedResourceOptions<T, F extends Record<string, unknown>> = {
  initialData?: T[];
  initialTotal?: number;
  initialPage?: number;
  initialFilters: F;
  fetcher: FetcherFn<T, F>;
  debounceMs?: number;
};

export function usePaginatedResource<T, F extends Record<string, unknown>>({
  initialData = [],
  initialTotal = 0,
  initialPage = 1,
  initialFilters,
  fetcher,
  debounceMs = 300,
}: UsePaginatedResourceOptions<T, F>) {
  const [data, setData] = useState<T[]>(initialData);
  const [total, setTotal] = useState<number>(initialTotal);
  const [page, setPage] = useState<number>(initialPage);
  const [filters, setFilters] = useState<F>(initialFilters);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const requestSeqRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const executeFetch = useCallback(
    async (targetPage: number, targetFilters: F) => {
      const currentSeq = ++requestSeqRef.current;
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(targetPage, targetFilters);
        if (isMountedRef.current && currentSeq === requestSeqRef.current) {
          setData(result.data);
          setTotal(result.total);
        }
      } catch (err) {
        if (isMountedRef.current && currentSeq === requestSeqRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      } finally {
        if (isMountedRef.current && currentSeq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [fetcher]
  );

  const updateFilter = useCallback(
    <K extends keyof F>(key: K, value: F[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
          setPage(1);
          executeFetch(1, next);
        }, debounceMs);

        return next;
      });
    },
    [executeFetch, debounceMs]
  );

  const setPageAndFetch = useCallback(
    (newPage: number) => {
      setPage(newPage);
      executeFetch(newPage, filters);
    },
    [executeFetch, filters]
  );

  const reload = useCallback(() => {
    executeFetch(page, filters);
  }, [executeFetch, page, filters]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    data,
    total,
    page,
    loading,
    error,
    filters,
    updateFilter,
    setPage: setPageAndFetch,
    reload,
  };
}

