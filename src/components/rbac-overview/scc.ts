/**
 * @file scc.ts
 * Parse SecurityContextConstraints .users / .groups / .serviceAccounts into table rows.
 */
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type SccContextConstraint = {
  type?: string;
};

export type SecurityContextConstraints = K8sResourceCommon & {
  priority?: number;
  allowPrivilegedContainer?: boolean;
  allowHostNetwork?: boolean;
  allowHostPID?: boolean;
  allowHostIPC?: boolean;
  readOnlyRootFilesystem?: boolean;
  runAsUser?: SccContextConstraint;
  seLinuxContext?: SccContextConstraint;
  volumes?: string[];
  users?: string[];
  groups?: string[];
  serviceAccounts?: string[];
};

export type SccOverviewRow = {
  key: string;
  name: string;
  priority?: number;
  allowPrivilegedContainer: boolean;
  allowHostNetwork: boolean;
  allowHostPID: boolean;
  allowHostIPC: boolean;
  readOnlyRootFilesystem: boolean;
  runAsUserType: string;
  seLinuxContextType: string;
  volumes: string;
  directSubjectCount: number;
};

const formatSccContextType = (value?: SccContextConstraint): string => value?.type?.trim() || '—';

const formatSccVolumeList = (values?: string[]): string => {
  if (!values?.length) {
    return '—';
  }
  return values.join(', ');
};

export const extractSccOverviewRows = (sccs: SecurityContextConstraints[]): SccOverviewRow[] => {
  const rows: SccOverviewRow[] = [];

  sccs.forEach((scc) => {
    const name = scc.metadata?.name ?? '';
    if (!name) {
      return;
    }
    const userCount = scc.users?.length ?? 0;
    const groupCount = scc.groups?.length ?? 0;
    const serviceAccountCount = scc.serviceAccounts?.length ?? 0;
    rows.push({
      key: name,
      name,
      priority: scc.priority,
      allowPrivilegedContainer: Boolean(scc.allowPrivilegedContainer),
      allowHostNetwork: Boolean(scc.allowHostNetwork),
      allowHostPID: Boolean(scc.allowHostPID),
      allowHostIPC: Boolean(scc.allowHostIPC),
      readOnlyRootFilesystem: Boolean(scc.readOnlyRootFilesystem),
      runAsUserType: formatSccContextType(scc.runAsUser),
      seLinuxContextType: formatSccContextType(scc.seLinuxContext),
      volumes: formatSccVolumeList(scc.volumes),
      directSubjectCount: userCount + groupCount + serviceAccountCount,
    });
  });

  return rows.sort((a, b) => a.name.localeCompare(b.name));
};

export type SccAccessRow = {
  key: string;
  sccName: string;
  priority?: number;
  subjectKind: 'User' | 'Group' | 'ServiceAccount';
  subjectName: string;
  subjectNamespace?: string;
  displayName: string;
};

const parseServiceAccountRef = (
  ref: string,
): { namespace: string; name: string } | null => {
  const slashIndex = ref.indexOf(':');
  if (slashIndex <= 0) {
    return null;
  }
  return {
    namespace: ref.slice(0, slashIndex),
    name: ref.slice(slashIndex + 1),
  };
};

export const extractSccAccessRows = (
  sccs: SecurityContextConstraints[],
  hiddenSccNames: string[] = [],
): SccAccessRow[] => {
  const hidden = new Set(hiddenSccNames.map((name) => name.toLowerCase()));
  const rows: SccAccessRow[] = [];

  sccs.forEach((scc) => {
    const sccName = scc.metadata?.name ?? '';
    if (!sccName || hidden.has(sccName.toLowerCase())) {
      return;
    }

    scc.users?.forEach((user) => {
      rows.push({
        key: `${sccName}/User/${user}`,
        sccName,
        priority: scc.priority,
        subjectKind: 'User',
        subjectName: user,
        displayName: user,
      });
    });

    scc.groups?.forEach((group) => {
      rows.push({
        key: `${sccName}/Group/${group}`,
        sccName,
        priority: scc.priority,
        subjectKind: 'Group',
        subjectName: group,
        displayName: group,
      });
    });

    scc.serviceAccounts?.forEach((serviceAccountRef) => {
      const parsed = parseServiceAccountRef(serviceAccountRef);
      if (!parsed) {
        return;
      }
      rows.push({
        key: `${sccName}/ServiceAccount/${parsed.namespace}/${parsed.name}`,
        sccName,
        priority: scc.priority,
        subjectKind: 'ServiceAccount',
        subjectName: parsed.name,
        subjectNamespace: parsed.namespace,
        displayName: `${parsed.namespace}/${parsed.name}`,
      });
    });
  });

  return rows.sort((a, b) => {
    const sccOrder = a.sccName.localeCompare(b.sccName);
    if (sccOrder !== 0) {
      return sccOrder;
    }
    const kindOrder = a.subjectKind.localeCompare(b.subjectKind);
    if (kindOrder !== 0) {
      return kindOrder;
    }
    return a.displayName.localeCompare(b.displayName);
  });
};

export const countUniqueSccSubjects = (rows: SccAccessRow[]): number =>
  new Set(rows.map((row) => row.key)).size;
