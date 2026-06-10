/**
 * @file NamespaceAccessTab.tsx
 * Namespace picker and bindings table for one namespace.
 */
import {
  Alert,
  EmptyState,
  EmptyStateBody,
  FormGroup,
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
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { filterNamespaceAccessRows, NAMESPACE_ACCESS_DEFAULT_KINDS } from './filters';
import { NamespacePicker } from './NamespacePicker';
import { BindingResourceLink, SubjectResourceLink } from './ResourceLinks';
import { RoleCell } from './RoleCell';
import { RoleRulesExpandedRow } from './RoleRulesToggle';
import { RowFilterToolbar } from './RowFilterToolbar';
import { SortableTh } from './SortableTh';
import { TableExportButton } from './TableExportButton';
import { TablePagination } from './TablePagination';
import { TabContentGate } from './TabContentGate';
import { TabPermissionAlert } from './TabPermissionAlert';
import { usePermissionNamespace } from './usePermissionNamespace';
import { useTabPermissions } from './useTabPermissions';
import { DEFAULT_SORT_NAMESPACE_ACCESS, sortNamespaceAccessRows } from './tableSort';
import type { NamespaceAccessRow } from './types';
import { useNamespaceAccessTab } from './useNamespaceAccessTab';
import { usePagination } from './usePagination';
import { useRbacUrlState } from './useRbacUrlState';
import { useRowFilters } from './useRowFilters';
import { useTableSort } from './useTableSort';
import { K } from './i18nKeys';

type NamespaceAccessSection = 'namespace' | 'cluster-wide';

const NamespaceAccessTable: FC<{
  rows: NamespaceAccessRow[];
  ariaLabel: string;
  emptyMessage: string;
  filteredEmptyMessage: string;
  toolbarId: string;
  rowFilters: ReturnType<typeof useRowFilters>;
  exportFilename: string;
}> = ({
  rows,
  ariaLabel,
  emptyMessage,
  filteredEmptyMessage,
  toolbarId,
  rowFilters,
  exportFilename,
}) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const [expandedRoleKey, setExpandedRoleKey] = useState<string | null>(null);
  const filteredRows = useMemo(
    () => filterNamespaceAccessRows(rows, rowFilters.filters),
    [rows, rowFilters.filters],
  );
  const { sortBy, sortedRows, onSort } = useTableSort(
    filteredRows,
    DEFAULT_SORT_NAMESPACE_ACCESS,
    sortNamespaceAccessRows,
  );
  const pagination = usePagination(sortedRows);

  const exportColumns = [
    { header: t(K.column.kind), value: (row: NamespaceAccessRow) => row.subjectKind },
    { header: t(K.column.subject), value: (row: NamespaceAccessRow) => row.subjectName },
    { header: t(K.column.binding), value: (row: NamespaceAccessRow) => row.bindingName },
    { header: t(K.column.role), value: (row: NamespaceAccessRow) => row.roleName },
  ];

  return (
    <>
      <RowFilterToolbar
        id={toolbarId}
        exportAction={
          <TableExportButton
            id={`${toolbarId}-export`}
            filename={exportFilename}
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
          <Table aria-label={ariaLabel} variant="compact">
            <Thead>
              <Tr>
                <SortableTh columnIndex={0} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.kind)}
                </SortableTh>
                <SortableTh columnIndex={1} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.subject)}
                </SortableTh>
                <SortableTh columnIndex={2} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.binding)}
                </SortableTh>
                <SortableTh columnIndex={3} sortBy={sortBy} onSort={onSort}>
                  {t(K.column.role)}
                </SortableTh>
              </Tr>
            </Thead>
            <Tbody>
              {pagination.paginatedRows.map((row) => {
                const rowKey = `${row.accessType}/${row.bindingName}/${row.subjectKind}/${row.subjectNamespace ?? ''}/${row.subjectName}/${row.roleName}`;
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
                      <Td>
                        <BindingResourceLink
                          bindingKind={row.bindingKind}
                          name={row.bindingName}
                          namespace={row.namespace}
                        />
                      </Td>
                      <RoleCell
                        roleKind={row.roleKind}
                        roleName={row.roleName}
                        namespace={row.namespace}
                        expandedKey={expandedRoleKey}
                        onToggle={setExpandedRoleKey}
                      />
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

export const NamespaceAccessTab: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { params, updateParams } = useRbacUrlState();
  const {
    effectiveNamespace,
    namespaceRows,
    clusterRows,
    namespaceSubjectCount,
    clusterSubjectCount,
    canListClusterRoleBindings,
    loaded,
    error,
    namespace,
    setNamespace,
  } = useNamespaceAccessTab();

  const selectedNamespace = namespace || effectiveNamespace;
  const [activeSection, setActiveSection] = useState<NamespaceAccessSection>(
    params.section === 'cluster-wide' ? 'cluster-wide' : 'namespace',
  );
  const { namespace: permissionNamespace } = usePermissionNamespace();
  const permissions = useTabPermissions('namespace-access', permissionNamespace);
  const namespaceFilters = useRowFilters(NAMESPACE_ACCESS_DEFAULT_KINDS);
  const clusterFilters = useRowFilters(NAMESPACE_ACCESS_DEFAULT_KINDS);

  useEffect(() => {
    if (params.section === 'cluster-wide' && activeSection !== 'cluster-wide') {
      setActiveSection('cluster-wide');
    }
  }, [activeSection, params.section]);

  useEffect(() => {
    if (!canListClusterRoleBindings && activeSection === 'cluster-wide') {
      setActiveSection('namespace');
    }
  }, [activeSection, canListClusterRoleBindings]);

  const filteredEmptyMessage = t(K.empty.noFilterMatches);

  return (
    <TabContentGate
      tab="namespace-access"
      permissions={permissions}
      loaded={loaded}
      error={error}
      permissionNamespace={permissionNamespace}
    >
      <div className="rbac-overview__tab-content">
      <TabPermissionAlert tab="namespace-access" namespace={permissionNamespace} />
      <Alert variant="info" isInline title={t(K.tab.namespaceAccess)} className="rbac-overview__tab-intro">
        {t(K.tabIntro.namespaceAccess,
        )}
      </Alert>

      <div className="rbac-overview__filter-row">
        <FormGroup label={t(K.column.namespace)} fieldId="namespace-access-namespace">
          <NamespacePicker
            id="namespace-access-namespace"
            value={selectedNamespace}
            onChange={setNamespace}
            allowEmpty
            emptyLabel={t(K.namespace.select)}
          />
        </FormGroup>
      </div>

      {!effectiveNamespace ? (
        <EmptyState>
          <EmptyStateBody>{t(K.namespaceAccess.selectPrompt)}</EmptyStateBody>
        </EmptyState>
      ) : (
        <Tabs
          mountOnEnter
          unmountOnExit
          className="rbac-overview__inner-tabs"
          activeKey={activeSection}
          onSelect={(_event, section) => {
            const next = section as NamespaceAccessSection;
            setActiveSection(next);
            updateParams({
              tab: 'namespace-access',
              namespace: effectiveNamespace,
              section: next === 'namespace' ? undefined : next,
            });
          }}
        >
          <Tab
            eventKey="namespace"
            title={
              <TabTitleText>
                {t(K.scope.inNamespace)} ({namespaceSubjectCount})
              </TabTitleText>
            }
          >
            <Alert
              variant="info"
              isInline
              title={t(K.namespaceAccess.bindingsIn, { namespace: effectiveNamespace })}
              component="p"
              className="rbac-overview__section-alert"
            >
              {t(K.namespaceAccess.namespaceSubjectCount,
                { count: namespaceSubjectCount },
              )}
            </Alert>
            <NamespaceAccessTable
              rows={namespaceRows}
              ariaLabel={t(K.namespaceAccess.namespaceRoleBindingsTable)}
              emptyMessage={t(K.namespaceAccess.noNamespaceRoleBindings)}
              filteredEmptyMessage={filteredEmptyMessage}
              toolbarId="namespace-access-in-namespace"
              rowFilters={namespaceFilters}
              exportFilename={`namespace-access-${effectiveNamespace}.csv`}
            />
          </Tab>
          {canListClusterRoleBindings ? (
            <Tab
              eventKey="cluster-wide"
              title={
                <TabTitleText>
                  {t(K.scope.clusterWide)} ({clusterSubjectCount})
                </TabTitleText>
              }
            >
              <Alert
                variant="warning"
                isInline
                title={t(K.namespaceAccess.clusterWideSectionTitle)}
                component="p"
                className="rbac-overview__section-alert"
              >
                {t(K.namespaceAccess.clusterWideSubjectCount,
                  { count: clusterSubjectCount, namespace: effectiveNamespace },
                )}
              </Alert>
              <NamespaceAccessTable
                rows={clusterRows}
                ariaLabel={t(K.namespaceAccess.clusterWideRoleBindingsTable)}
                emptyMessage={t(K.namespaceAccess.noClusterRoleBindings)}
                filteredEmptyMessage={filteredEmptyMessage}
                toolbarId="namespace-access-cluster-wide"
                rowFilters={clusterFilters}
                exportFilename={`cluster-wide-access-for-${effectiveNamespace}.csv`}
              />
            </Tab>
          ) : null}
        </Tabs>
      )}
    </div>
    </TabContentGate>
  );
};
