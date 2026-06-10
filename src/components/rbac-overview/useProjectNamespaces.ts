/**
 * @file useProjectNamespaces.ts
 * Watch OpenShift Project objects for namespace picker options.
 */
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useMemo } from 'react';

import { modelGVK, ProjectModel } from './constants';
import { asResourceList } from './lists';
import { isWatchSettled } from './watchState';

export function useProjectNamespaces() {
  const [projectsData, loaded, error] = useK8sWatchResource({
    groupVersionKind: modelGVK(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const namespaces = useMemo(
    () =>
      asResourceList(projectsData)
        .map((project) => project.metadata?.name ?? '')
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [projectsData],
  );

  return { namespaces, loaded: isWatchSettled(loaded, error), error };
}
