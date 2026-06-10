/**
 * @file useClusterAdminsTab.ts
 * Watches CRB/RB; filters sensitive roles; sections for cluster-wide vs namespace admins.
 */
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo } from 'react';

import {
  ClusterRoleBindingModel,
  modelGVK,
  RoleBindingModel,
} from './constants';
import { asResourceList } from './lists';
import { extractClusterAdminRows } from './rbac';
import { usePluginConfig } from './usePluginConfig';
import { useSensitiveRoles } from './useSensitiveRoles';
import { isResourceSettled } from './watchState';

export type ClusterAdminsSection = 'cluster-wide' | 'namespace-elevated';

export function useClusterAdminsTab() {
  const { config, loaded: configLoaded } = usePluginConfig();
  const { sensitiveRoleNames, loaded: sensitiveRolesLoaded, error: sensitiveRolesError } =
    useSensitiveRoles(config);

  const resources = useK8sWatchResources({
    clusterRoleBindings: {
      groupVersionKind: modelGVK(ClusterRoleBindingModel),
      isList: true,
      namespaced: false,
    },
    roleBindings: {
      groupVersionKind: modelGVK(RoleBindingModel),
      isList: true,
      namespaced: true,
    },
  });

  const rows = useMemo(
    () =>
      extractClusterAdminRows(
        asResourceList(resources.clusterRoleBindings?.data),
        asResourceList(resources.roleBindings?.data),
        sensitiveRoleNames,
      ),
    [
      resources.clusterRoleBindings?.data,
      resources.roleBindings?.data,
      sensitiveRoleNames,
    ],
  );

  const clusterWideAdmins = useMemo(
    () => rows.filter((row) => row.scope === 'cluster'),
    [rows],
  );

  const namespaceElevated = useMemo(
    () => rows.filter((row) => row.scope === 'namespace'),
    [rows],
  );

  const loaded =
    configLoaded &&
    (sensitiveRolesLoaded || Boolean(sensitiveRolesError)) &&
    isResourceSettled(resources.clusterRoleBindings) &&
    isResourceSettled(resources.roleBindings);

  const error =
    sensitiveRolesError ||
    resources.clusterRoleBindings?.loadError ||
    resources.roleBindings?.loadError;

  return {
    clusterWideAdmins,
    namespaceElevated,
    sensitiveRoleNames,
    loaded,
    error,
  };
}
