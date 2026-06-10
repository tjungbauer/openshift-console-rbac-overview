/**
 * @file TablePagination.tsx
 * Pagination footer wired to usePagination.
 */
import { Pagination } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { PAGINATION_PER_PAGE_OPTIONS } from './usePagination';
import type { UsePaginationResult } from './usePagination';
import { K } from './i18nKeys';

type TablePaginationProps<T> = Pick<
  UsePaginationResult<T>,
  'page' | 'perPage' | 'total' | 'onSetPage' | 'onPerPageSelect'
> & {
  id: string;
};

export const TablePagination = <T,>({
  id,
  page,
  perPage,
  total,
  onSetPage,
  onPerPageSelect,
}: TablePaginationProps<T>) => {
  const { t } = useTranslation('plugin__rbac-overview');

  if (total <= PAGINATION_PER_PAGE_OPTIONS[0]) {
    return null;
  }

  return (
    <Pagination
      id={`rbac-pagination-${id}`}
      itemCount={total}
      page={page}
      perPage={perPage}
      onSetPage={onSetPage}
      onPerPageSelect={onPerPageSelect}
      perPageOptions={PAGINATION_PER_PAGE_OPTIONS.map((value) => ({
        title: String(value),
        value,
      }))}
      variant="bottom"
      titles={{
        paginationAriaLabel: t(K.pagination.label),
        itemsPerPage: t(K.pagination.itemsPerPage),
        page: t(K.pagination.page),
        currPageAriaLabel: t(K.pagination.currentPage),
      }}
    />
  );
};
