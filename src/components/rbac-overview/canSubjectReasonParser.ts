/**
 * @file canSubjectReason.ts
 * Parse SubjectAccessReview .reason strings into structured binding/role references.
 */
import type { SubjectKind } from './types';

export type ParsedRbacReason = {
  decision: 'allowed' | 'denied';
  bindingKind: 'RoleBinding' | 'ClusterRoleBinding';
  bindingName: string;
  bindingNamespace?: string;
  roleKind: 'ClusterRole' | 'Role';
  roleName: string;
  subjectKind: SubjectKind;
  subjectName: string;
  subjectNamespace?: string;
};

const ROLE_BINDING_REASON_RE =
  /^RBAC: (allowed|denied) by RoleBinding "([^"]+)\/([^"]+)" of (ClusterRole|Role) "([^"]+)" to (User|Group|ServiceAccount) "([^"]+)"$/;

const CLUSTER_ROLE_BINDING_REASON_RE =
  /^RBAC: (allowed|denied) by ClusterRoleBinding "([^"]+)" of (ClusterRole|Role) "([^"]+)" to (User|Group|ServiceAccount) "([^"]+)"$/;

function parseSubjectRef(
  kind: string,
  value: string,
  bindingNamespace?: string,
): Pick<ParsedRbacReason, 'subjectKind' | 'subjectName' | 'subjectNamespace'> {
  if (kind === 'ServiceAccount' && value.includes('/')) {
    const slashIndex = value.indexOf('/');
    return {
      subjectKind: 'ServiceAccount',
      subjectNamespace: value.slice(0, slashIndex),
      subjectName: value.slice(slashIndex + 1),
    };
  }

  return {
    subjectKind: kind as SubjectKind,
    subjectName: value,
    subjectNamespace: kind === 'ServiceAccount' ? bindingNamespace : undefined,
  };
}

/** Parses OpenShift/Kubernetes RBAC SubjectAccessReview reason strings. */
export function parseCanSubjectReason(reason: string | undefined): ParsedRbacReason | null {
  if (!reason?.trim()) {
    return null;
  }

  const trimmed = reason.trim();
  const roleBindingMatch = trimmed.match(ROLE_BINDING_REASON_RE);
  if (roleBindingMatch) {
    const bindingNamespace = roleBindingMatch[3];
    const subject = parseSubjectRef(roleBindingMatch[6], roleBindingMatch[7], bindingNamespace);
    return {
      decision: roleBindingMatch[1] as ParsedRbacReason['decision'],
      bindingKind: 'RoleBinding',
      bindingName: roleBindingMatch[2],
      bindingNamespace,
      roleKind: roleBindingMatch[4] as ParsedRbacReason['roleKind'],
      roleName: roleBindingMatch[5],
      ...subject,
    };
  }

  const clusterRoleBindingMatch = trimmed.match(CLUSTER_ROLE_BINDING_REASON_RE);
  if (clusterRoleBindingMatch) {
    const subject = parseSubjectRef(clusterRoleBindingMatch[5], clusterRoleBindingMatch[6]);
    return {
      decision: clusterRoleBindingMatch[1] as ParsedRbacReason['decision'],
      bindingKind: 'ClusterRoleBinding',
      bindingName: clusterRoleBindingMatch[2],
      roleKind: clusterRoleBindingMatch[3] as ParsedRbacReason['roleKind'],
      roleName: clusterRoleBindingMatch[4],
      ...subject,
    };
  }

  return null;
}
