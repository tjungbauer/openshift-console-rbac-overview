/**
 * @file roleRules.ts
 * Format PolicyRule arrays for display in expandable role panels.
 */
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type PolicyRule = {
  apiGroups?: string[];
  resources?: string[];
  verbs?: string[];
  resourceNames?: string[];
  nonResourceURLs?: string[];
};

export type RoleLike = K8sResourceCommon & {
  rules?: PolicyRule[];
  aggregationRule?: {
    clusterRoleSelectors?: Array<{ matchLabels?: Record<string, string> }>;
  };
};

export const formatRuleList = (values?: string[]): string => {
  if (!values?.length) {
    return '*';
  }
  return values.join(', ');
};

export const normalizePolicyRules = (rules: PolicyRule[] = []): PolicyRule[] =>
  rules.filter(
    (rule) =>
      (rule.verbs?.length ?? 0) > 0 ||
      (rule.resources?.length ?? 0) > 0 ||
      (rule.nonResourceURLs?.length ?? 0) > 0,
  );
