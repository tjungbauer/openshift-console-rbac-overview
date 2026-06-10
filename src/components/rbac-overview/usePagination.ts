/**
 * @file usePagination.ts
 * Page index and per-page for client-side table pagination.
 */
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

export const PAGINATION_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

export function usePagination<T>(rows: T[], defaultPerPage = 20) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const total = rows.length;

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return rows.slice(start, start + perPage);
  }, [page, perPage, rows]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / perPage) || 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, perPage, total]);

  const onSetPage = (
    _event: ReactMouseEvent | KeyboardEvent | MouseEvent,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const onPerPageSelect = (
    _event: ReactMouseEvent | KeyboardEvent | MouseEvent,
    newPerPage: number,
  ) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  return {
    page,
    perPage,
    paginatedRows,
    total,
    onSetPage,
    onPerPageSelect,
  };
}

export type UsePaginationResult<T> = ReturnType<typeof usePagination<T>>;
