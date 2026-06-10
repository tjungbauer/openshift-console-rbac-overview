/**
 * @file constants.ts
 * OpenShift/K8s model objects (ClusterRoleBindingModel, access-review models), API versions, and who-can verb presets.
 */
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const OPENSHIFT_AUTHORIZATION_API_VERSION = 'authorization.openshift.io/v1';

export const DEFAULT_SENSITIVE_ROLES = ['cluster-admin', 'admin'] as const;

export const SERVICE_ACCOUNT_USER_PREFIX = 'system:serviceaccount:';

/** Console "All projects" sentinel — matches dynamic-plugin-sdk `isAllNamespacesKey()`. */
export const ALL_NAMESPACES_KEY = '#ALL_NS#';

/** Common Kubernetes RBAC verbs for who-can / can-subject queries. */
export const WHO_CAN_VERB_OPTIONS = [
  'get',
  'list',
  'watch',
  'create',
  'update',
  'patch',
  'delete',
  'deletecollection',
  'connect',
] as const;

/** Common resources for who-can / can-subject queries. */
export const WHO_CAN_RESOURCE_OPTIONS = [
  'pods',
  'services',
  'configmaps',
  'secrets',
  'deployments',
  'routes',
  'namespaces',
  'nodes',
  'projects',
  'rolebindings',
  'clusterrolebindings',
] as const;

/** Common API groups for OpenShift / Kubernetes who-can queries. */
export const WHO_CAN_API_GROUP_OPTIONS = [
  { value: '', labelKey: 'Core API (empty)' },
  { value: 'apps', labelKey: 'apps' },
  { value: 'route.openshift.io', labelKey: 'route.openshift.io' },
  { value: 'project.openshift.io', labelKey: 'project.openshift.io' },
  { value: 'rbac.authorization.k8s.io', labelKey: 'rbac.authorization.k8s.io' },
  { value: 'authorization.openshift.io', labelKey: 'authorization.openshift.io' },
] as const;

export const ClusterRoleBindingModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'rbac.authorization.k8s.io',
  kind: 'ClusterRoleBinding',
  plural: 'clusterrolebindings',
  abbr: 'CRB',
  label: 'ClusterRoleBinding',
  labelPlural: 'ClusterRoleBindings',
  namespaced: false,
};

export const RoleBindingModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'rbac.authorization.k8s.io',
  kind: 'RoleBinding',
  plural: 'rolebindings',
  abbr: 'RB',
  label: 'RoleBinding',
  labelPlural: 'RoleBindings',
  namespaced: true,
};

export const ClusterRoleModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'rbac.authorization.k8s.io',
  kind: 'ClusterRole',
  plural: 'clusterroles',
  abbr: 'CR',
  label: 'ClusterRole',
  labelPlural: 'ClusterRoles',
  namespaced: false,
};

export const RoleModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'rbac.authorization.k8s.io',
  kind: 'Role',
  plural: 'roles',
  abbr: 'R',
  label: 'Role',
  labelPlural: 'Roles',
  namespaced: true,
};

export const ProjectModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'project.openshift.io',
  kind: 'Project',
  plural: 'projects',
  abbr: 'PR',
  label: 'Project',
  labelPlural: 'Projects',
  namespaced: false,
};

export const UserModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'user.openshift.io',
  kind: 'User',
  plural: 'users',
  abbr: 'USR',
  label: 'User',
  labelPlural: 'Users',
  namespaced: false,
};

export const GroupModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'user.openshift.io',
  kind: 'Group',
  plural: 'groups',
  abbr: 'GRP',
  label: 'Group',
  labelPlural: 'Groups',
  namespaced: false,
};

export const ServiceAccountModel: K8sModel = {
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  plural: 'serviceaccounts',
  abbr: 'SA',
  label: 'ServiceAccount',
  labelPlural: 'ServiceAccounts',
  namespaced: true,
};

export const ResourceAccessReviewModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'authorization.openshift.io',
  kind: 'ResourceAccessReview',
  plural: 'resourceaccessreviews',
  abbr: 'RAR',
  label: 'ResourceAccessReview',
  labelPlural: 'ResourceAccessReviews',
  namespaced: false,
};

export const LocalResourceAccessReviewModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'authorization.openshift.io',
  kind: 'LocalResourceAccessReview',
  plural: 'localresourceaccessreviews',
  abbr: 'LRAR',
  label: 'LocalResourceAccessReview',
  labelPlural: 'LocalResourceAccessReviews',
  namespaced: true,
};

export const SubjectAccessReviewModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'authorization.openshift.io',
  kind: 'SubjectAccessReview',
  plural: 'subjectaccessreviews',
  abbr: 'SAR',
  label: 'SubjectAccessReview',
  labelPlural: 'SubjectAccessReviews',
  namespaced: false,
};

export const SecurityContextConstraintsModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'security.openshift.io',
  kind: 'SecurityContextConstraints',
  plural: 'securitycontextconstraints',
  abbr: 'SCC',
  label: 'SecurityContextConstraints',
  labelPlural: 'SecurityContextConstraints',
  namespaced: false,
};

export const SelfSubjectReviewModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'authentication.k8s.io',
  kind: 'SelfSubjectReview',
  plural: 'selfsubjectreviews',
  abbr: 'SSR',
  label: 'SelfSubjectReview',
  labelPlural: 'SelfSubjectReviews',
  namespaced: false,
};

export const LocalSubjectAccessReviewModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'authorization.openshift.io',
  kind: 'LocalSubjectAccessReview',
  plural: 'localsubjectaccessreviews',
  abbr: 'LSAR',
  label: 'LocalSubjectAccessReview',
  labelPlural: 'LocalSubjectAccessReviews',
  namespaced: true,
};

export const modelGVK = (model: K8sModel) => {
  const [group = '', version = 'v1'] = model.apiVersion.includes('/')
    ? model.apiVersion.split('/')
    : ['', model.apiVersion];
  return {
    group: model.apiGroup ?? group,
    version,
    kind: model.kind,
  };
};
