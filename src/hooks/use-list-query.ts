"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ListParams, PaginatedResponse, SortDirection } from "@/types/common";

interface UseListQueryOptions<T> {
  fetcher: (params: ListParams) => Promise<PaginatedResponse<T>>;
  pageSize?: number;
  initialSortBy?: string;
  initialSortDir?: SortDirection;
  filters?: Record<string, string | undefined>;
  debounceMs?: number;
}

/**
 * Client-side list state shared by every CRUD module: debounced search,
 * sorting, pagination, filters, refresh, and request cancellation.
 */
export function useListQuery<T>({
  fetcher,
  pageSize = 10,
  initialSortBy,
  initialSortDir = "desc",
  filters,
  debounceMs = 300,
}: UseListQueryOptions<T>) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const filtersKey = JSON.stringify(filters ?? {});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortDir, setSortDir] = useState<SortDirection>(initialSortDir);
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<PaginatedResponse<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, debounceMs);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers a refetch.
  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    fetcherRef
      .current({
        page,
        pageSize,
        search: debouncedSearch.trim() || undefined,
        sortBy,
        sortDir,
        filters: JSON.parse(filtersKey) as Record<string, string | undefined>,
      })
      .then((response) => {
        if (!isActive) return;
        setResult(response);
      })
      .catch((caught: unknown) => {
        if (!isActive) return;
        setError(caught instanceof Error ? caught.message : "Something went wrong while loading data.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [page, pageSize, debouncedSearch, sortBy, sortDir, filtersKey, refreshKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new search or filter resets pagination.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filtersKey]);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  const toggleSort = useCallback(
    (columnId: string) => {
      if (sortBy !== columnId) {
        setSortBy(columnId);
        setSortDir("asc");
      } else {
        setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
      }
      setPage(1);
    },
    [sortBy],
  );

  return {
    rows: result?.data ?? [],
    total: result?.total ?? 0,
    page,
    pageSize,
    totalPages: result?.totalPages ?? 1,
    isLoading,
    error,
    search,
    sortBy,
    sortDir,
    setSearch,
    setPage,
    toggleSort,
    refresh,
  };
}
