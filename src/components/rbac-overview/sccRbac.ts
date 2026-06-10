/**
 * @file sccRbac.ts
 * Derive SCC use access from ClusterRole rules and bindings (RBAC path, not direct SCC fields).
 */
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import type { RoleBindingLike } from './types';

export type ClusterRoleLike = K8sResourceCommon & {
  rules?: Array<{
    apiGroups?: string[];
    resources?: string[];
    verbs?: string[];
    resourceNames?: string[];
  }>;
  aggregationRule?: {
    clusterRoleSelectors?: Array<{ matchLabels?: Record<string, string> }>;
  };
};

export type SccRbacUseRow = {
  key: string;
  clusterRoleName: string;
  bindingName: string;
  subjectKind: string;
  subjectName: string;
  subjectNamespace?: string;
  displayName: string;
  hasAggregationRule: boolean;
};

const SCC_RESOURCE_NAMES = new Set([
  'securitycontextconstraints',
  'securitycontextconstraint',
]);

const matchesSccResource = (resource: string): boolean =>
  SCC_RESOURCE_NAMES.has(resource.toLowerCase());

export function clusterRoleGrantsSccUse(role: ClusterRoleLike | undefined): boolean {
  if (!role?.rules?.length) {
    return false;
  }
  return role.rules.some((rule) => {
    const verbs = rule.verbs ?? [];
    const allowsUse = verbs.includes('use') || verbs.includes('*');
    if (!allowsUse) {
      return false;
    }
    const resources = rule.resources ?? [];
    if (!resources.length) {
      return false;
    }
    return resources.some(
      (resource) => resource === '*' || matchesSccResource(resource),
    );
  });
}

export function extractSccRbacUseRows(
  clusterRoles: ClusterRoleLike[],
  clusterRoleBindings: RoleBindingLike[],
): SccRbacUseRow[] {
  const sccUseRoles = new Set(
    clusterRoles
      .filter((role) => clusterRoleGrantsSccUse(role))
      .map((role) => role.metadata?.name ?? '')
      .filter(Boolean),
  );

  const rows: SccRbacUseRow[] = [];

  clusterRoleBindings.forEach((binding) => {
    const roleName = binding.roleRef?.name ?? '';
    if (!sccUseRoles.has(roleName)) {
      return;
    }
    const role = clusterRoles.find((item) => item.metadata?.name === roleName);
    binding.subjects?.forEach((subject) => {
      const displayName =
        subject.kind === 'ServiceAccount' && subject.namespace
          ? `${subject.namespace}/${subject.name}`
          : subject.name;
      rows.push({
        key: `${binding.metadata?.name}/${subject.kind}/${subject.namespace ?? ''}/${subject.name}`,
        clusterRoleName: roleName,
        bindingName: binding.metadata?.name ?? '',
        subjectKind: subject.kind,
        subjectName: subject.name,
        subjectNamespace: subject.namespace,
        displayName,
        hasAggregationRule: Boolean(role?.aggregationRule),
      });
    });
  });

  return rows.sort((a, b) => {
    const roleOrder = a.clusterRoleName.localeCompare(b.clusterRoleName);
    if (roleOrder !== 0) {
      return roleOrder;
    }
    return a.displayName.localeCompare(b.displayName);
  });
}
