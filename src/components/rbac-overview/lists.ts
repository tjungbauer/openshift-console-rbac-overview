/**
 * @file lists.ts
 * Normalize k8s list/watch responses to plain arrays.
 */
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const asResourceList = <T extends K8sResourceCommon>(
  data: T | T[] | undefined,
): T[] => {
  if (!data) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
};
