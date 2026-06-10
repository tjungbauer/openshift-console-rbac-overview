/**
 * @file useListResourcePermission.ts
 * Single check: can user list one resource type in one namespace?
 */
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

type K8sModelRef = {
  apiGroup?: string;
  plural: string;
};

/** SelfSubjectAccessReview for list on a resource (optionally in one namespace). */
export function useListResourcePermission(
  model: K8sModelRef,
  namespace?: string,
): { allowed: boolean; loading: boolean } {
  const [allowed, loading] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'list',
    namespace,
  });
  return { allowed, loading };
}
