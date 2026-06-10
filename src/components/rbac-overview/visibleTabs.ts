/**
 * @file visibleTabs.ts
 * Tab bar visibility and ordering (pure functions, no hooks).
 */
import type { TabAccessState } from './tabAccess';
import { RBAC_TAB_KEYS, type RbacTabKey } from './types';

/** Tabs shown regardless of SelfSubjectAccessReview (normal users may lack who-can API create). */
export const ALWAYS_VISIBLE_TABS: ReadonlySet<RbacTabKey> = new Set(['who-can']);

/** Default landing tab when ?tab= is missing or points at a hidden tab. */
export const DEFAULT_PINNED_TAB: RbacTabKey = 'who-can';

const isTabVisible = (
  tab: RbacTabKey,
  tabAccess: Record<RbacTabKey, TabAccessState>,
): boolean => ALWAYS_VISIBLE_TABS.has(tab) || tabAccess[tab].accessible;

/**
 * Pinned tabs (Who can) stay leftmost; other tabs keep RBAC_TAB_KEYS order.
 */
export function getVisibleRbacTabs(
  tabAccess: Record<RbacTabKey, TabAccessState>,
): RbacTabKey[] {
  const visible = RBAC_TAB_KEYS.filter((tab) => isTabVisible(tab, tabAccess));
  const pinned = RBAC_TAB_KEYS.filter(
    (tab) => ALWAYS_VISIBLE_TABS.has(tab) && visible.includes(tab),
  );
  const rest = visible.filter((tab) => !ALWAYS_VISIBLE_TABS.has(tab));
  return [...pinned, ...rest];
}
