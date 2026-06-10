/**
 * @file SubjectsTab.tsx
 * Subject list and bindings for selected user/group/SA.
 */
import { Alert, Grid, GridItem, Title } from '@patternfly/react-core';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BindingsTable } from './BindingsTable';
import { filterSubjectListItems, SUBJECTS_DEFAULT_KINDS } from './filters';
import { buildCanSubjectPath } from './rbacLinks';
import { RbacNavLink } from './RbacNavLink';
import { subjectKey } from './rbac';
import { RowFilterToolbar } from './RowFilterToolbar';
import { SubjectKindLabel } from './SubjectKindLabel';
import { SubjectIdentityPanel } from './SubjectIdentityPanel';
import { TabContentGate } from './TabContentGate';
import { TabPermissionAlert } from './TabPermissionAlert';
import { useTabPermissions } from './useTabPermissions';
import type { SubjectKind, SubjectListItem } from './types';
import { useRbacUrlState } from './useRbacUrlState';
import { useRowFilters } from './useRowFilters';
import { useSubjectsTab } from './useSubjectsTab';
import { VirtualizedSubjectList } from './VirtualizedSubjectList';
import { K } from './i18nKeys';

const subjectFromParams = (
  kind?: SubjectKind,
  name?: string,
  subjectNamespace?: string,
): SubjectListItem | null => {
  if (!kind || !name) {
    return null;
  }
  if (kind === 'ServiceAccount') {
    return {
      kind,
      name,
      namespace: subjectNamespace,
      displayName: subjectNamespace ? `${subjectNamespace}/${name}` : name,
    };
  }
  return { kind, name, displayName: name };
};

export const SubjectsTab: FC = () => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { params, updateParams } = useRbacUrlState();
  const {
    selectedKey,
    allSubjects,
    apiSubjectCount,
    bindingSubjectCount,
    selectedSubject,
    bindingRows,
    loaded,
    error,
    setSelectedKey,
  } = useSubjectsTab();
  const rowFilters = useRowFilters(SUBJECTS_DEFAULT_KINDS);
  const permissions = useTabPermissions('subjects');
  const [deepLinkMissing, setDeepLinkMissing] = useState(false);

  const subjects = useMemo(
    () => filterSubjectListItems(allSubjects, rowFilters.filters),
    [allSubjects, rowFilters.filters],
  );

  useEffect(() => {
    const fromUrl = subjectFromParams(params.kind, params.name, params.subjectNamespace);
    if (!fromUrl) {
      setDeepLinkMissing(false);
      return;
    }
    const key = subjectKey(fromUrl);
    const exists = allSubjects.some((subject) => subjectKey(subject) === key);
    if (loaded && !exists) {
      setDeepLinkMissing(true);
      return;
    }
    setDeepLinkMissing(false);
    if (exists && selectedKey !== key) {
      setSelectedKey(key);
    }
  }, [allSubjects, loaded, params.kind, params.name, params.subjectNamespace, selectedKey, setSelectedKey]);

  const onSelectSubject = (subject: SubjectListItem) => {
    const key = subjectKey(subject);
    setSelectedKey(key);
    updateParams({
      tab: 'subjects',
      kind: subject.kind,
      name: subject.name,
      subjectNamespace: subject.namespace,
    });
  };

  return (
    <TabContentGate tab="subjects" permissions={permissions} loaded={loaded} error={error}>
      <div className="rbac-overview__tab-content">
      <TabPermissionAlert tab="subjects" />
      {deepLinkMissing ? (
        <Alert variant="warning" isInline title={t(K.subjects.notFoundTitle)} className="rbac-overview__section-alert">
          {t(K.subjects.notFoundBody)}
        </Alert>
      ) : null}
      <Alert variant="info" isInline title={t(K.tab.subjects)} className="rbac-overview__tab-intro">
        {t(K.tabIntro.subjects)}
      </Alert>
      <p className="rbac-overview__subjects-summary">
        {t(K.subjects.listCountDetail, {
          total: allSubjects.length,
          bindings: bindingSubjectCount,
          api: apiSubjectCount,
        })}
      </p>
      <RowFilterToolbar id="subjects" {...rowFilters.toolbarProps} />

      <Grid hasGutter className="rbac-overview__subjects-layout">
        <GridItem md={3} lg={3}>
          <div className="rbac-overview__subjects-panel rbac-overview__subjects-panel--list">
            <Title headingLevel="h3" size="md">
              {t(K.subjects.listTitle)} ({subjects.length})
            </Title>
            <VirtualizedSubjectList
              items={subjects}
              height={560}
              rowHeight={40}
              ariaLabel={t(K.subjects.listTitle)}
              getKey={(subject) => subjectKey(subject)}
              renderItem={(subject) => {
                const key = subjectKey(subject);
                const isSelected = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`rbac-overview__subject-item${
                      isSelected ? ' rbac-overview__subject-item--selected' : ''
                    }`}
                    onClick={() => onSelectSubject(subject)}
                  >
                    <SubjectKindLabel kind={subject.kind} className="rbac-overview__subject-kind" />
                    <span>{subject.displayName}</span>
                  </button>
                );
              }}
            />
            {!subjects.length ? (
              <p className="rbac-overview__subjects-empty">
                {allSubjects.length
                  ? t(K.empty.noFilterMatches)
                  : t(K.subjects.noSubjectsVisible)}
              </p>
            ) : null}
          </div>
        </GridItem>
        <GridItem md={9} lg={9}>
          <div className="rbac-overview__subjects-panel">
            <Title headingLevel="h3" size="md">
              {selectedSubject
                ? t(K.subjects.bindingsFor, { subject: selectedSubject.displayName })
                : t(K.subjects.selectSubject)}
            </Title>
            {selectedSubject ? (
              <>
                <SubjectIdentityPanel
                  kind={selectedSubject.kind}
                  name={selectedSubject.name}
                  namespace={selectedSubject.namespace}
                />
                <div className="rbac-overview__subjects-actions">
                  <RbacNavLink
                    params={buildCanSubjectPath({
                      subjectKind: selectedSubject.kind,
                      subjectName: selectedSubject.name,
                      subjectNamespace: selectedSubject.namespace,
                    })}
                    className="pf-v6-c-button pf-m-secondary"
                  >
                    {t(K.subjects.checkInWhoCan)}
                  </RbacNavLink>
                </div>
                <Title headingLevel="h4" size="md" className="rbac-overview__subjects-bindings-title">
                  {t(K.subjects.roleBindingsTable)} ({bindingRows.length})
                </Title>
                <BindingsTable rows={bindingRows} />
              </>
            ) : (
              <p>{t(K.subjects.selectPrompt)}</p>
            )}
          </div>
        </GridItem>
      </Grid>
    </div>
    </TabContentGate>
  );
};
