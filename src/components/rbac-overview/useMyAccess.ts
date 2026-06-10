/**
 * @file useMyAccess.ts
 * Logged-in user: SelfSubjectReview, groups, namespaces, bindings for My access panel.
 */
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchSelfSubjectReview, parseUserInfo } from './currentUser';
import { ClusterRoleBindingModel, modelGVK, RoleBindingModel } from './constants';
import { resolveUserGroupMembership } from './identity';
import { asResourceList } from './lists';
import { extractBindingsForSubject } from './rbac';
import { k8sClientErrorMessage } from './k8sClientError';
import { useListResourcePermission } from './useListResourcePermission';
import { useProjectNamespaces } from './useProjectNamespaces';
import { isWatchSettled } from './watchState';
import { K } from './i18nKeys';

export function useMyAccess() {
  const { t } = useTranslation('plugin__rbac-overview');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [apiGroups, setApiGroups] = useState<string[]>([]);
  const [openshiftGroups, setOpenshiftGroups] = useState<string[]>([]);

  const { namespaces, loaded: namespacesLoaded } = useProjectNamespaces();
  const {
    allowed: canListClusterRoleBindings,
    loading: clusterRoleBindingsPermissionLoading,
  } = useListResourcePermission(ClusterRoleBindingModel);

  // Skip cluster-wide watch when list permission is missing — namespace RBs may still load.
  const watchClusterRoleBindings =
    open &&
    username &&
    !clusterRoleBindingsPermissionLoading &&
    canListClusterRoleBindings;

  const clusterRoleBindingWatch = watchClusterRoleBindings
    ? {
        groupVersionKind: modelGVK(ClusterRoleBindingModel),
        isList: true,
        namespaced: false,
      }
    : null;

  // Namespaced RB watch runs whenever the panel is open; CRB watch is conditional above.
  const roleBindingWatch =
    open && username
      ? {
          groupVersionKind: modelGVK(RoleBindingModel),
          isList: true,
          namespaced: true,
        }
      : null;

  const [clusterRoleBindingsData, clusterRoleBindingsLoaded, clusterRoleBindingsError] =
    useK8sWatchResource(clusterRoleBindingWatch);
  const [roleBindingsData, roleBindingsLoaded, roleBindingsError] =
    useK8sWatchResource(roleBindingWatch);

  const bindingRows = useMemo(() => {
    if (!username) {
      return [];
    }
    return extractBindingsForSubject(
      watchClusterRoleBindings ? asResourceList(clusterRoleBindingsData) : [],
      asResourceList(roleBindingsData),
      { kind: 'User', name: username },
    );
  }, [
    clusterRoleBindingsData,
    roleBindingsData,
    username,
    watchClusterRoleBindings,
  ]);

  const loadMyAccess = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    setError(null);

    try {
      const review = await fetchSelfSubjectReview();
      const parsed = parseUserInfo(review.status?.userInfo);
      if (!parsed) {
        setError(t(K.myAccess.noLoggedInUser));
        setLoading(false);
        return;
      }

      setUsername(parsed.username);
      setApiGroups(parsed.apiGroups);

      try {
        // Merge SelfSubjectReview groups with User API lookup for complete membership.
        const mergedGroups = new Set([
          ...parsed.openshiftGroups,
          ...(await resolveUserGroupMembership(parsed.username)),
        ]);
        setOpenshiftGroups(Array.from(mergedGroups).sort((a, b) => a.localeCompare(b)));
      } catch {
        // User list permission missing — fall back to groups from SelfSubjectReview only.
        setOpenshiftGroups(parsed.openshiftGroups);
      }
    } catch (err) {
      setError(
        k8sClientErrorMessage(err) ||
          t(K.permission.selfSubjectReview),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  const toggleMyAccess = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }
    void loadMyAccess();
  }, [loadMyAccess, open]);

  const clusterBindingsSettled =
    !watchClusterRoleBindings ||
    isWatchSettled(clusterRoleBindingsLoaded, clusterRoleBindingsError);

  // Wait for permission check + both watches (or skipped CRB) before showing binding table.
  const bindingsLoaded =
    !open ||
    !username ||
    (!clusterRoleBindingsPermissionLoading &&
      clusterBindingsSettled &&
      isWatchSettled(roleBindingsLoaded, roleBindingsError));

  const bindingsError =
    (watchClusterRoleBindings ? clusterRoleBindingsError : undefined) || roleBindingsError;

  return {
    open,
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
    canListClusterRoleBindings: watchClusterRoleBindings,
    loadMyAccess,
    toggleMyAccess,
    setOpen,
  };
}
