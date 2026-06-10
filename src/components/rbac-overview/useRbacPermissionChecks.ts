/**
 * @file useRbacPermissionChecks.ts
 * Central hook: SelfSubjectAccessReview for every resource type the plugin lists.
 */
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  GroupModel,
  LocalResourceAccessReviewModel,
  LocalSubjectAccessReviewModel,
  ProjectModel,
  ResourceAccessReviewModel,
  RoleBindingModel,
  SecurityContextConstraintsModel,
  SelfSubjectReviewModel,
  ServiceAccountModel,
  SubjectAccessReviewModel,
  UserModel,
} from './constants';

export type PermissionCheck = {
  id: string;
  allowed: boolean;
  loading: boolean;
};

/** SelfSubjectAccessReview for list — gates tab data watches (CRB, users, SCCs, …). */
const useListPermission = (
  model: { apiGroup?: string; plural: string },
  id: string,
): PermissionCheck => {
  const [allowed, loading] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'list',
  });
  return { id, allowed, loading };
};

/** SelfSubjectAccessReview for create — gates who-can / can-subject API calls. */
const useCreatePermission = (
  model: { apiGroup?: string; plural: string },
  id: string,
  namespace?: string,
): PermissionCheck => {
  const [allowed, loading] = useAccessReview({
    group: model.apiGroup,
    resource: model.plural,
    verb: 'create',
    namespace,
  });
  return { id, allowed, loading };
};

export type RbacPermissionChecks = {
  clusterRoles: PermissionCheck;
  clusterRoleBindings: PermissionCheck;
  roleBindings: PermissionCheck;
  projects: PermissionCheck;
  users: PermissionCheck;
  groups: PermissionCheck;
  serviceAccounts: PermissionCheck;
  sccs: PermissionCheck;
  resourceAccessReviews: PermissionCheck;
  localResourceAccessReviews: PermissionCheck;
  subjectAccessReviews: PermissionCheck;
  localSubjectAccessReviews: PermissionCheck;
  selfSubjectReviews: PermissionCheck;
};

/** Runs all SelfSubjectAccessReview checks once; safe to share across tabs. */
export function useRbacPermissionChecks(namespace = 'default'): RbacPermissionChecks {
  const clusterRoles = useListPermission(ClusterRoleModel, 'clusterroles');
  const clusterRoleBindings = useListPermission(ClusterRoleBindingModel, 'clusterrolebindings');
  const roleBindings = useListPermission(RoleBindingModel, 'rolebindings');
  const projects = useListPermission(ProjectModel, 'projects');
  const users = useListPermission(UserModel, 'users');
  const groups = useListPermission(GroupModel, 'groups');
  const serviceAccounts = useListPermission(ServiceAccountModel, 'serviceaccounts');
  const sccs = useListPermission(SecurityContextConstraintsModel, 'securitycontextconstraints');
  const resourceAccessReviews = useCreatePermission(ResourceAccessReviewModel, 'resourceaccessreviews');
  // Local* reviews are namespaced — namespace comes from usePermissionNamespace, not hardcoded default.
  const localResourceAccessReviews = useCreatePermission(
    LocalResourceAccessReviewModel,
    'localresourceaccessreviews',
    namespace,
  );
  const subjectAccessReviews = useCreatePermission(SubjectAccessReviewModel, 'subjectaccessreviews');
  const localSubjectAccessReviews = useCreatePermission(
    LocalSubjectAccessReviewModel,
    'localsubjectaccessreviews',
    namespace,
  );
  const selfSubjectReviews = useCreatePermission(SelfSubjectReviewModel, 'selfsubjectreviews');

  return {
    clusterRoles,
    clusterRoleBindings,
    roleBindings,
    projects,
    users,
    groups,
    serviceAccounts,
    sccs,
    resourceAccessReviews,
    localResourceAccessReviews,
    subjectAccessReviews,
    localSubjectAccessReviews,
    selfSubjectReviews,
  };
}
