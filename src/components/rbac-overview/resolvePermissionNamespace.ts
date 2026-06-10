/**
 * @file resolvePermissionNamespace.ts
 * Pick which namespace to use for namespaced SelfSubjectAccessReview (not hardcoded default).
 */
import { ALL_NAMESPACES_KEY } from './constants';

/** Namespace used for namespaced SelfSubjectAccessReview checks (not a hardcoded default). */
export function resolvePermissionNamespace(
  activeNamespace: string | undefined,
  projectNamespaces: string[],
): string {
  if (activeNamespace && activeNamespace !== ALL_NAMESPACES_KEY) {
    return activeNamespace;
  }
  if (projectNamespaces.length) {
    return projectNamespaces[0];
  }
  return 'default';
}
