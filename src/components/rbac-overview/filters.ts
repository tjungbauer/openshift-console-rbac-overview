/**
 * @file filters.ts
 * Client-side row filters (subject kind + name) for each table row type.
 */
import type { SccAccessRow, SccOverviewRow } from './scc';
import type { SccRbacUseRow } from './sccRbac';
import type {
  BindingRow,
  ClusterAdminRow,
  NamespaceAccessRow,
  SubjectKind,
  SubjectListItem,
} from './types';
import type { WhoCanResultRow } from './tableSort';

export const SUBJECT_KIND_OPTIONS: SubjectKind[] = ['User', 'Group', 'ServiceAccount'];

/** Default kind filter on Namespace access (excludes ServiceAccount). */
export const NAMESPACE_ACCESS_DEFAULT_KINDS: SubjectKind[] = ['User', 'Group'];

/** Default kind filter on Subjects tab. */
export const SUBJECTS_DEFAULT_KINDS: SubjectKind[] = ['User', 'Group'];

export type RowFilters = {
  kinds: Set<string>;
  nameQuery: string;
};

export const emptyRowFilters = (): RowFilters => ({
  kinds: new Set<string>(),
  nameQuery: '',
});

export const hasActiveRowFilters = (filters: RowFilters): boolean =>
  filters.kinds.size > 0 || filters.nameQuery.trim().length > 0;

export const matchesKindFilter = (subjectKind: string, kinds: Set<string>): boolean =>
  kinds.size === 0 || kinds.has(subjectKind);

export const matchesNameFilter = (
  name: string,
  query: string,
  subjectNamespace?: string,
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  const haystack = subjectNamespace
    ? `${subjectNamespace}/${name}`.toLowerCase()
    : name.toLowerCase();
  return haystack.includes(normalized);
};

export const filterClusterAdminRows = (
  rows: ClusterAdminRow[],
  filters: RowFilters,
): ClusterAdminRow[] =>
  rows.filter(
    (row) =>
      matchesKindFilter(row.subjectKind, filters.kinds) &&
      matchesNameFilter(row.subjectName, filters.nameQuery, row.subjectNamespace),
  );

export const filterNamespaceAccessRows = (
  rows: NamespaceAccessRow[],
  filters: RowFilters,
): NamespaceAccessRow[] =>
  rows.filter(
    (row) =>
      matchesKindFilter(row.subjectKind, filters.kinds) &&
      matchesNameFilter(row.subjectName, filters.nameQuery, row.subjectNamespace),
  );

export const filterWhoCanResultRows = (
  rows: WhoCanResultRow[],
  filters: RowFilters,
): WhoCanResultRow[] =>
  rows.filter(
    (row) =>
      matchesKindFilter(row.kind, filters.kinds) && matchesNameFilter(row.name, filters.nameQuery),
  );

export const filterSubjectListItems = (
  items: SubjectListItem[],
  filters: RowFilters,
): SubjectListItem[] =>
  items.filter(
    (item) =>
      matchesKindFilter(item.kind, filters.kinds) &&
      matchesNameFilter(item.displayName, filters.nameQuery),
  );

export const filterSccOverviewRows = (
  rows: SccOverviewRow[],
  filters: RowFilters,
): SccOverviewRow[] => {
  const query = filters.nameQuery.trim().toLowerCase();
  if (!query) {
    return rows;
  }
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(query) ||
      row.runAsUserType.toLowerCase().includes(query) ||
      row.seLinuxContextType.toLowerCase().includes(query) ||
      row.volumes.toLowerCase().includes(query),
  );
};

export const filterSccRows = (
  rows: SccAccessRow[],
  filters: RowFilters,
): SccAccessRow[] =>
  rows.filter((row) => {
    const kindMatch = matchesKindFilter(row.subjectKind, filters.kinds);
    const query = filters.nameQuery.trim().toLowerCase();
    const nameMatch =
      !query ||
      row.displayName.toLowerCase().includes(query) ||
      row.sccName.toLowerCase().includes(query);
    return kindMatch && nameMatch;
  });

export const filterSccRbacUseRows = (
  rows: SccRbacUseRow[],
  filters: RowFilters,
): SccRbacUseRow[] =>
  rows.filter((row) => {
    const kindMatch = matchesKindFilter(row.subjectKind, filters.kinds);
    const query = filters.nameQuery.trim().toLowerCase();
    const nameMatch =
      !query ||
      row.displayName.toLowerCase().includes(query) ||
      row.clusterRoleName.toLowerCase().includes(query) ||
      row.bindingName.toLowerCase().includes(query);
    return kindMatch && nameMatch;
  });

export const filterBindingRows = (rows: BindingRow[], filters: RowFilters): BindingRow[] => {
  const normalized = filters.nameQuery.trim().toLowerCase();
  if (!normalized) {
    return rows;
  }
  return rows.filter(
    (row) =>
      row.bindingName.toLowerCase().includes(normalized) ||
      row.roleName.toLowerCase().includes(normalized) ||
      row.roleKind.toLowerCase().includes(normalized) ||
      (row.namespace ?? '').toLowerCase().includes(normalized),
  );
};
