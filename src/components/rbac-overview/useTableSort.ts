/**
 * @file useTableSort.ts
 * PatternFly table sort state wired to table-sort.ts comparators.
 */
import type { ISortBy, OnSort } from '@patternfly/react-table';
import { useCallback, useMemo, useState } from 'react';

export function useTableSort<T>(
  rows: T[],
  defaultSort: ISortBy,
  sortFn: (items: T[], sortBy: ISortBy) => T[],
) {
  const [sortBy, setSortBy] = useState<ISortBy>(defaultSort);

  const sortedRows = useMemo(() => sortFn(rows, sortBy), [rows, sortBy, sortFn]);

  const onSort: OnSort = useCallback((_event, columnIndex, direction) => {
    setSortBy({ index: columnIndex, direction });
  }, []);

  return { sortBy, sortedRows, onSort };
}
