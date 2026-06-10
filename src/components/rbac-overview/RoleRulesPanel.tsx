/**
 * @file RoleRulesPanel.tsx
 * Fetches ClusterRole/Role and lists policy rules.
 */
import { Alert, Spinner } from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ClusterRoleModel, modelGVK, RoleModel } from './constants';
import { formatRuleList, normalizePolicyRules, type RoleLike } from './roleRules';
import { TabErrorAlert } from './StateFeedback';
import { isWatchSettled } from './watchState';
import { K } from './i18nKeys';

type RoleRulesPanelProps = {
  roleKind: string;
  roleName: string;
  namespace?: string;
};

export const RoleRulesPanel: FC<RoleRulesPanelProps> = ({ roleKind, roleName, namespace }) => {
  const { t } = useTranslation('plugin__rbac-overview');

  const watchRef =
    roleKind === 'ClusterRole'
      ? {
          groupVersionKind: modelGVK(ClusterRoleModel),
          name: roleName,
          isList: false,
          namespaced: false,
        }
      : roleKind === 'Role' && namespace
        ? {
            groupVersionKind: modelGVK(RoleModel),
            name: roleName,
            namespace,
            isList: false,
            namespaced: true,
          }
        : null;

  const [roleData, loaded, error] = useK8sWatchResource(watchRef);

  const role = roleData as RoleLike | undefined;
  const rules = useMemo(() => normalizePolicyRules(role?.rules), [role?.rules]);
  const hasAggregationRule = Boolean(role?.aggregationRule);

  if (!watchRef) {
    return (
      <Alert variant="info" isInline title={t(K.roleRules.unavailable)}>
        {t(K.roleRules.onlyClusterOrRole)}
      </Alert>
    );
  }

  if (!isWatchSettled(loaded, error)) {
    return <Spinner size="md" aria-label={t(K.roleRules.loading)} />;
  }

  if (error) {
    return <TabErrorAlert error={error} />;
  }

  if (!rules.length) {
    return <p>{t(K.roleRules.none)}</p>;
  }

  return (
    <>
      {hasAggregationRule ? (
        <Alert variant="info" isInline title={t(K.roleRules.aggregatedTitle)} className="rbac-overview__section-alert">
          {t(K.roleRules.aggregatedBody)}
          {roleKind === 'ClusterRole' ? (
            <>
              {' '}
              <ResourceLink groupVersionKind={modelGVK(ClusterRoleModel)} name={roleName} inline />
            </>
          ) : null}
        </Alert>
      ) : null}
      <Table aria-label={t(K.roleRules.forRole, { role: roleName })} variant="compact">
      <Thead>
        <Tr>
          <Th>{t(K.roleRules.apiGroups)}</Th>
          <Th>{t(K.roleRules.resources)}</Th>
          <Th>{t(K.roleRules.verbs)}</Th>
          <Th>{t(K.roleRules.resourceNames)}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rules.map((rule, index) => (
          <Tr key={`${roleName}-rule-${index}`}>
            <Td>{formatRuleList(rule.apiGroups)}</Td>
            <Td>
              {rule.nonResourceURLs?.length
                ? formatRuleList(rule.nonResourceURLs)
                : formatRuleList(rule.resources)}
            </Td>
            <Td>{formatRuleList(rule.verbs)}</Td>
            <Td>{formatRuleList(rule.resourceNames)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
    </>
  );
};
