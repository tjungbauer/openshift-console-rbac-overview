/**
 * @file types.ts
 * Shared TypeScript types: tab keys, subject refs, binding rows, who-can / can-subject query shapes.
 */
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const RBAC_TAB_KEYS = [
  'who-can',
  'cluster-admins',
  'namespace-access',
  'subjects',
  'role-access',
  'scc',
] as const;

export type RbacTabKey = (typeof RBAC_TAB_KEYS)[number];

export type SubjectKind = 'User' | 'Group' | 'ServiceAccount';

export type SubjectRef = {
  kind: SubjectKind;
  name: string;
  namespace?: string;
};

export type SubjectListItem = SubjectRef & { displayName: string };

export type BindingRow = {
  bindingName: string;
  roleKind: string;
  roleName: string;
  scope: 'cluster' | 'namespace';
  namespace?: string;
  bindingKind: 'ClusterRoleBinding' | 'RoleBinding';
};

export type ClusterAdminRow = {
  bindingName: string;
  bindingKind: 'ClusterRoleBinding' | 'RoleBinding';
  subjectKind: string;
  subjectName: string;
  subjectNamespace?: string;
  roleKind: string;
  roleName: string;
  scope: 'cluster' | 'namespace';
  namespace?: string;
  isDangerous: boolean;
};

export type RbacSubject = {
  kind: string;
  name: string;
  namespace?: string;
};

export type RoleBindingLike = K8sResourceCommon & {
  roleRef?: { kind?: string; name?: string };
  subjects?: RbacSubject[];
};

export type ResourceAccessReviewResponse = {
  users?: string[];
  groups?: string[];
  namespace?: string;
  verb?: string;
  resource?: string;
  evaluationError?: string;
};

export type WhoCanScope = 'namespaced' | 'cluster';

export type WhoCanQuery = {
  verb: string;
  resource: string;
  scope: WhoCanScope;
  namespace?: string;
  resourceAPIGroup?: string;
  resourceAPIVersion?: string;
  subresource?: string;
  resourceName?: string;
};

export type CanSubjectQuery = WhoCanQuery & {
  subjectKind: SubjectKind;
  subjectName: string;
  subjectNamespace?: string;
};

export type SubjectAccessReviewResponse = {
  allowed?: boolean;
  reason?: string;
  evaluationError?: string;
  verb?: string;
  resource?: string;
  namespace?: string;
};

export type CanSubjectQueryResult = {
  response: SubjectAccessReviewResponse;
  /** Group memberships included in the SubjectAccessReview for User subjects. */
  evaluatedGroups?: string[];
};

export type SubjectResourceLinkProps = {
  kind: string;
  name: string;
  namespace?: string;
  inline?: boolean;
};

export type WhoCanSubjectLinkProps = {
  name: string;
};

export type BindingResourceLinkProps = {
  bindingKind: 'ClusterRoleBinding' | 'RoleBinding';
  name: string;
  namespace?: string;
  inline?: boolean;
};

export type RoleResourceLinkProps = {
  roleKind: string;
  name: string;
  namespace?: string;
  inline?: boolean;
};

export type NamespaceResourceLinkProps = {
  name?: string;
};

export type BindingsTableProps = {
  rows: BindingRow[];
  subject?: SubjectListItem;
};

export type NamespaceAccessRow = {
  subjectKind: string;
  subjectName: string;
  subjectNamespace?: string;
  bindingName: string;
  bindingKind: 'RoleBinding' | 'ClusterRoleBinding';
  roleKind: string;
  roleName: string;
  namespace?: string;
  accessType: 'namespace' | 'cluster';
};
