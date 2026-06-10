/**
 * @file tabAccess.ts
 * Map permission check results to tab visible / blocked / loading.
 */
import type { PermissionCheck } from './useRbacPermissionChecks';
import type { RbacPermissionChecks } from './useRbacPermissionChecks';
import type { RbacTabKey } from './types';

export type TabAccessState = {
  loading: boolean;
  accessible: boolean;
  blocked: boolean;
  missing: string[];
};

export function evaluateTabAccess(checks: PermissionCheck[]): TabAccessState {
  const loading = checks.some((check) => check.loading);
  const missing = checks.filter((check) => !check.loading && !check.allowed).map((check) => check.id);
  // Partial visibility: one allowed list/create is enough to show the tab (with alerts for gaps).
  const accessible = !loading && checks.some((check) => check.allowed);
  const blocked = !loading && !accessible;

  return { loading, accessible, blocked, missing };
}

/** Each tab declares which permission checks gate its data — evaluated together in evaluateTabAccess. */
export function tabChecksForKey(
  tab: RbacTabKey,
  checks: RbacPermissionChecks,
): PermissionCheck[] {
  switch (tab) {
    case 'cluster-admins':
      return [checks.clusterRoleBindings, checks.roleBindings];
    case 'namespace-access':
      return [checks.projects, checks.roleBindings, checks.clusterRoleBindings];
    case 'subjects':
      return [
        checks.users,
        checks.groups,
        checks.serviceAccounts,
        checks.clusterRoleBindings,
        checks.roleBindings,
      ];
    case 'who-can':
      return [
        checks.resourceAccessReviews,
        checks.localResourceAccessReviews,
        checks.subjectAccessReviews,
        checks.localSubjectAccessReviews,
        checks.selfSubjectReviews,
      ];
    case 'role-access':
      return [checks.clusterRoles, checks.clusterRoleBindings, checks.roleBindings];
    case 'scc':
      return [checks.sccs];
    default:
      return [];
  }
}

export function evaluateAllTabAccess(checks: RbacPermissionChecks): Record<RbacTabKey, TabAccessState> {
  return {
    'cluster-admins': evaluateTabAccess(tabChecksForKey('cluster-admins', checks)),
    'namespace-access': evaluateTabAccess(tabChecksForKey('namespace-access', checks)),
    subjects: evaluateTabAccess(tabChecksForKey('subjects', checks)),
    'role-access': evaluateTabAccess(tabChecksForKey('role-access', checks)),
    'who-can': evaluateTabAccess(tabChecksForKey('who-can', checks)),
    scc: evaluateTabAccess(tabChecksForKey('scc', checks)),
  };
}
