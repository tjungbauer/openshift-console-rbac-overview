/**
 * @file SccAccessTab.tsx
 * SCC direct and RBAC-use tables.
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
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';


import { ClusterRoleModel, modelGVK, SecurityContextConstraintsModel } from './constants';
import { filterSccOverviewRows, filterSccRbacUseRows, filterSccRows } from './filters';
import { RowFilterToolbar } from './RowFilterToolbar';
import { BindingResourceLink, SubjectResourceLink } from './ResourceLinks';
import { SortableTh } from './SortableTh';
import { TabContentGate } from './TabContentGate';
import { TabPermissionAlert } from './TabPermissionAlert';
import { useTabPermissions } from './useTabPermissions';
import { TableExportButton } from './TableExportButton';
import { TablePagination } from './TablePagination';
import {
  DEFAULT_SORT_SCC,
  DEFAULT_SORT_SCC_OVERVIEW,
  DEFAULT_SORT_SCC_RBAC,
  sortSccOverviewRows,
  sortSccRbacUseRows,
  sortSccRows,
} from './tableSort';
import { usePagination } from './usePagination';
import { useRbacUrlState } from './useRbacUrlState';
import { useRowFilters } from './useRowFilters';
import { useSccAccessTab } from './useSccAccessTab';
import { useTableSort } from './useTableSort';
import { K } from './i18nKeys';

type SccSection = 'overview' | 'direct' | 'rbac';

const sectionFromParams = (section?: string): SccSection => {
  if (section === 'direct' || section === 'rbac') {
    return section;
  }
  return 'overview';
};

export const SccAccessTab: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { params, updateParams } = useRbacUrlState();
  const { sccOverviewRows, rows, rbacUseRows, loaded, error } = useSccAccessTab();
  const [activeSection, setActiveSection] = useState<SccSection>(sectionFromParams(params.section));
  const permissions = useTabPermissions('scc');
  const overviewFilters = useRowFilters();
  const directFilters = useRowFilters();
  const rbacFilters = useRowFilters();

  const filteredOverviewRows = useMemo(
    () => filterSccOverviewRows(sccOverviewRows, overviewFilters.filters),
    [overviewFilters.filters, sccOverviewRows],
  );
  const filteredDirectRows = useMemo(
    () => filterSccRows(rows, directFilters.filters),
    [directFilters.filters, rows],
  );
  const filteredRbacRows = useMemo(
    () => filterSccRbacUseRows(rbacUseRows, rbacFilters.filters),
    [rbacFilters.filters, rbacUseRows],
  );

  const {
    sortBy: overviewSortBy,
    sortedRows: sortedOverviewRows,
    onSort: onOverviewSort,
  } = useTableSort(filteredOverviewRows, DEFAULT_SORT_SCC_OVERVIEW, sortSccOverviewRows);
  const {
    sortBy: directSortBy,
    sortedRows: sortedDirectRows,
    onSort: onDirectSort,
  } = useTableSort(filteredDirectRows, DEFAULT_SORT_SCC, sortSccRows);
  const {
    sortBy: rbacSortBy,
    sortedRows: sortedRbacRows,
    onSort: onRbacSort,
  } = useTableSort(filteredRbacRows, DEFAULT_SORT_SCC_RBAC, sortSccRbacUseRows);

  const overviewPagination = usePagination(sortedOverviewRows);
  const directPagination = usePagination(sortedDirectRows);
  const rbacPagination = usePagination(sortedRbacRows);

  useEffect(() => {
    setActiveSection(sectionFromParams(params.section));
  }, [params.section]);

  const onSectionChange = (section: SccSection) => {
    setActiveSection(section);
    updateParams({
      tab: 'scc',
      section: section === 'overview' ? undefined : section,
    });
  };

  const formatBoolean = (value: boolean) => (value ? t(K.common.yes) : t(K.common.no));

  const overviewExportColumns = [
    { header: t(K.column.scc), value: (row: (typeof sccOverviewRows)[number]) => row.name },
    { header: t(K.column.priority), value: (row: (typeof sccOverviewRows)[number]) => String(row.priority ?? '') },
    {
      header: t(K.column.privileged),
      value: (row: (typeof sccOverviewRows)[number]) => formatBoolean(row.allowPrivilegedContainer),
    },
    {
      header: t(K.column.hostNetwork),
      value: (row: (typeof sccOverviewRows)[number]) => formatBoolean(row.allowHostNetwork),
    },
    { header: t(K.column.runAsUser), value: (row: (typeof sccOverviewRows)[number]) => row.runAsUserType },
    { header: t(K.column.seLinux), value: (row: (typeof sccOverviewRows)[number]) => row.seLinuxContextType },
    { header: t(K.column.volumes), value: (row: (typeof sccOverviewRows)[number]) => row.volumes },
    {
      header: t(K.column.directSubjects),
      value: (row: (typeof sccOverviewRows)[number]) => String(row.directSubjectCount),
    },
  ];

  const directExportColumns = [
    { header: t(K.column.scc), value: (row: (typeof rows)[number]) => row.sccName },
    { header: t(K.column.priority), value: (row: (typeof rows)[number]) => String(row.priority ?? '') },
    { header: t(K.column.kind), value: (row: (typeof rows)[number]) => row.subjectKind },
    { header: t(K.column.subject), value: (row: (typeof rows)[number]) => row.displayName },
  ];

  const rbacExportColumns = [
    { header: t(K.column.clusterRole), value: (row: (typeof rbacUseRows)[number]) => row.clusterRoleName },
    { header: t(K.column.binding), value: (row: (typeof rbacUseRows)[number]) => row.bindingName },
    { header: t(K.column.kind), value: (row: (typeof rbacUseRows)[number]) => row.subjectKind },
    { header: t(K.column.subject), value: (row: (typeof rbacUseRows)[number]) => row.displayName },
  ];

  return (
    <TabContentGate tab="scc" permissions={permissions} loaded={loaded} error={error}>
      <div className="rbac-overview__tab-content">
      <TabPermissionAlert tab="scc" />
      <Alert variant="info" isInline title={t(K.scc.title)} className="rbac-overview__tab-intro">
        {t(K.tabIntro.scc,
        )}
      </Alert>
      <p className="rbac-overview__scc-summary">
        {t(K.scc.summary, { count: sccOverviewRows.length })}
      </p>
      <Tabs
        className="rbac-overview__inner-tabs"
        activeKey={activeSection}
        onSelect={(_event, section) => onSectionChange(section as SccSection)}
      >
        <Tab
          eventKey="overview"
          title={<TabTitleText>{t(K.scc.overviewTab)} ({sccOverviewRows.length})</TabTitleText>}
        >
          <RowFilterToolbar
            id="scc-overview"
            showKindFilter={false}
            exportAction={
              <TableExportButton
                id="scc-overview-export"
                filename="security-context-constraints.csv"
                rows={sortedOverviewRows}
                columns={overviewExportColumns}
              />
            }
            {...overviewFilters.toolbarProps}
          />
          {!sccOverviewRows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.scc.noSccs)}</EmptyStateBody>
            </EmptyState>
          ) : !sortedOverviewRows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.empty.noFilterMatches)}</EmptyStateBody>
            </EmptyState>
          ) : (
            <>
              <Table aria-label={t(K.scc.overviewTable)} variant="compact">
                <Thead>
                  <Tr>
                    <SortableTh columnIndex={0} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.scc)}
                    </SortableTh>
                    <SortableTh columnIndex={1} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.priority)}
                    </SortableTh>
                    <SortableTh columnIndex={2} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.privileged)}
                    </SortableTh>
                    <SortableTh columnIndex={3} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.hostNetwork)}
                    </SortableTh>
                    <SortableTh columnIndex={4} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.runAsUser)}
                    </SortableTh>
                    <SortableTh columnIndex={5} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.seLinux)}
                    </SortableTh>
                    <SortableTh columnIndex={6} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.volumes)}
                    </SortableTh>
                    <SortableTh columnIndex={7} sortBy={overviewSortBy} onSort={onOverviewSort}>
                      {t(K.column.directSubjects)}
                    </SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {overviewPagination.paginatedRows.map((row) => (
                    <Tr key={row.key}>
                      <Td>
                        <ResourceLink
                          groupVersionKind={modelGVK(SecurityContextConstraintsModel)}
                          name={row.name}
                        />
                      </Td>
                      <Td>{row.priority ?? '—'}</Td>
                      <Td>{formatBoolean(row.allowPrivilegedContainer)}</Td>
                      <Td>{formatBoolean(row.allowHostNetwork)}</Td>
                      <Td>{row.runAsUserType}</Td>
                      <Td>{row.seLinuxContextType}</Td>
                      <Td>{row.volumes}</Td>
                      <Td>{row.directSubjectCount}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <TablePagination id="scc-overview" {...overviewPagination} />
            </>
          )}
        </Tab>
        <Tab eventKey="direct" title={<TabTitleText>{t(K.scc.directTab)} ({rows.length})</TabTitleText>}>
          <RowFilterToolbar
            id="scc-access"
            exportAction={
              <TableExportButton
                id="scc-direct-export"
                filename="scc-direct-authorizations.csv"
                rows={sortedDirectRows}
                columns={directExportColumns}
              />
            }
            {...directFilters.toolbarProps}
          />
          {!rows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.scc.noDirectAuthorizations)}</EmptyStateBody>
            </EmptyState>
          ) : !sortedDirectRows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.empty.noFilterMatches)}</EmptyStateBody>
            </EmptyState>
          ) : (
            <>
              <Table aria-label={t(K.tab.scc)} variant="compact">
                <Thead>
                  <Tr>
                    <SortableTh columnIndex={0} sortBy={directSortBy} onSort={onDirectSort}>
                      {t(K.column.scc)}
                    </SortableTh>
                    <SortableTh columnIndex={1} sortBy={directSortBy} onSort={onDirectSort}>
                      {t(K.column.priority)}
                    </SortableTh>
                    <SortableTh columnIndex={2} sortBy={directSortBy} onSort={onDirectSort}>
                      {t(K.column.kind)}
                    </SortableTh>
                    <SortableTh columnIndex={3} sortBy={directSortBy} onSort={onDirectSort}>
                      {t(K.column.subject)}
                    </SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {directPagination.paginatedRows.map((row) => (
                    <Tr key={row.key}>
                      <Td>
                        <ResourceLink
                          groupVersionKind={modelGVK(SecurityContextConstraintsModel)}
                          name={row.sccName}
                        />
                      </Td>
                      <Td>{row.priority ?? '—'}</Td>
                      <Td>{row.subjectKind}</Td>
                      <Td>
                        <SubjectResourceLink
                          kind={row.subjectKind}
                          name={row.subjectName}
                          namespace={row.subjectNamespace}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <TablePagination id="scc-access" {...directPagination} />
            </>
          )}
        </Tab>
        <Tab eventKey="rbac" title={<TabTitleText>{t(K.scc.rbacTab)} ({rbacUseRows.length})</TabTitleText>}>
          <Alert variant="info" isInline title={t(K.scc.rbacSectionTitle)} className="rbac-overview__section-alert">
            {t(K.scc.rbacSectionBody,
            )}
          </Alert>
          <RowFilterToolbar
            id="scc-rbac-access"
            exportAction={
              <TableExportButton
                id="scc-rbac-export"
                filename="scc-rbac-use-grants.csv"
                rows={sortedRbacRows}
                columns={rbacExportColumns}
              />
            }
            {...rbacFilters.toolbarProps}
          />
          {!rbacUseRows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.scc.noRbacGrants)}</EmptyStateBody>
            </EmptyState>
          ) : !sortedRbacRows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.empty.noFilterMatches)}</EmptyStateBody>
            </EmptyState>
          ) : (
            <>
              <Table aria-label={t(K.scc.rbacTable)} variant="compact">
                <Thead>
                  <Tr>
                    <SortableTh columnIndex={0} sortBy={rbacSortBy} onSort={onRbacSort}>
                      {t(K.column.clusterRole)}
                    </SortableTh>
                    <SortableTh columnIndex={1} sortBy={rbacSortBy} onSort={onRbacSort}>
                      {t(K.column.binding)}
                    </SortableTh>
                    <SortableTh columnIndex={2} sortBy={rbacSortBy} onSort={onRbacSort}>
                      {t(K.column.kind)}
                    </SortableTh>
                    <SortableTh columnIndex={3} sortBy={rbacSortBy} onSort={onRbacSort}>
                      {t(K.column.subject)}
                    </SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {rbacPagination.paginatedRows.map((row) => (
                    <Tr key={row.key}>
                      <Td>
                        <ResourceLink groupVersionKind={modelGVK(ClusterRoleModel)} name={row.clusterRoleName} />
                      </Td>
                      <Td>
                        <BindingResourceLink bindingKind="ClusterRoleBinding" name={row.bindingName} />
                      </Td>
                      <Td>{row.subjectKind}</Td>
                      <Td>
                        <SubjectResourceLink
                          kind={row.subjectKind}
                          name={row.subjectName}
                          namespace={row.subjectNamespace}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <TablePagination id="scc-rbac-access" {...rbacPagination} />
            </>
          )}
        </Tab>
      </Tabs>
    </div>
    </TabContentGate>
  );
};
