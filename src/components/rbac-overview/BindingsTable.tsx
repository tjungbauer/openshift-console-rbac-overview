/**
 * @file BindingsTable.tsx
 * Reusable sortable/filterable role binding table.
 */
import { EmptyState, EmptyStateBody, Label } from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Thead,
  Tr,
} from '@patternfly/react-table';
import type { FC } from 'react';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { filterBindingRows } from './filters';
import { BindingResourceLink, NamespaceResourceLink } from './ResourceLinks';
import { RoleCell } from './RoleCell';
import { RoleRulesExpandedRow } from './RoleRulesToggle';
import { RowFilterToolbar } from './RowFilterToolbar';
import { SortableTh } from './SortableTh';
import { TableExportButton } from './TableExportButton';
import { TablePagination } from './TablePagination';
import { DEFAULT_SORT_BINDINGS, sortBindingRows } from './tableSort';
import type { BindingsTableProps } from './types';
import { usePagination } from './usePagination';
import { usePluginConfig } from './usePluginConfig';
import { useRowFilters } from './useRowFilters';
import { useSensitiveRoles } from './useSensitiveRoles';
import { useTableSort } from './useTableSort';
import { K } from './i18nKeys';

export const BindingsTable: FC<BindingsTableProps> = ({ rows }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const rowFilters = useRowFilters();
  const { config } = usePluginConfig();
  const { sensitiveRoleNames } = useSensitiveRoles(config);
  const [expandedRoleKey, setExpandedRoleKey] = useState<string | null>(null);

  const filteredRows = useMemo(
    () => filterBindingRows(rows, rowFilters.filters),
    [rows, rowFilters.filters],
  );

  const { sortBy, sortedRows, onSort } = useTableSort(
    filteredRows,
    DEFAULT_SORT_BINDINGS,
    sortBindingRows,
  );

  const pagination = usePagination(sortedRows);

  const exportColumns = useMemo(
    () => [
      { header: t(K.column.binding), value: (row: (typeof rows)[number]) => row.bindingName },
      { header: t(K.column.scope), value: (row: (typeof rows)[number]) => row.scope },
      { header: t(K.column.namespace), value: (row: (typeof rows)[number]) => row.namespace ?? '' },
      { header: t(K.column.roleKind), value: (row: (typeof rows)[number]) => row.roleKind },
      { header: t(K.column.roleName), value: (row: (typeof rows)[number]) => row.roleName },
    ],
    [t],
  );

  if (!rows.length) {
    return <p>{t(K.subjects.noRoleBindings)}</p>;
  }

  return (
    <>
      <RowFilterToolbar
        id="subject-bindings"
        showKindFilter={false}
        exportAction={
          <TableExportButton
            id="subject-bindings-export"
            filename="role-bindings.csv"
            rows={sortedRows}
            columns={exportColumns}
          />
        }
        {...rowFilters.toolbarProps}
      />
      {!filteredRows.length ? (
        <EmptyState>
          <EmptyStateBody>{t(K.empty.noFilterMatches)}</EmptyStateBody>
        </EmptyState>
      ) : (
        <>
          <Table aria-label={t(K.subjects.roleBindingsTable)} variant="compact">
            <Thead>
              <Tr>
                <SortableTh columnIndex={0} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.binding)}
                </SortableTh>
                <SortableTh columnIndex={1} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.scope)}
                </SortableTh>
                <SortableTh columnIndex={2} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.namespace)}
                </SortableTh>
                <SortableTh columnIndex={3} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.roleKind)}
                </SortableTh>
                <SortableTh columnIndex={4} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.roleName)}
                </SortableTh>
              </Tr>
            </Thead>
            <Tbody>
              {pagination.paginatedRows.map((row) => {
                const rowKey = `${row.bindingKind}/${row.namespace ?? 'cluster'}/${row.bindingName}`;
                return (
                  <Fragment key={rowKey}>
                    <Tr>
                      <Td>
                        <BindingResourceLink
                          bindingKind={row.bindingKind}
                          name={row.bindingName}
                          namespace={row.namespace}
                        />
                      </Td>
                      <Td>
                        <Label color={row.scope === 'cluster' ? 'blue' : 'grey'}>
                          {row.scope === 'cluster' ? t(K.scope.cluster) : t(K.column.namespace)}
                        </Label>
                      </Td>
                      <Td>
                        <NamespaceResourceLink name={row.namespace} />
                      </Td>
                      <Td>{row.roleKind}</Td>
                      <RoleCell
                        roleKind={row.roleKind}
                        roleName={row.roleName}
                        namespace={row.namespace}
                        sensitiveRoleNames={sensitiveRoleNames}
                        expandedKey={expandedRoleKey}
                        onToggle={setExpandedRoleKey}
                      />
                    </Tr>
                    <RoleRulesExpandedRow
                      colSpan={5}
                      roleKind={row.roleKind}
                      roleName={row.roleName}
                      namespace={row.namespace}
                      expandedKey={expandedRoleKey}
                    />
                  </Fragment>
                );
              })}
            </Tbody>
          </Table>
          <TablePagination id="subject-bindings" {...pagination} />
        </>
      )}
    </>
  );
};
