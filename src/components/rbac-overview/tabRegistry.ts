/**
 * @file tabRegistry.ts
 * Maps each RbacTabKey to React tab component and i18n label key.
 */
import type { FC } from 'react';

import { K } from './i18nKeys';

import { ClusterAdminsTab } from './ClusterAdminsTab';
import { NamespaceAccessTab } from './NamespaceAccessTab';
import { RoleAccessTab } from './RoleAccessTab';
import { SccAccessTab } from './SccAccessTab';
import { SubjectsTab } from './SubjectsTab';
import { WhoCanTab } from './WhoCanTab';
import type { RbacTabKey } from './types';

/** i18n keys for tab titles (plugin__rbac-overview namespace). */
export const RBAC_TAB_LABEL_KEYS: Record<RbacTabKey, string> = {
  'who-can': K.tab.whoCan,
  'cluster-admins': K.tab.clusterAdmins,
  'namespace-access': K.tab.namespaceAccess,
  subjects: K.tab.subjects,
  'role-access': K.tab.roleAccess,
  scc: K.tab.scc,
};

export const RBAC_TAB_COMPONENTS: Record<RbacTabKey, FC> = {
  'who-can': WhoCanTab,
  'cluster-admins': ClusterAdminsTab,
  'namespace-access': NamespaceAccessTab,
  subjects: SubjectsTab,
  'role-access': RoleAccessTab,
  scc: SccAccessTab,
};
