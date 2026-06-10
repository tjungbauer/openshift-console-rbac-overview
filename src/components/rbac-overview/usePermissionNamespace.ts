/**
 * @file usePermissionNamespace.ts
 * Namespace from console active project and accessible projects list.
 */
import { isAllNamespacesKey, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo } from 'react';

import { resolvePermissionNamespace } from './resolvePermissionNamespace';
import { useProjectNamespaces } from './useProjectNamespaces';
import { isWatchSettled } from './watchState';

export function usePermissionNamespace() {
  const [activeNamespace] = useActiveNamespace();
  const { namespaces, loaded, error } = useProjectNamespaces();

  const namespace = useMemo(
    () => resolvePermissionNamespace(activeNamespace, namespaces),
    [activeNamespace, namespaces],
  );

  const hasFixedNamespace = Boolean(
    activeNamespace && !isAllNamespacesKey(activeNamespace),
  );
  const loading = !hasFixedNamespace && !isWatchSettled(loaded, error);

  return { namespace, loading };
}
