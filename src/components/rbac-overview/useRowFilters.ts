/**
 * @file useRowFilters.ts
 * Toolbar filter state (kind + name text).
 */
import { useCallback, useMemo, useState } from 'react';

import { emptyRowFilters, hasActiveRowFilters, type RowFilters } from './filters';

export function useRowFilters(initialKinds: readonly string[] = []) {
  const [kinds, setKinds] = useState<Set<string>>(() => new Set(initialKinds));
  const [nameQuery, setNameQuery] = useState('');

  const filters: RowFilters = useMemo(() => ({ kinds, nameQuery }), [kinds, nameQuery]);

  const toggleKind = useCallback((kind: string, selected: boolean) => {
    setKinds((current) => {
      const next = new Set(current);
      if (selected) {
        next.add(kind);
      } else {
        next.delete(kind);
      }
      return next;
    });
  }, []);

  const clearKinds = useCallback(() => {
    setKinds(new Set());
  }, []);

  const clearAll = useCallback(() => {
    setKinds(new Set());
    setNameQuery('');
  }, []);

  const toolbarProps = useMemo(
    () => ({
      kinds,
      nameQuery,
      onNameQueryChange: setNameQuery,
      onKindToggle: toggleKind,
      onClearKinds: clearKinds,
      onClearAll: clearAll,
    }),
    [clearAll, clearKinds, kinds, nameQuery, toggleKind],
  );

  return {
    filters,
    kinds,
    nameQuery,
    setNameQuery,
    toggleKind,
    clearKinds,
    clearAll,
    toolbarProps,
    hasActiveFilters: hasActiveRowFilters(filters),
  };
}

export type UseRowFiltersResult = ReturnType<typeof useRowFilters>;

export { emptyRowFilters, hasActiveRowFilters };
