'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useUrlSearchParamsState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParam = useCallback(
    (key: string, defaultValue = ''): string => {
      return searchParams?.get(key) ?? defaultValue;
    },
    [searchParams]
  );

  const getNumberParam = useCallback(
    (key: string, defaultValue = 1): number => {
      const val = searchParams?.get(key);
      if (!val) return defaultValue;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    [searchParams]
  );

  const setParams = useCallback(
    (paramsToUpdate: Record<string, string | number | null | undefined>, options: { scroll?: boolean } = {}) => {
      const current = new URLSearchParams(Array.from(searchParams?.entries() ?? []));

      for (const [key, value] of Object.entries(paramsToUpdate)) {
        if (value === null || value === undefined || value === '') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      }

      const searchStr = current.toString();
      const query = searchStr ? `?${searchStr}` : '';
      router.push(`${pathname}${query}`, { scroll: options.scroll ?? false });
    },
    [searchParams, router, pathname]
  );

  return {
    searchParams,
    getParam,
    getNumberParam,
    setParams,
  };
}
