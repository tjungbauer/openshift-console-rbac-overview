/**
 * @file ClusterAdminsTab.tsx
 * Table of elevated admin bindings (cluster and per-namespace).
 */
import {
  Alert,
  EmptyState,
  EmptyStateBody,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
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

import { filterClusterAdminRows } from './filters';
import {
  BindingResourceLink,
  NamespaceResourceLink,
  SubjectResourceLink,
} from './ResourceLinks';
import { RoleCell } from './RoleCell';
import { RoleRulesExpandedRow } from './RoleRulesToggle';
import { RowFilterToolbar } from './RowFilterToolbar';
import { SortableTh } from './SortableTh';
import { TabContentGate } from './TabContentGate';
import { TabPermissionAlert } from './TabPermissionAlert';
import { TableExportButton } from './TableExportButton';
import { TablePagination } from './TablePagination';
import { useTabPermissions } from './useTabPermissions';
import {
  DEFAULT_SORT_CLUSTER_WIDE,
  DEFAULT_SORT_NAMESPACE_ELEVATED,
  sortClusterWideAdminRows,
  sortNamespaceElevatedRows,
} from './tableSort';
import type { ClusterAdminRow } from './types';
import { useClusterAdminsTab } from './useClusterAdminsTab';
import { usePagination } from './usePagination';
import { useRbacUrlState } from './useRbacUrlState';
import { useRowFilters } from './useRowFilters';
import { useTableSort } from './useTableSort';
import { K } from './i18nKeys';

type ClusterAdminsSection = 'cluster-wide' | 'namespace-elevated';

type AdminTableProps = {
  rows: ClusterAdminRow[];
  emptyMessage: string;
  filteredEmptyMessage: string;
  toolbarId: string;
  rowFilters: ReturnType<typeof useRowFilters>;
  sensitiveRoleNames: Set<string>;
};

const ClusterWideAdminsTable: FC<AdminTableProps> = ({
  rows,
  emptyMessage,
  filteredEmptyMessage,
  toolbarId,
  rowFilters,
  sensitiveRoleNames,
}) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const [expandedRoleKey, setExpandedRoleKey] = useState<string | null>(null);
  const filteredRows = useMemo(
    () => filterClusterAdminRows(rows, rowFilters.filters),
    [rows, rowFilters.filters],
  );
  const { sortBy, sortedRows, onSort } = useTableSort(
    filteredRows,
    DEFAULT_SORT_CLUSTER_WIDE,
    sortClusterWideAdminRows,
  );
  const pagination = usePagination(sortedRows);
  const exportColumns = useMemo(
    () => [
      { header: t(K.column.kind), value: (row: ClusterAdminRow) => row.subjectKind },
      { header: t(K.column.name), value: (row: ClusterAdminRow) => row.subjectName },
      { header: t(K.column.role), value: (row: ClusterAdminRow) => row.roleName },
      { header: t(K.column.binding), value: (row: ClusterAdminRow) => row.bindingName },
    ],
    [t],
  );

  return (
    <>
      <RowFilterToolbar
        id={toolbarId}
        exportAction={
          <TableExportButton
            id={`${toolbarId}-export`}
            filename={`${toolbarId}.csv`}
            rows={sortedRows}
            columns={exportColumns}
          />
        }
        {...rowFilters.toolbarProps}
      />
      {!rows.length ? (
        <EmptyState>
          <EmptyStateBody>{emptyMessage}</EmptyStateBody>
        </EmptyState>
      ) : !sortedRows.length ? (
        <EmptyState>
          <EmptyStateBody>{filteredEmptyMessage}</EmptyStateBody>
        </EmptyState>
      ) : (
        <>
          <Table aria-label={t(K.clusterAdmins.clusterWideTable)} variant="compact">
            <Thead>
              <Tr>
                <SortableTh columnIndex={0} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.kind)}
                </SortableTh>
                <SortableTh columnIndex={1} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.name)}
                </SortableTh>
                <SortableTh columnIndex={2} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.role)}
                </SortableTh>
                <SortableTh columnIndex={3} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.binding)}
                </SortableTh>
              </Tr>
            </Thead>
            <Tbody>
              {pagination.paginatedRows.map((row) => {
                const rowKey = `${row.bindingName}/${row.subjectKind}/${row.subjectNamespace ?? ''}/${row.subjectName}`;
                return (
                  <Fragment key={rowKey}>
                    <Tr>
                      <Td>{row.subjectKind}</Td>
                      <Td>
                        <SubjectResourceLink
                          kind={row.subjectKind}
                          name={row.subjectName}
                          namespace={row.subjectNamespace}
                        />
                      </Td>
                      <RoleCell
                        roleKind={row.roleKind}
                        roleName={row.roleName}
                        namespace={row.namespace}
                        sensitiveRoleNames={sensitiveRoleNames}
                        expandedKey={expandedRoleKey}
                        onToggle={setExpandedRoleKey}
                      />
                      <Td>
                        <BindingResourceLink
                          bindingKind={row.bindingKind}
                          name={row.bindingName}
                          namespace={row.namespace}
                        />
                      </Td>
                    </Tr>
                    <RoleRulesExpandedRow
                      colSpan={4}
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
          <TablePagination id={toolbarId} {...pagination} />
        </>
      )}
    </>
  );
};

const NamespaceElevatedTable: FC<AdminTableProps> = ({
  rows,
  emptyMessage,
  filteredEmptyMessage,
  toolbarId,
  rowFilters,
  sensitiveRoleNames,
}) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const [expandedRoleKey, setExpandedRoleKey] = useState<string | null>(null);
  const filteredRows = useMemo(
    () => filterClusterAdminRows(rows, rowFilters.filters),
    [rows, rowFilters.filters],
  );
  const { sortBy, sortedRows, onSort } = useTableSort(
    filteredRows,
    DEFAULT_SORT_NAMESPACE_ELEVATED,
    sortNamespaceElevatedRows,
  );
  const pagination = usePagination(sortedRows);
  const exportColumns = useMemo(
    () => [
      { header: t(K.column.subject), value: (row: ClusterAdminRow) => row.subjectName },
      { header: t(K.column.role), value: (row: ClusterAdminRow) => row.roleName },
      { header: t(K.column.namespace), value: (row: ClusterAdminRow) => row.namespace ?? '' },
      { header: t(K.column.binding), value: (row: ClusterAdminRow) => row.bindingName },
    ],
    [t],
  );

  return (
    <>
      <RowFilterToolbar
        id={toolbarId}
        exportAction={
          <TableExportButton
            id={`${toolbarId}-export`}
            filename={`${toolbarId}.csv`}
            rows={sortedRows}
            columns={exportColumns}
          />
        }
        {...rowFilters.toolbarProps}
      />
      {!rows.length ? (
        <EmptyState>
          <EmptyStateBody>{emptyMessage}</EmptyStateBody>
        </EmptyState>
      ) : !sortedRows.length ? (
        <EmptyState>
          <EmptyStateBody>{filteredEmptyMessage}</EmptyStateBody>
        </EmptyState>
      ) : (
        <>
        <Table aria-label={t(K.clusterAdmins.namespaceElevatedSectionTitle)} variant="compact">
          <Thead>
            <Tr>
              <SortableTh columnIndex={0} sortBy={sortBy} onSort={onSort}>
                {t(K.column.subject)}
              </SortableTh>
              <SortableTh columnIndex={1} sortBy={sortBy} onSort={onSort}>
                {t(K.column.role)}
              </SortableTh>
              <SortableTh columnIndex={2} sortBy={sortBy} onSort={onSort}>
                {t(K.column.namespace)}
              </SortableTh>
              <SortableTh columnIndex={3} sortBy={sortBy} onSort={onSort}>
                {t(K.column.binding)}
              </SortableTh>
            </Tr>
          </Thead>
          <Tbody>
            {pagination.paginatedRows.map((row) => {
              const rowKey = `ns/${row.bindingName}/${row.namespace ?? ''}/${row.subjectKind}/${row.subjectName}`;
              return (
                <Fragment key={rowKey}>
                  <Tr>
                    <Td>
                      <SubjectResourceLink
                        kind={row.subjectKind}
                        name={row.subjectName}
                        namespace={row.subjectNamespace}
                      />
                    </Td>
                    <RoleCell
                      roleKind={row.roleKind}
                      roleName={row.roleName}
                      namespace={row.namespace}
                      sensitiveRoleNames={sensitiveRoleNames}
                      expandedKey={expandedRoleKey}
                      onToggle={setExpandedRoleKey}
                    />
                    <Td>
                      <NamespaceResourceLink name={row.namespace} />
                    </Td>
                    <Td>
                      <BindingResourceLink
                        bindingKind={row.bindingKind}
                        name={row.bindingName}
                        namespace={row.namespace}
                      />
                    </Td>
                  </Tr>
                  <RoleRulesExpandedRow
                    colSpan={4}
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
        <TablePagination id={toolbarId} {...pagination} />
        </>
      )}
    </>
  );
};

export const ClusterAdminsTab: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { params, updateParams } = useRbacUrlState();
  const activeSection: ClusterAdminsSection =
    params.section === 'namespace-elevated' ? 'namespace-elevated' : 'cluster-wide';
  const { clusterWideAdmins, namespaceElevated, sensitiveRoleNames, loaded, error } =
    useClusterAdminsTab();
  const permissions = useTabPermissions('cluster-admins');
  const clusterWideFilters = useRowFilters();
  const namespaceElevatedFilters = useRowFilters();

  const sectionCounts = useMemo(
    () => ({
      'cluster-wide': clusterWideAdmins.length,
      'namespace-elevated': namespaceElevated.length,
    }),
    [clusterWideAdmins.length, namespaceElevated.length],
  );

  const tableProps = {
    filteredEmptyMessage: t(K.empty.noFilterMatches),
  };

  return (
    <TabContentGate tab="cluster-admins" permissions={permissions} loaded={loaded} error={error}>
      <div className="rbac-overview__tab-content">
      <TabPermissionAlert tab="cluster-admins" />
      <Alert variant="info" isInline title={t(K.tab.clusterAdmins)} className="rbac-overview__tab-intro">
        {t(K.tabIntro.clusterAdmins,
          {
            labelKey: 'rbac-overview.io/elevated',
            labelValue: 'true',
          },
        )}
      </Alert>
      <Tabs
        mountOnEnter
        unmountOnExit
        className="rbac-overview__inner-tabs"
        activeKey={activeSection}
        onSelect={(_event, section) => {
          const next = section as ClusterAdminsSection;
          updateParams({
            tab: 'cluster-admins',
            section: next === 'cluster-wide' ? undefined : next,
          });
        }}
      >
        <Tab
          eventKey="cluster-wide"
          title={
            <TabTitleText>
              {t(K.clusterAdmins.clusterWideTab)} ({sectionCounts['cluster-wide']})
            </TabTitleText>
          }
        >
          <Alert
            variant="info"
            isInline
            title={t(K.clusterAdmins.clusterWideSectionTitle)}
            component="p"
            className="rbac-overview__section-alert"
          >
            {t(K.clusterAdmins.clusterWideSectionBody,
            )}
          </Alert>
          <ClusterWideAdminsTable
            rows={clusterWideAdmins}
            emptyMessage={t(K.clusterAdmins.noClusterWideBindings)}
            toolbarId="cluster-wide-admins"
            rowFilters={clusterWideFilters}
            sensitiveRoleNames={sensitiveRoleNames}
            {...tableProps}
          />
        </Tab>
        <Tab
          eventKey="namespace-elevated"
          title={
            <TabTitleText>
              {t(K.clusterAdmins.namespaceElevatedTab)} ({sectionCounts['namespace-elevated']})
            </TabTitleText>
          }
        >
          <Alert
            variant="warning"
            isInline
            title={t(K.clusterAdmins.namespaceElevatedSectionTitle)}
            component="p"
            className="rbac-overview__section-alert"
          >
            {t(K.clusterAdmins.namespaceElevatedSectionBody,
            )}
          </Alert>
          <NamespaceElevatedTable
            rows={namespaceElevated}
            emptyMessage={t(K.clusterAdmins.noNamespaceElevatedBindings)}
            toolbarId="namespace-elevated"
            rowFilters={namespaceElevatedFilters}
            sensitiveRoleNames={sensitiveRoleNames}
            {...tableProps}
          />
        </Tab>
      </Tabs>
    </div>
    </TabContentGate>
  );
};
