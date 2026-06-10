/**
 * @file WhoCanTab.tsx
 * Who-can and can-subject forms, results, and My access panel.
 */
import {
  Alert,
  Button,
  EmptyState,
  EmptyStateBody,
  Form,
  FormGroup,
  TextInput,
  Title,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { isAllNamespacesKey, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiGroupSelect } from './ApiGroupSelect';
import { ConsoleSingleSelect } from './ConsoleSingleSelect';
import { CanSubjectEvaluatedGroups, CanSubjectReason } from './CanSubjectReason';
import { GroupModel, modelGVK } from './constants';
import { filterWhoCanResultRows } from './filters';
import { NamespacePicker } from './NamespacePicker';
import { ResourceSelect } from './ResourceSelect';
import { WhoCanSubjectLink } from './ResourceLinks';
import { RowFilterToolbar } from './RowFilterToolbar';
import { SortableTh } from './SortableTh';
import { TableExportButton } from './TableExportButton';
import { TablePagination } from './TablePagination';
import {
  buildWhoCanResultRows,
  DEFAULT_SORT_WHO_CAN,
  sortWhoCanResultRows,
} from './tableSort';
import type { SubjectKind, WhoCanScope } from './types';
import { usePagination } from './usePagination';
import { useRbacUrlState } from './useRbacUrlState';
import { useRowFilters } from './useRowFilters';
import { useTableSort } from './useTableSort';
import { MyAccessPanel } from './MyAccessPanel';
import { TabPermissionAlert } from './TabPermissionAlert';
import { useMyAccess } from './useMyAccess';
import { useWhoCanTab } from './useWhoCanTab';
import { VerbSelect } from './VerbSelect';
import { K } from './i18nKeys';

const WHO_CAN_KIND_OPTIONS: SubjectKind[] = ['User', 'Group'];

export const WhoCanTab: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { params, updateParams } = useRbacUrlState();
  const {
    mode,
    scope,
    verb,
    resource,
    apiGroup,
    subresource,
    resourceName,
    namespace,
    subjectKind,
    subjectName,
    subjectNamespace,
    activeNamespace,
    permissionNamespace,
    error,
    whoCanStatus,
    canSubjectStatus,
    canSubjectEvaluatedGroups,
    setMode,
    setScope,
    setVerb,
    setResource,
    setApiGroup,
    setSubresource,
    setResourceName,
    setNamespace,
    setSubjectKind,
    setSubjectName,
    setSubjectNamespace,
    runQuery,
    queryRunning,
  } = useWhoCanTab(params, updateParams);
  const myAccess = useMyAccess();
  const rowFilters = useRowFilters();

  // Prefill can-subject from My access without auto-running (?run cleared).
  const onUseInCanSubject = (currentUsername: string) => {
    setMode('can-subject');
    setSubjectKind('User');
    setSubjectName(currentUsername);
    updateParams({
      tab: 'who-can',
      whoCanMode: 'can-subject',
      subjectKind: 'User',
      subjectName: currentUsername,
      run: undefined,
    });
  };

  const onModeChange = (value: string) => {
    const nextMode = value as 'who-can' | 'can-subject';
    setMode(nextMode);
    updateParams({ whoCanMode: nextMode, tab: 'who-can', run: undefined });
  };

  const onScopeChange = (value: string) => {
    setScope(value as WhoCanScope);
  };

  // Flatten API users/groups arrays into sortable table rows.
  const resultRows = useMemo(
    () => buildWhoCanResultRows(whoCanStatus?.users, whoCanStatus?.groups),
    [whoCanStatus?.groups, whoCanStatus?.users],
  );

  const filteredRows = useMemo(
    () => filterWhoCanResultRows(resultRows, rowFilters.filters),
    [resultRows, rowFilters.filters],
  );

  const { sortBy, sortedRows, onSort } = useTableSort(
    filteredRows,
    DEFAULT_SORT_WHO_CAN,
    sortWhoCanResultRows,
  );

  const pagination = usePagination(sortedRows);

  // Suggest the console project when scoped; All projects has no implicit namespace.
  const namespacePlaceholder =
    activeNamespace && !isAllNamespacesKey(activeNamespace)
      ? activeNamespace
      : t(K.whoCan.placeholderNamespace);

  const exportColumns = useMemo(
    () => [
      { header: t(K.column.kind), value: (row: { kind: string }) => row.kind },
      { header: t(K.column.name), value: (row: { name: string }) => row.name },
    ],
    [t],
  );

  return (
    <div className="rbac-overview__tab-content">
      <TabPermissionAlert tab="who-can" namespace={permissionNamespace} />
      <Alert variant="info" isInline title={t(K.tab.whoCan)} className="rbac-overview__tab-intro">
        {t(K.tabIntro.whoCan,
        )}
      </Alert>

      <div className="rbac-overview__my-access-toolbar">
        <Button variant="secondary" onClick={myAccess.toggleMyAccess}>
          {myAccess.open ? t(K.myAccess.hide) : t(K.myAccess.show)}
        </Button>
      </div>

      {myAccess.open ? (
        <MyAccessPanel myAccess={myAccess} onUseInCanSubject={onUseInCanSubject} />
      ) : null}

      <Form className="rbac-overview__filter-row">
        <FormGroup label={t(K.field.queryMode)} fieldId="who-can-mode">
          <ConsoleSingleSelect
            id="who-can-mode"
            value={mode}
            onChange={onModeChange}
            ariaLabel={t(K.field.queryMode)}
            options={[
              { value: 'who-can', label: t(K.tab.whoCan) },
              { value: 'can-subject', label: t(K.field.canSubject) },
            ]}
          />
        </FormGroup>
        <FormGroup label={t(K.column.scope)} fieldId="who-can-scope">
          <ConsoleSingleSelect
            id="who-can-scope"
            value={scope}
            onChange={(value) => onScopeChange(value as WhoCanScope)}
            ariaLabel={t(K.column.scope)}
            options={[
              { value: 'namespaced', label: t(K.scope.namespaced) },
              { value: 'cluster', label: t(K.scope.clusterScoped) },
            ]}
          />
        </FormGroup>
        <FormGroup label={t(K.field.verb)} fieldId="who-can-verb">
          <VerbSelect id="who-can-verb" value={verb} onChange={setVerb} />
        </FormGroup>
        <FormGroup label={t(K.field.resource)} fieldId="who-can-resource">
          <ResourceSelect id="who-can-resource" value={resource} onChange={setResource} />
        </FormGroup>
        <FormGroup label={t(K.field.apiGroup)} fieldId="who-can-api-group">
          <ApiGroupSelect id="who-can-api-group" value={apiGroup} onChange={setApiGroup} />
        </FormGroup>
        <FormGroup label={t(K.field.subresource)} fieldId="who-can-subresource">
          <TextInput
            id="who-can-subresource"
            value={subresource}
            placeholder={t(K.whoCan.placeholderSubresource)}
            onChange={(_event, value) => setSubresource(value)}
          />
        </FormGroup>
        <FormGroup label={t(K.field.resourceName)} fieldId="who-can-resource-name">
          <TextInput
            id="who-can-resource-name"
            value={resourceName}
            placeholder={t(K.whoCan.placeholderResourceName)}
            onChange={(_event, value) => setResourceName(value)}
          />
        </FormGroup>
        {scope === 'namespaced' ? (
          <FormGroup label={t(K.column.namespace)} fieldId="who-can-namespace">
            <NamespacePicker
              id="who-can-namespace"
              value={namespace}
              placeholder={namespacePlaceholder}
              onChange={setNamespace}
            />
          </FormGroup>
        ) : null}
        {mode === 'can-subject' ? (
          <>
            <FormGroup label={t(K.column.subjectKind)} fieldId="who-can-subject-kind">
              <ConsoleSingleSelect
                id="who-can-subject-kind"
                value={subjectKind}
                onChange={(value) => setSubjectKind(value as SubjectKind)}
                ariaLabel={t(K.column.subjectKind)}
                options={[
                  { value: 'User', label: t(K.subjectKind.user) },
                  { value: 'Group', label: t(K.subjectKind.group) },
                  { value: 'ServiceAccount', label: t(K.subjectKind.serviceAccount) },
                ]}
              />
            </FormGroup>
            <FormGroup label={t(K.column.subjectName)} fieldId="who-can-subject-name">
              <TextInput
                id="who-can-subject-name"
                value={subjectName}
                onChange={(_event, value) => setSubjectName(value)}
              />
            </FormGroup>
            {subjectKind === 'ServiceAccount' ? (
              <FormGroup label={t(K.whoCan.saNamespace)} fieldId="who-can-subject-namespace">
                <NamespacePicker
                  id="who-can-subject-namespace"
                  value={subjectNamespace}
                  placeholder={namespacePlaceholder}
                  onChange={setSubjectNamespace}
                />
              </FormGroup>
            ) : null}
          </>
        ) : null}
        <Button variant="primary" onClick={runQuery} isDisabled={queryRunning}>
          {queryRunning ? t(K.common.searching) : t(K.common.search)}
        </Button>
      </Form>

      {error && (
        <Alert variant="danger" isInline title={t(K.common.error)} component="p">
          {error}
        </Alert>
      )}

      {whoCanStatus && mode === 'who-can' && (
        <>
          <Title headingLevel="h3" size="md">
            {t(K.whoCan.resultsFor, {
              verb: whoCanStatus.verb ?? verb,
              resource: whoCanStatus.resource ?? resource,
            })}
            {whoCanStatus.namespace ? ` (${whoCanStatus.namespace})` : ''}
          </Title>

          {whoCanStatus.evaluationError && (
            <Alert variant="warning" isInline title={t(K.common.incompleteResult)} component="p">
              {whoCanStatus.evaluationError}
            </Alert>
          )}

          <RowFilterToolbar
            id="who-can-results"
            kindOptions={WHO_CAN_KIND_OPTIONS}
            exportAction={
              <TableExportButton
                id="who-can-results-export"
                filename="who-can-results.csv"
                rows={sortedRows}
                columns={exportColumns}
              />
            }
            {...rowFilters.toolbarProps}
          />

          {!resultRows.length ? (
            <p>{t(K.whoCan.noSubjects)}</p>
          ) : !sortedRows.length ? (
            <EmptyState>
              <EmptyStateBody>{t(K.empty.noFilterMatches)}</EmptyStateBody>
            </EmptyState>
          ) : (
            <>
              <Table aria-label={t(K.whoCan.resultsTable)} variant="compact">
                <Thead>
                  <Tr>
                    <SortableTh columnIndex={0} sortBy={sortBy} onSort={onSort}>
                      {t(K.column.kind)}
                    </SortableTh>
                    <SortableTh columnIndex={1} sortBy={sortBy} onSort={onSort}>
                      {t(K.column.name)}
                    </SortableTh>
                  </Tr>
                </Thead>
                <Tbody>
                  {pagination.paginatedRows.map((row) => (
                    <Tr key={row.key}>
                      <Td>{row.kind}</Td>
                      <Td>
                        {/* Groups are cluster-scoped OpenShift API objects; users link to Subjects tab. */}
                        {row.kind === 'Group' ? (
                          <ResourceLink groupVersionKind={modelGVK(GroupModel)} name={row.name} />
                        ) : (
                          <WhoCanSubjectLink name={row.name} />
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <TablePagination id="who-can-results" {...pagination} />
            </>
          )}
        </>
      )}

      {canSubjectStatus && mode === 'can-subject' && (
        <>
          <Title headingLevel="h3" size="md">
            {t(K.canSubject.result)}
          </Title>
          <Alert
            variant={canSubjectStatus.allowed ? 'success' : 'warning'}
            isInline
            title={canSubjectStatus.allowed ? t(K.canSubject.allowed) : t(K.canSubject.notAllowed)}
            className="rbac-overview__section-alert"
          >
            <CanSubjectReason reason={canSubjectStatus.reason} />
          </Alert>
          {canSubjectEvaluatedGroups?.length ? (
            <Alert variant="info" isInline title={t(K.canSubject.groupMembershipsIncluded)} component="div">
              <CanSubjectEvaluatedGroups groups={canSubjectEvaluatedGroups} />
            </Alert>
          ) : subjectKind === 'User' ? (
            <Alert variant="info" isInline title={t(K.canSubject.groupMembershipsIncluded)} component="div">
              {t(K.canSubject.noGroupsForUser,
              )}
            </Alert>
          ) : null}
          {canSubjectStatus.evaluationError && (
            <Alert variant="warning" isInline title={t(K.common.incompleteResult)} component="p">
              {canSubjectStatus.evaluationError}
            </Alert>
          )}
        </>
      )}
    </div>
  );
};
