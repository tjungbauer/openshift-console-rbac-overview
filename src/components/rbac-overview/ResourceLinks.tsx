/**
 * @file ResourceLinks.tsx
 * Console ResourceLink wrappers for subjects, roles, and bindings.
 */
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import type { FC } from 'react';

import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  GroupModel,
  modelGVK,
  ProjectModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
  UserModel,
} from './constants';
import { parseServiceAccountUser } from './whoCan';
import type {
  BindingResourceLinkProps,
  NamespaceResourceLinkProps,
  RoleResourceLinkProps,
  SubjectResourceLinkProps,
  WhoCanSubjectLinkProps,
} from './types';

export const SubjectResourceLink: FC<SubjectResourceLinkProps> = ({
  kind,
  name,
  namespace,
  inline,
}) => {
  if (kind === 'User') {
    return <ResourceLink groupVersionKind={modelGVK(UserModel)} name={name} inline={inline} />;
  }
  if (kind === 'Group') {
    return <ResourceLink groupVersionKind={modelGVK(GroupModel)} name={name} inline={inline} />;
  }
  if (kind === 'ServiceAccount' && namespace) {
    return (
      <ResourceLink
        groupVersionKind={modelGVK(ServiceAccountModel)}
        name={name}
        namespace={namespace}
        inline={inline}
      />
    );
  }
  return <>{name}</>;
};

export const WhoCanSubjectLink: FC<WhoCanSubjectLinkProps> = ({ name }) => {
  const serviceAccount = parseServiceAccountUser(name);
  if (serviceAccount) {
    return (
      <ResourceLink
        groupVersionKind={modelGVK(ServiceAccountModel)}
        name={serviceAccount.name}
        namespace={serviceAccount.namespace}
      />
    );
  }
  return <ResourceLink groupVersionKind={modelGVK(UserModel)} name={name} />;
};

export const BindingResourceLink: FC<BindingResourceLinkProps> = ({
  bindingKind,
  name,
  namespace,
  inline,
}) => {
  if (bindingKind === 'ClusterRoleBinding') {
    return (
      <ResourceLink groupVersionKind={modelGVK(ClusterRoleBindingModel)} name={name} inline={inline} />
    );
  }
  if (namespace) {
    return (
      <ResourceLink
        groupVersionKind={modelGVK(RoleBindingModel)}
        name={name}
        namespace={namespace}
        inline={inline}
      />
    );
  }
  return <>{name}</>;
};

export const NamespaceResourceLink: FC<NamespaceResourceLinkProps> = ({ name }) => {
  if (!name) {
    return <>—</>;
  }
  return <ResourceLink groupVersionKind={modelGVK(ProjectModel)} name={name} />;
};

export const RoleResourceLink: FC<RoleResourceLinkProps> = ({
  roleKind,
  name,
  namespace,
  inline,
}) => {
  if (roleKind === 'ClusterRole') {
    return <ResourceLink groupVersionKind={modelGVK(ClusterRoleModel)} name={name} inline={inline} />;
  }
  if (roleKind === 'Role' && namespace) {
    return (
      <ResourceLink
        groupVersionKind={modelGVK(RoleModel)}
        name={name}
        namespace={namespace}
        inline={inline}
      />
    );
  }
  return <>{name}</>;
};
