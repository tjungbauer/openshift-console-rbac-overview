/**
 * @file MyAccessPanel.tsx
 * Expandable summary of current user groups, namespaces, and bindings.
 */
import {
  Alert,
  Button,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { BindingsTable } from './BindingsTable';
import { GroupModel, modelGVK, ProjectModel, UserModel } from './constants';
import { SubjectIdentityPanel } from './SubjectIdentityPanel';
import { buildSubjectsTabPath } from './rbacLinks';
import { RbacNavLink } from './RbacNavLink';
import { TabErrorAlert } from './StateFeedback';
import { useTabPermissions } from './useTabPermissions';
import type { useMyAccess } from './useMyAccess';
import { K } from './i18nKeys';

type MyAccessPanelProps = {
  myAccess: ReturnType<typeof useMyAccess>;
  onUseInCanSubject: (username: string) => void;
};

export const MyAccessPanel: FC<MyAccessPanelProps> = ({ myAccess, onUseInCanSubject }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const subjectsTab = useTabPermissions('subjects');
  const {
    loading,
    error,
    username,
    apiGroups,
    openshiftGroups,
    namespaces,
    namespacesLoaded,
    bindingRows,
    bindingsLoaded,
    bindingsError,
    canListClusterRoleBindings,
  } = myAccess;

  if (loading) {
    return (
      <div className="rbac-overview__my-access-panel">
        <Spinner size="md" aria-label={t(K.myAccess.loading)} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rbac-overview__my-access-panel">
        <Alert variant="danger" isInline title={t(K.common.error)} component="p">
          {error}
        </Alert>
      </div>
    );
  }

  if (!username) {
    return null;
  }

  return (
    <div className="rbac-overview__my-access-panel">
      <Title headingLevel="h3" size="md">
        {t(K.myAccess.title)}
      </Title>
      <div className="rbac-overview__logged-in-as">
        <span>{t(K.myAccess.loggedInAs)}</span>
        <ResourceLink groupVersionKind={modelGVK(UserModel)} name={username} inline />
      </div>

      <div className="rbac-overview__my-access-actions">
        <Button variant="secondary" onClick={() => onUseInCanSubject(username)}>
          {t(K.myAccess.useInCanSubject)}
        </Button>
        {!subjectsTab.loading && subjectsTab.accessible ? (
          <RbacNavLink
            params={buildSubjectsTabPath('User', username)}
            className="pf-v6-c-button pf-m-secondary"
          >
            {t(K.myAccess.openInSubjects)}
          </RbacNavLink>
        ) : null}
      </div>

      <SubjectIdentityPanel kind="User" name={username} />

      <Title headingLevel="h4" size="md">
        {t(K.myAccess.groupMemberships)}
      </Title>
      {openshiftGroups.length ? (
        <ul>
          {openshiftGroups.map((group) => (
            <li key={group}>
              <ResourceLink groupVersionKind={modelGVK(GroupModel)} name={group} />
            </li>
          ))}
        </ul>
      ) : (
        <p>{t(K.myAccess.noGroupMemberships)}</p>
      )}

      {apiGroups.length ? (
        <>
          <Title headingLevel="h5" size="md">
            {t(K.myAccess.systemGroups)}
          </Title>
          <p className="rbac-overview__system-groups">{apiGroups.join(', ')}</p>
        </>
      ) : null}

      <Title headingLevel="h4" size="md" className="rbac-overview__namespaces-heading">
        {t(K.myAccess.namespacesYouCanAccess)}
      </Title>
      {!namespacesLoaded ? (
        <Spinner size="sm" aria-label={t(K.namespace.loading)} />
      ) : namespaces.length ? (
        <ul className="rbac-overview__namespace-list">
          {namespaces.map((namespace) => (
            <li key={namespace}>
              <ResourceLink groupVersionKind={modelGVK(ProjectModel)} name={namespace} />
            </li>
          ))}
        </ul>
      ) : (
        <p>{t(K.myAccess.noVisibleProjects)}</p>
      )}

      <Title headingLevel="h4" size="md">
        {t(K.myAccess.roleBindings)}
      </Title>
      {!canListClusterRoleBindings ? (
        <Alert variant="info" isInline title={t(K.myAccess.namespaceBindingsOnly)} className="rbac-overview__section-alert">
          {t(K.myAccess.clusterBindingsHidden,
          )}
        </Alert>
      ) : null}
      {!bindingsLoaded ? (
        <Spinner size="sm" aria-label={t(K.myAccess.loadingRoleBindings)} />
      ) : bindingsError ? (
        <TabErrorAlert error={bindingsError} />
      ) : (
        <BindingsTable
          rows={bindingRows}
          subject={{ kind: 'User', name: username, displayName: username }}
        />
      )}
    </div>
  );
};
