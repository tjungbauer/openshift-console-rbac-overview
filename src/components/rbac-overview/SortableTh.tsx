/**
 * @file SortableTh.tsx
 * PatternFly sortable column header.
 */
import { Th } from '@patternfly/react-table';
import type { ISortBy, OnSort } from '@patternfly/react-table';
import type { FC, ReactNode } from 'react';

type SortableThProps = {
  columnIndex: number;
  sortBy: ISortBy;
  onSort: OnSort;
  children: ReactNode;
};

export const SortableTh: FC<SortableThProps> = ({ columnIndex, sortBy, onSort, children }) => (
  <Th
    sort={{
      columnIndex,
      sortBy,
      onSort,
    }}
  >
    {children}
  </Th>
);
