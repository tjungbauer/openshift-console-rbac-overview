/**
 * @file useSubjectsTab.ts
 * Users, groups, service accounts (API + binding references) and bindings for selection.
 */
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo, useState } from 'react';

import {
  ClusterRoleBindingModel,
  GroupModel,
  modelGVK,
  RoleBindingModel,
  ServiceAccountModel,
  UserModel,
} from './constants';
import { asResourceList } from './lists';
import {
  extractBindingsForSubject,
  extractSubjectsFromBindings,
  mergeSubjectLists,
  subjectKey,
} from './rbac';
import type { SubjectListItem } from './types';
import { isResourceSettled } from './watchState';

export function useSubjectsTab() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const resources = useK8sWatchResources({
    users: {
      groupVersionKind: modelGVK(UserModel),
      isList: true,
      namespaced: false,
    },
    groups: {
      groupVersionKind: modelGVK(GroupModel),
      isList: true,
      namespaced: false,
    },
    serviceAccounts: {
      groupVersionKind: modelGVK(ServiceAccountModel),
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

  const apiSubjects = useMemo((): SubjectListItem[] => {
    const users = asResourceList(resources.users.data)
      .map((user) => ({
        kind: 'User' as const,
        name: user.metadata?.name ?? '',
        displayName: user.metadata?.name ?? '',
      }))
      .filter((item) => item.name);

    const groups = asResourceList(resources.groups.data)
      .map((group) => ({
        kind: 'Group' as const,
        name: group.metadata?.name ?? '',
        displayName: group.metadata?.name ?? '',
      }))
      .filter((item) => item.name);

    const serviceAccounts = asResourceList(resources.serviceAccounts.data)
      .map((sa) => ({
        kind: 'ServiceAccount' as const,
        name: sa.metadata?.name ?? '',
        namespace: sa.metadata?.namespace,
        displayName: `${sa.metadata?.namespace}/${sa.metadata?.name}`,
      }))
      .filter((item) => item.name && item.namespace);

    return [...users, ...groups, ...serviceAccounts];
  }, [resources.groups.data, resources.serviceAccounts.data, resources.users.data]);

  const bindingSubjects = useMemo(
    () =>
      extractSubjectsFromBindings(
        asResourceList(resources.clusterRoleBindings.data),
        asResourceList(resources.roleBindings.data),
      ),
    [resources.clusterRoleBindings.data, resources.roleBindings.data],
  );

  const allSubjects = useMemo(
    () => mergeSubjectLists(apiSubjects, bindingSubjects),
    [apiSubjects, bindingSubjects],
  );

  const selectedSubject = useMemo(
    () => allSubjects.find((subject) => subjectKey(subject) === selectedKey) ?? null,
    [allSubjects, selectedKey],
  );

  const bindingRows = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }
    return extractBindingsForSubject(
      asResourceList(resources.clusterRoleBindings.data),
      asResourceList(resources.roleBindings.data),
      selectedSubject,
    );
  }, [resources.clusterRoleBindings.data, resources.roleBindings.data, selectedSubject]);

  const loaded =
    isResourceSettled(resources.users) &&
    isResourceSettled(resources.groups) &&
    isResourceSettled(resources.serviceAccounts) &&
    isResourceSettled(resources.clusterRoleBindings) &&
    isResourceSettled(resources.roleBindings);

  const error =
    resources.users.loadError ||
    resources.groups.loadError ||
    resources.serviceAccounts.loadError ||
    resources.clusterRoleBindings.loadError ||
    resources.roleBindings.loadError;

  return {
    selectedKey,
    allSubjects,
    apiSubjectCount: apiSubjects.length,
    bindingSubjectCount: bindingSubjects.length,
    selectedSubject,
    bindingRows,
    loaded,
    error,
    setSelectedKey,
  };
}
