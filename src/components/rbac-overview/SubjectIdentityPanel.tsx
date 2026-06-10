/**
 * @file SubjectIdentityPanel.tsx
 * User/Group detail panel (identities, members).
 */
import { Alert, Spinner, Title } from '@patternfly/react-core';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { GroupModel, modelGVK, UserModel } from './constants';
import { formatUserIdentities, type OpenShiftGroup, type OpenShiftUser } from './identity';
import { TabErrorAlert } from './StateFeedback';
import { isWatchSettled } from './watchState';
import type { SubjectKind } from './types';
import { K } from './i18nKeys';

type SubjectIdentityPanelProps = {
  kind: SubjectKind;
  name: string;
  namespace?: string;
};

export const SubjectIdentityPanel: FC<SubjectIdentityPanelProps> = ({ kind, name, namespace }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  const userWatch =
    kind === 'User'
      ? {
          groupVersionKind: modelGVK(UserModel),
          name,
          isList: false,
          namespaced: false,
        }
      : null;

  const groupWatch =
    kind === 'Group'
      ? {
          groupVersionKind: modelGVK(GroupModel),
          name,
          isList: false,
          namespaced: false,
        }
      : null;

  const [userData, userLoaded, userError] = useK8sWatchResource(userWatch);
  const [groupData, groupLoaded, groupError] = useK8sWatchResource(groupWatch);

  if (kind === 'ServiceAccount') {
    return (
      <Alert variant="info" isInline title={t(K.identity.serviceAccountTitle)}>
        {t(K.identity.serviceAccountBody, {
          namespace: namespace ?? '—',
          name,
        })}
      </Alert>
    );
  }

  if (kind === 'User') {
    if (!isWatchSettled(userLoaded, userError)) {
      return <Spinner size="md" aria-label={t(K.identity.loadingUser)} />;
    }
    if (userError) {
      return <TabErrorAlert error={userError} />;
    }

    const user = userData as OpenShiftUser | undefined;
    const identities = formatUserIdentities(user);
    const groups = user?.groups ?? [];

    return (
      <div className="rbac-overview__identity-panel">
        <div className="rbac-overview__identity-heading">
          <Title headingLevel="h4" size="md" className="rbac-overview__identity-heading-title">
            {t(K.identity.userTitle)}
          </Title>
          {user?.fullName ? (
            <span className="rbac-overview__identity-heading-value">{user.fullName}</span>
          ) : null}
        </div>
        {identities.length ? (
          <>
            <Title headingLevel="h5" size="md">
              {t(K.identity.identityProviders)}
            </Title>
            <ul>
              {identities.map((identity) => (
                <li key={identity}>{identity}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>{t(K.identity.noIdpMappings)}</p>
        )}
        {groups.length ? (
          <>
            <Title headingLevel="h5" size="md">
              {t(K.myAccess.groupMemberships)}
            </Title>
            <ul>
              {groups.map((group) => (
                <li key={group}>
                  <ResourceLink groupVersionKind={modelGVK(GroupModel)} name={group} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    );
  }

  if (!isWatchSettled(groupLoaded, groupError)) {
    return <Spinner size="md" aria-label={t(K.identity.loadingGroup)} />;
  }
  if (groupError) {
    return <TabErrorAlert error={groupError} />;
  }

  const group = groupData as OpenShiftGroup | undefined;
  const members = group?.users ?? [];

  return (
    <div className="rbac-overview__identity-panel">
      <Title headingLevel="h4" size="md">
        {t(K.identity.groupMembers)}
      </Title>
      {members.length ? (
        <ul>
          {members.map((member) => (
            <li key={member}>
              <ResourceLink groupVersionKind={modelGVK(UserModel)} name={member} />
            </li>
          ))}
        </ul>
      ) : (
        <p>{t(K.identity.noGroupMembers)}</p>
      )}
    </div>
  );
};
