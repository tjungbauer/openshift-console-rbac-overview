/**
 * @file useRoleAccessTab.ts
 * ClusterRole picker and bindings that reference the selected role.
 */
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo } from 'react';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  RoleBindingModel,
  RoleModel,
  modelGVK,
} from './constants';
import { asResourceList } from './lists';
import type { BindingRow, RoleBindingLike } from './types';
import { isResourceSettled } from './watchState';

const bindingRowsForRole = (
  bindings: RoleBindingLike[],
  bindingKind: 'ClusterRoleBinding' | 'RoleBinding',
  selectedRoleName: string,
): BindingRow[] => {
  const rows: BindingRow[] = [];
  bindings.forEach((binding) => {
    const roleKind = binding.roleRef?.kind ?? '';
    const roleName = binding.roleRef?.name ?? '';
    if (roleName !== selectedRoleName) {
      return;
    }
    if (bindingKind === 'ClusterRoleBinding' && roleKind !== 'ClusterRole') {
      return;
    }
    rows.push({
      bindingName: binding.metadata?.name ?? '',
      roleKind,
      roleName,
      scope: bindingKind === 'ClusterRoleBinding' || roleKind === 'ClusterRole' ? 'cluster' : 'namespace',
      namespace: binding.metadata?.namespace,
      bindingKind,
    });
  });
  return rows;
};

export function useRoleAccessTab(selectedRoleName: string) {
  const resources = useK8sWatchResources({
    clusterRoles: {
      groupVersionKind: modelGVK(ClusterRoleModel),
      isList: true,
      namespaced: false,
    },
    roles: {
      groupVersionKind: modelGVK(RoleModel),
      isList: true,
      namespaced: true,
    },
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

  const clusterRoleNames = useMemo(
    () =>
      asResourceList(resources.clusterRoles.data)
        .map((role) => role.metadata?.name ?? '')
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [resources.clusterRoles.data],
  );

  const bindingRows = useMemo(() => {
    if (!selectedRoleName) {
      return [] as BindingRow[];
    }
    return [
      ...bindingRowsForRole(
        asResourceList(resources.clusterRoleBindings.data),
        'ClusterRoleBinding',
        selectedRoleName,
      ),
      ...bindingRowsForRole(asResourceList(resources.roleBindings.data), 'RoleBinding', selectedRoleName),
    ];
  }, [resources.clusterRoleBindings.data, resources.roleBindings.data, selectedRoleName]);

  const loaded =
    isResourceSettled(resources.clusterRoles) &&
    isResourceSettled(resources.roles) &&
    isResourceSettled(resources.clusterRoleBindings) &&
    isResourceSettled(resources.roleBindings);

  const error =
    resources.clusterRoles.loadError ||
    resources.roles.loadError ||
    resources.clusterRoleBindings.loadError ||
    resources.roleBindings.loadError;

  return {
    clusterRoleNames,
    bindingRows,
    loaded,
    error,
  };
}
