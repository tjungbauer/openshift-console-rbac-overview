/**
 * @file useSccAccessTab.ts
 * Direct SCC assignments and RBAC-derived SCC use rows.
 */
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo } from 'react';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  modelGVK,
  SecurityContextConstraintsModel,
} from './constants';
import { asResourceList } from './lists';
import {
  extractSccAccessRows,
  extractSccOverviewRows,
  type SecurityContextConstraints,
} from './scc';
import {
  extractSccRbacUseRows,
  type ClusterRoleLike,
} from './sccRbac';
import { isResourceSettled } from './watchState';
import { usePluginConfig } from './usePluginConfig';

export function useSccAccessTab() {
  const { config } = usePluginConfig();
  const resources = useK8sWatchResources({
    sccs: {
      groupVersionKind: modelGVK(SecurityContextConstraintsModel),
      isList: true,
      namespaced: false,
    },
    clusterRoles: {
      groupVersionKind: modelGVK(ClusterRoleModel),
      isList: true,
      namespaced: false,
    },
    clusterRoleBindings: {
      groupVersionKind: modelGVK(ClusterRoleBindingModel),
      isList: true,
      namespaced: false,
    },
  });

  const sccResources = useMemo(
    () => asResourceList(resources.sccs.data) as SecurityContextConstraints[],
    [resources.sccs.data],
  );

  const sccOverviewRows = useMemo(
    () => extractSccOverviewRows(sccResources),
    [sccResources],
  );

  const rows = useMemo(
    () => extractSccAccessRows(sccResources, config.hiddenSccNames),
    [config.hiddenSccNames, sccResources],
  );

  const rbacUseRows = useMemo(
    () =>
      extractSccRbacUseRows(
        asResourceList(resources.clusterRoles.data) as ClusterRoleLike[],
        asResourceList(resources.clusterRoleBindings.data),
      ),
    [resources.clusterRoleBindings.data, resources.clusterRoles.data],
  );

  const loaded =
    isResourceSettled(resources.sccs) &&
    isResourceSettled(resources.clusterRoles) &&
    isResourceSettled(resources.clusterRoleBindings);

  const error =
    resources.sccs.loadError ||
    resources.clusterRoles.loadError ||
    resources.clusterRoleBindings.loadError;

  return {
    sccOverviewRows,
    rows,
    rbacUseRows,
    loaded,
    error,
  };
}
