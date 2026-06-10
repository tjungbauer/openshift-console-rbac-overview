/**
 * @file tableSort.ts
 * Default sort direction and comparator functions per table.
 */
import type { ISortBy } from '@patternfly/react-table';

import type { SccAccessRow, SccOverviewRow } from './scc';
import type { SccRbacUseRow } from './sccRbac';
import type { BindingRow, ClusterAdminRow, NamespaceAccessRow } from './types';

export const DEFAULT_SORT_CLUSTER_WIDE: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_NAMESPACE_ELEVATED: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_NAMESPACE_ACCESS: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_WHO_CAN: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_BINDINGS: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_SCC: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_SCC_OVERVIEW: ISortBy = { index: 0, direction: 'asc' };
export const DEFAULT_SORT_SCC_RBAC: ISortBy = { index: 0, direction: 'asc' };

const compareStrings = (a: string, b: string, direction: ISortBy['direction']): number => {
  const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' });
  return direction === 'desc' ? -cmp : cmp;
};

const directionMultiplier = (direction: ISortBy['direction']): number =>
  direction === 'desc' ? -1 : 1;

export const sortClusterWideAdminRows = (
  rows: ClusterAdminRow[],
  sortBy: ISortBy,
): ClusterAdminRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.subjectKind, b.subjectKind, dir);
        break;
      case 1:
        cmp = compareStrings(a.subjectName, b.subjectName, dir);
        break;
      case 2:
        cmp = compareStrings(a.roleName, b.roleName, dir);
        break;
      case 3:
        cmp = compareStrings(a.bindingName, b.bindingName, dir);
        break;
      default:
        cmp = compareStrings(a.subjectKind, b.subjectKind, dir);
    }
    return cmp;
  });
};

export const sortNamespaceElevatedRows = (
  rows: ClusterAdminRow[],
  sortBy: ISortBy,
): ClusterAdminRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  const mult = directionMultiplier(dir);
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.subjectName, b.subjectName, 'asc');
        if (cmp === 0) {
          cmp = compareStrings(a.subjectKind, b.subjectKind, 'asc');
        }
        break;
      case 1:
        cmp = compareStrings(a.roleName, b.roleName, 'asc');
        break;
      case 2:
        cmp = compareStrings(a.namespace ?? '', b.namespace ?? '', 'asc');
        break;
      case 3:
        cmp = compareStrings(a.bindingName, b.bindingName, 'asc');
        break;
      default:
        cmp = compareStrings(a.subjectName, b.subjectName, 'asc');
    }
    return cmp * mult;
  });
};

export const sortNamespaceAccessRows = (
  rows: NamespaceAccessRow[],
  sortBy: ISortBy,
): NamespaceAccessRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.subjectKind, b.subjectKind, dir);
        break;
      case 1:
        cmp = compareStrings(a.subjectName, b.subjectName, dir);
        if (cmp === 0) {
          cmp = compareStrings(a.subjectNamespace ?? '', b.subjectNamespace ?? '', dir);
        }
        break;
      case 2:
        cmp = compareStrings(a.bindingName, b.bindingName, dir);
        break;
      case 3:
        cmp = compareStrings(a.roleName, b.roleName, dir);
        break;
      default:
        cmp = compareStrings(a.subjectKind, b.subjectKind, dir);
    }
    return cmp;
  });
};

export type WhoCanResultRow = {
  key: string;
  kind: string;
  name: string;
};

export const buildWhoCanResultRows = (
  users: string[] = [],
  groups: string[] = [],
): WhoCanResultRow[] => [
  ...users.map((name) => ({ key: `user/${name}`, kind: 'User', name })),
  ...groups.map((name) => ({ key: `group/${name}`, kind: 'Group', name })),
];

export const sortBindingRows = (rows: BindingRow[], sortBy: ISortBy): BindingRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.bindingName, b.bindingName, dir);
        break;
      case 1:
        cmp = compareStrings(a.scope, b.scope, dir);
        break;
      case 2:
        cmp = compareStrings(a.namespace ?? '', b.namespace ?? '', dir);
        break;
      case 3:
        cmp = compareStrings(a.roleKind, b.roleKind, dir);
        break;
      case 4:
        cmp = compareStrings(a.roleName, b.roleName, dir);
        break;
      default:
        cmp = compareStrings(a.bindingName, b.bindingName, dir);
    }
    return cmp;
  });
};

export const sortSccOverviewRows = (rows: SccOverviewRow[], sortBy: ISortBy): SccOverviewRow[] => {
  const idx = sortBy.index ?? 0;
  const mult = directionMultiplier(sortBy.direction ?? 'asc');
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.name, b.name, 'asc');
        break;
      case 1:
        cmp = (a.priority ?? 0) - (b.priority ?? 0);
        break;
      case 2:
        cmp = Number(a.allowPrivilegedContainer) - Number(b.allowPrivilegedContainer);
        break;
      case 3:
        cmp = Number(a.allowHostNetwork) - Number(b.allowHostNetwork);
        break;
      case 4:
        cmp = compareStrings(a.runAsUserType, b.runAsUserType, 'asc');
        break;
      case 5:
        cmp = compareStrings(a.seLinuxContextType, b.seLinuxContextType, 'asc');
        break;
      case 6:
        cmp = compareStrings(a.volumes, b.volumes, 'asc');
        break;
      case 7:
        cmp = a.directSubjectCount - b.directSubjectCount;
        break;
      default:
        cmp = compareStrings(a.name, b.name, 'asc');
    }
    return cmp * mult;
  });
};

export const sortSccRows = (rows: SccAccessRow[], sortBy: ISortBy): SccAccessRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.sccName, b.sccName, dir);
        break;
      case 1:
        cmp = ((a.priority ?? 0) - (b.priority ?? 0)) * directionMultiplier(dir);
        break;
      case 2:
        cmp = compareStrings(a.subjectKind, b.subjectKind, dir);
        break;
      case 3:
        cmp = compareStrings(a.displayName, b.displayName, dir);
        break;
      default:
        cmp = compareStrings(a.sccName, b.sccName, dir);
    }
    return cmp;
  });
};

export const sortSccRbacUseRows = (rows: SccRbacUseRow[], sortBy: ISortBy): SccRbacUseRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.clusterRoleName, b.clusterRoleName, dir);
        break;
      case 1:
        cmp = compareStrings(a.bindingName, b.bindingName, dir);
        break;
      case 2:
        cmp = compareStrings(a.subjectKind, b.subjectKind, dir);
        break;
      case 3:
        cmp = compareStrings(a.displayName, b.displayName, dir);
        break;
      default:
        cmp = compareStrings(a.clusterRoleName, b.clusterRoleName, dir);
    }
    return cmp;
  });
};

export const sortWhoCanResultRows = (
  rows: WhoCanResultRow[],
  sortBy: ISortBy,
): WhoCanResultRow[] => {
  const idx = sortBy.index ?? 0;
  const dir = sortBy.direction ?? 'asc';
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (idx) {
      case 0:
        cmp = compareStrings(a.kind, b.kind, dir);
        break;
      case 1:
        cmp = compareStrings(a.name, b.name, dir);
        break;
      default:
        cmp = compareStrings(a.kind, b.kind, dir);
    }
    return cmp;
  });
};
