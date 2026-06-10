/**
 * @file useSensitiveRoles.ts
 * Set of sensitive role names from config and ClusterRole labels.
 */
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo } from 'react';

import { ClusterRoleModel, modelGVK } from './constants';
import { asResourceList } from './lists';
import type { PluginConfig } from './pluginConfig';

export function useSensitiveRoles(config: PluginConfig) {
  const [clusterRoles, loaded, error] = useK8sWatchResource({
    groupVersionKind: modelGVK(ClusterRoleModel),
    isList: true,
    namespaced: false,
  });

  const sensitiveRoleNames = useMemo(() => {
    const names = new Set(config.sensitiveRoles);
    const { sensitiveRoleLabelKey, sensitiveRoleLabelValue } = config;

    asResourceList(clusterRoles).forEach((clusterRole) => {
      const roleName = clusterRole.metadata?.name;
      const labels = clusterRole.metadata?.labels ?? {};
      if (
        roleName &&
        labels[sensitiveRoleLabelKey] === sensitiveRoleLabelValue
      ) {
        names.add(roleName);
      }
    });

    return names;
  }, [clusterRoles, config]);

  return {
    sensitiveRoleNames,
    loaded,
    error,
  };
}

export const isSensitiveRoleName = (roleName: string, sensitiveRoleNames: Set<string>): boolean =>
  sensitiveRoleNames.has(roleName);
