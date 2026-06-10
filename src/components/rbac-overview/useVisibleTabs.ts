/**
 * @file useVisibleTabs.ts
 * Which tabs appear in the tab bar; Who can always visible.
 */
import { useMemo } from 'react';

import { evaluateAllTabAccess } from './tabAccess';
import { RBAC_TAB_KEYS, type RbacTabKey } from './types';
import { usePermissionNamespace } from './usePermissionNamespace';
import { useRbacPermissionChecks } from './useRbacPermissionChecks';
import {
  ALWAYS_VISIBLE_TABS,
  DEFAULT_PINNED_TAB,
  getVisibleRbacTabs,
} from './visibleTabs';

export { ALWAYS_VISIBLE_TABS, DEFAULT_PINNED_TAB, getVisibleRbacTabs } from './visibleTabs';

export function useVisibleTabs() {
  const { namespace: permissionNamespace, loading: namespaceLoading } = usePermissionNamespace();
  const checks = useRbacPermissionChecks(permissionNamespace);

  const tabAccess = useMemo(() => evaluateAllTabAccess(checks), [checks]);

  const visibleTabs = useMemo(() => getVisibleRbacTabs(tabAccess), [tabAccess]);

  // Ignore loading state for always-visible tabs so the page shell can render immediately.
  const loading = useMemo(
    () =>
      namespaceLoading ||
      RBAC_TAB_KEYS.some((tab) => !ALWAYS_VISIBLE_TABS.has(tab) && tabAccess[tab].loading),
    [namespaceLoading, tabAccess],
  );

  // Prefer Who can when visible; otherwise first permitted tab.
  const defaultTab =
    (visibleTabs.includes(DEFAULT_PINNED_TAB) ? DEFAULT_PINNED_TAB : visibleTabs[0]) ?? null;

  return {
    permissionNamespace,
    tabAccess,
    visibleTabs,
    loading,
    defaultTab: defaultTab as RbacTabKey | null,
  };
}
