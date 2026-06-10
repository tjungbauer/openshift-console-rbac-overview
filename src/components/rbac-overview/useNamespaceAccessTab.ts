/**
 * @file useNamespaceAccessTab.ts
 * RoleBindings and ClusterRoleBindings for selected namespace.
 */
import {
  isAllNamespacesKey,
  useActiveNamespace,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { useEffect, useMemo, useState } from 'react';

import {
  ClusterRoleBindingModel,
  modelGVK,
  ProjectModel,
  RoleBindingModel,
} from './constants';
import { asResourceList } from './lists';
import {
  countUniqueNamespaceSubjects,
  extractClusterRoleBindingAccessRows,
  extractNamespaceRoleBindingRows,
} from './rbac';
import { useListResourcePermission } from './useListResourcePermission';
import { useRbacUrlState } from './useRbacUrlState';
import { isResourceSettled, isWatchSettled } from './watchState';

export function useNamespaceAccessTab() {
  const [activeNamespace] = useActiveNamespace();
  const { params, updateParams } = useRbacUrlState();
  const [namespace, setNamespaceState] = useState(params.namespace ?? '');

  const {
    allowed: canListClusterRoleBindings,
    loading: clusterRoleBindingsPermissionLoading,
  } = useListResourcePermission(ClusterRoleBindingModel);

  useEffect(() => {
    if (params.namespace && params.namespace !== namespace) {
      setNamespaceState(params.namespace);
    }
  }, [namespace, params.namespace]);

  const effectiveNamespace = useMemo(() => {
    const fromState = namespace.trim();
    if (fromState && !isAllNamespacesKey(fromState)) {
      return fromState;
    }
    if (params.namespace) {
      return params.namespace;
    }
    if (activeNamespace && !isAllNamespacesKey(activeNamespace)) {
      return activeNamespace;
    }
    return '';
  }, [activeNamespace, namespace, params.namespace]);

  const setNamespace = (value: string) => {
    setNamespaceState(value);
    updateParams({
      tab: 'namespace-access',
      namespace: value.trim() || undefined,
    });
  };

  const watchClusterRoleBindings =
    !clusterRoleBindingsPermissionLoading && canListClusterRoleBindings;

  const projectsWatch = useK8sWatchResources({
    projects: {
      groupVersionKind: modelGVK(ProjectModel),
      isList: true,
      namespaced: false,
    },
    ...(watchClusterRoleBindings
      ? {
          clusterRoleBindings: {
            groupVersionKind: modelGVK(ClusterRoleBindingModel),
            isList: true,
            namespaced: false,
          },
        }
      : {}),
  });

  const roleBindingWatch = effectiveNamespace
    ? {
        groupVersionKind: modelGVK(RoleBindingModel),
        isList: true,
        namespace: effectiveNamespace,
      }
    : null;

  const [roleBindingsData, roleBindingsLoaded, roleBindingsError] =
    useK8sWatchResource(roleBindingWatch);

  const namespaceRows = useMemo(
    () => extractNamespaceRoleBindingRows(asResourceList(roleBindingsData)),
    [roleBindingsData],
  );

  const clusterRows = useMemo(
    () =>
      watchClusterRoleBindings
        ? extractClusterRoleBindingAccessRows(
            asResourceList(projectsWatch.clusterRoleBindings?.data),
          )
        : [],
    [projectsWatch.clusterRoleBindings?.data, watchClusterRoleBindings],
  );

  const namespaceSubjectCount = useMemo(
    () => countUniqueNamespaceSubjects(namespaceRows),
    [namespaceRows],
  );

  const clusterSubjectCount = useMemo(
    () => countUniqueNamespaceSubjects(clusterRows),
    [clusterRows],
  );

  const projects = useMemo(
    () =>
      asResourceList(projectsWatch.projects.data)
        .map((project) => project.metadata?.name ?? '')
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [projectsWatch.projects.data],
  );

  const loaded =
    !clusterRoleBindingsPermissionLoading &&
    isResourceSettled(projectsWatch.projects) &&
    (!watchClusterRoleBindings || isResourceSettled(projectsWatch.clusterRoleBindings)) &&
    (!effectiveNamespace || isWatchSettled(roleBindingsLoaded, roleBindingsError));

  const error =
    projectsWatch.projects.loadError ||
    (watchClusterRoleBindings ? projectsWatch.clusterRoleBindings?.loadError : undefined) ||
    roleBindingsError;

  return {
    namespace,
    effectiveNamespace,
    projects,
    namespaceRows,
    clusterRows,
    namespaceSubjectCount,
    clusterSubjectCount,
    canListClusterRoleBindings: watchClusterRoleBindings,
    loaded,
    error,
    setNamespace,
  };
}
