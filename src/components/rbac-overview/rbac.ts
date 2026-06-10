/**
 * @file rbac.ts
 * Extract and sort binding rows from ClusterRoleBinding / RoleBinding lists; cluster-admin detection.
 */
import type {
  BindingRow,
  ClusterAdminRow,
  NamespaceAccessRow,
  RoleBindingLike,
  SubjectKind,
  SubjectListItem,
  SubjectRef,
} from './types';

const SUBJECT_KINDS: ReadonlySet<string> = new Set(['User', 'Group', 'ServiceAccount']);

export const subjectKey = (subject: SubjectRef): string =>
  subject.kind === 'ServiceAccount'
    ? `${subject.kind}/${subject.namespace}/${subject.name}`
    : `${subject.kind}/${subject.name}`;

export const matchesSubject = (
  bindingSubject: { kind: string; name: string; namespace?: string },
  selected: SubjectRef,
): boolean => {
  if (bindingSubject.kind !== selected.kind || bindingSubject.name !== selected.name) {
    return false;
  }
  if (selected.kind === 'ServiceAccount') {
    return bindingSubject.namespace === selected.namespace;
  }
  return true;
};

const toSubjectListItem = (
  kind: string,
  name: string,
  namespace?: string,
): SubjectListItem | null => {
  if (!name || !SUBJECT_KINDS.has(kind)) {
    return null;
  }
  const subjectKind = kind as SubjectKind;
  if (subjectKind === 'ServiceAccount') {
    return {
      kind: subjectKind,
      name,
      namespace,
      displayName: namespace ? `${namespace}/${name}` : name,
    };
  }
  return { kind: subjectKind, name, displayName: name };
};

/** Unique subjects referenced in RoleBindings / ClusterRoleBindings. */
export const extractSubjectsFromBindings = (
  clusterRoleBindings: RoleBindingLike[],
  roleBindings: RoleBindingLike[],
): SubjectListItem[] => {
  const byKey = new Map<string, SubjectListItem>();

  const add = (kind: string, name: string, namespace?: string) => {
    const item = toSubjectListItem(kind, name, namespace);
    if (item) {
      byKey.set(subjectKey(item), item);
    }
  };

  clusterRoleBindings?.forEach((binding) => {
    binding.subjects?.forEach((subject) => add(subject.kind, subject.name, subject.namespace));
  });
  roleBindings?.forEach((binding) => {
    binding.subjects?.forEach((subject) => add(subject.kind, subject.name, subject.namespace));
  });

  return Array.from(byKey.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export const mergeSubjectLists = (...lists: SubjectListItem[][]): SubjectListItem[] => {
  const byKey = new Map<string, SubjectListItem>();
  lists.flat().forEach((item) => byKey.set(subjectKey(item), item));
  return Array.from(byKey.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export const extractBindingsForSubject = (
  clusterRoleBindings: RoleBindingLike[],
  roleBindings: RoleBindingLike[],
  subject: SubjectRef,
): BindingRow[] => {
  const rows: BindingRow[] = [];

  clusterRoleBindings?.forEach((crb) => {
    const match = crb.subjects?.some((s) => matchesSubject(s, subject));
    if (!match) {
      return;
    }
    rows.push({
      bindingName: crb.metadata?.name ?? '',
      roleKind: crb.roleRef?.kind ?? 'ClusterRole',
      roleName: crb.roleRef?.name ?? '',
      scope: 'cluster',
      bindingKind: 'ClusterRoleBinding',
    });
  });

  roleBindings?.forEach((rb) => {
    const match = rb.subjects?.some((s) => matchesSubject(s, subject));
    if (!match) {
      return;
    }
    rows.push({
      bindingName: rb.metadata?.name ?? '',
      roleKind: rb.roleRef?.kind ?? 'Role',
      roleName: rb.roleRef?.name ?? '',
      scope: 'namespace',
      namespace: rb.metadata?.namespace,
      bindingKind: 'RoleBinding',
    });
  });

  return rows.sort((a, b) => {
    const scopeOrder = a.scope === b.scope ? 0 : a.scope === 'cluster' ? -1 : 1;
    if (scopeOrder !== 0) {
      return scopeOrder;
    }
    return a.roleName.localeCompare(b.roleName);
  });
};

export const extractClusterAdminRows = (
  clusterRoleBindings: RoleBindingLike[],
  roleBindings: RoleBindingLike[],
  sensitiveRoleNames: Set<string>,
): ClusterAdminRow[] => {
  const rows: ClusterAdminRow[] = [];

  const pushRows = (
    binding: RoleBindingLike,
    scope: 'cluster' | 'namespace',
    bindingKind: 'ClusterRoleBinding' | 'RoleBinding',
  ) => {
    const roleName = binding.roleRef?.name ?? '';
    if (!sensitiveRoleNames.has(roleName)) {
      return;
    }
    binding.subjects?.forEach((subject) => {
      rows.push({
        bindingName: binding.metadata?.name ?? '',
        bindingKind,
        subjectKind: subject.kind,
        subjectName: subject.name,
        subjectNamespace: subject.namespace,
        roleKind: binding.roleRef?.kind ?? (scope === 'cluster' ? 'ClusterRole' : 'Role'),
        roleName,
        scope,
        namespace: binding.metadata?.namespace,
        isDangerous: roleName === 'cluster-admin' && scope === 'cluster',
      });
    });
  };

  clusterRoleBindings?.forEach((crb) => pushRows(crb, 'cluster', 'ClusterRoleBinding'));
  roleBindings?.forEach((rb) => pushRows(rb, 'namespace', 'RoleBinding'));

  return rows.sort((a, b) => {
    if (a.isDangerous !== b.isDangerous) {
      return a.isDangerous ? -1 : 1;
    }
    return a.subjectName.localeCompare(b.subjectName);
  });
};

const compareNamespaceAccessRows = (a: NamespaceAccessRow, b: NamespaceAccessRow): number => {
  const kindOrder = a.subjectKind.localeCompare(b.subjectKind);
  if (kindOrder !== 0) {
    return kindOrder;
  }
  const nameOrder = a.subjectName.localeCompare(b.subjectName);
  if (nameOrder !== 0) {
    return nameOrder;
  }
  return a.roleName.localeCompare(b.roleName);
};

export const extractNamespaceRoleBindingRows = (
  roleBindings: RoleBindingLike[],
): NamespaceAccessRow[] => {
  const rows: NamespaceAccessRow[] = [];

  roleBindings?.forEach((binding) => {
    const namespace = binding.metadata?.namespace ?? '';
    binding.subjects?.forEach((subject) => {
      rows.push({
        subjectKind: subject.kind,
        subjectName: subject.name,
        subjectNamespace: subject.namespace,
        bindingName: binding.metadata?.name ?? '',
        bindingKind: 'RoleBinding',
        roleKind: binding.roleRef?.kind ?? 'Role',
        roleName: binding.roleRef?.name ?? '',
        namespace,
        accessType: 'namespace',
      });
    });
  });

  return rows.sort(compareNamespaceAccessRows);
};

export const extractClusterRoleBindingAccessRows = (
  clusterRoleBindings: RoleBindingLike[],
): NamespaceAccessRow[] => {
  const rows: NamespaceAccessRow[] = [];

  clusterRoleBindings?.forEach((binding) => {
    binding.subjects?.forEach((subject) => {
      rows.push({
        subjectKind: subject.kind,
        subjectName: subject.name,
        subjectNamespace: subject.namespace,
        bindingName: binding.metadata?.name ?? '',
        bindingKind: 'ClusterRoleBinding',
        roleKind: binding.roleRef?.kind ?? 'ClusterRole',
        roleName: binding.roleRef?.name ?? '',
        accessType: 'cluster',
      });
    });
  });

  return rows.sort(compareNamespaceAccessRows);
};

export const countUniqueNamespaceSubjects = (rows: NamespaceAccessRow[]): number => {
  const keys = new Set(
    rows.map((row) =>
      row.subjectKind === 'ServiceAccount'
        ? `${row.subjectKind}/${row.subjectNamespace}/${row.subjectName}`
        : `${row.subjectKind}/${row.subjectName}`,
    ),
  );
  return keys.size;
};
