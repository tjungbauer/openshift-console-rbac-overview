/**
 * @file urlParams.ts
 * Serialize/parse all RBAC Overview URL query params (tab, namespace, subject, who-can fields).
 */
import { RBAC_TAB_KEYS, type RbacTabKey, type SubjectKind, type WhoCanScope } from './types';

/** Default tab when ?tab= is omitted from the URL. */
export const DEFAULT_RBAC_TAB: RbacTabKey = 'who-can';

export type WhoCanUrlMode = 'who-can' | 'can-subject';

export type RbacUrlParams = {
  tab?: RbacTabKey;
  namespace?: string;
  kind?: SubjectKind;
  name?: string;
  subjectNamespace?: string;
  whoCanMode?: WhoCanUrlMode;
  section?: string;
  verb?: string;
  resource?: string;
  scope?: WhoCanScope;
  apiGroup?: string;
  subresource?: string;
  resourceName?: string;
  subjectKind?: SubjectKind;
  subjectName?: string;
  run?: string;
  roleName?: string;
};

const SUBJECT_KINDS: readonly SubjectKind[] = ['User', 'Group', 'ServiceAccount'];

const isSubjectKind = (value: string): value is SubjectKind =>
  (SUBJECT_KINDS as readonly string[]).includes(value);

const isWhoCanMode = (value: string): value is WhoCanUrlMode =>
  value === 'who-can' || value === 'can-subject';

const isWhoCanScope = (value: string): value is WhoCanScope =>
  value === 'namespaced' || value === 'cluster';

const isRbacTabKey = (value: string): value is RbacTabKey =>
  (RBAC_TAB_KEYS as readonly string[]).includes(value);

const setIfPresent = (target: RbacUrlParams, key: keyof RbacUrlParams, value?: string) => {
  const trimmed = value?.trim();
  if (trimmed) {
    target[key] = trimmed as never;
  }
};

export function parseRbacSearchParams(search: string): RbacUrlParams {
  const params = new URLSearchParams(search);
  const result: RbacUrlParams = {};

  const tab = params.get('tab')?.trim();
  if (tab && isRbacTabKey(tab)) {
    result.tab = tab;
  }

  setIfPresent(result, 'namespace', params.get('namespace') ?? undefined);
  setIfPresent(result, 'section', params.get('section') ?? undefined);
  setIfPresent(result, 'verb', params.get('verb') ?? undefined);
  setIfPresent(result, 'resource', params.get('resource') ?? undefined);
  setIfPresent(result, 'apiGroup', params.get('apiGroup') ?? undefined);
  setIfPresent(result, 'subresource', params.get('subresource') ?? undefined);
  setIfPresent(result, 'resourceName', params.get('resourceName') ?? undefined);
  setIfPresent(result, 'subjectName', params.get('subjectName') ?? undefined);
  setIfPresent(result, 'subjectNamespace', params.get('subjectNamespace') ?? undefined);
  setIfPresent(result, 'run', params.get('run') ?? undefined);
  setIfPresent(result, 'roleName', params.get('roleName') ?? undefined);

  const kind = params.get('kind')?.trim();
  if (kind && isSubjectKind(kind)) {
    result.kind = kind;
  }

  const name = params.get('name')?.trim();
  if (name) {
    result.name = name;
  }

  const whoCanMode = params.get('whoCanMode')?.trim();
  if (whoCanMode && isWhoCanMode(whoCanMode)) {
    result.whoCanMode = whoCanMode;
  }

  const scope = params.get('scope')?.trim();
  if (scope && isWhoCanScope(scope)) {
    result.scope = scope;
  }

  const subjectKind = params.get('subjectKind')?.trim();
  if (subjectKind && isSubjectKind(subjectKind)) {
    result.subjectKind = subjectKind;
  }

  return result;
}

export function buildRbacSearchParams(params: RbacUrlParams): string {
  const search = new URLSearchParams();

  if (params.tab && params.tab !== DEFAULT_RBAC_TAB) {
    search.set('tab', params.tab);
  }
  if (params.namespace) {
    search.set('namespace', params.namespace);
  }
  if (params.kind) {
    search.set('kind', params.kind);
  }
  if (params.name) {
    search.set('name', params.name);
  }
  if (params.subjectNamespace) {
    search.set('subjectNamespace', params.subjectNamespace);
  }
  if (params.whoCanMode && params.whoCanMode !== 'who-can') {
    search.set('whoCanMode', params.whoCanMode);
  }
  if (params.section) {
    search.set('section', params.section);
  }
  if (params.verb) {
    search.set('verb', params.verb);
  }
  if (params.resource) {
    search.set('resource', params.resource);
  }
  if (params.scope && params.scope !== 'namespaced') {
    search.set('scope', params.scope);
  }
  if (params.apiGroup) {
    search.set('apiGroup', params.apiGroup);
  }
  if (params.subresource) {
    search.set('subresource', params.subresource);
  }
  if (params.resourceName) {
    search.set('resourceName', params.resourceName);
  }
  if (params.subjectKind && params.subjectKind !== 'User') {
    search.set('subjectKind', params.subjectKind);
  }
  if (params.subjectName) {
    search.set('subjectName', params.subjectName);
  }
  if (params.run === '1') {
    search.set('run', '1');
  }
  if (params.roleName) {
    search.set('roleName', params.roleName);
  }

  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
}

export function mergeRbacSearchParams(
  currentSearch: string,
  patch: Partial<RbacUrlParams>,
): string {
  const merged: RbacUrlParams = { ...parseRbacSearchParams(currentSearch) };

  (Object.keys(patch) as (keyof RbacUrlParams)[]).forEach((key) => {
    const value = patch[key];
    if (value === undefined) {
      delete merged[key];
    } else {
      Object.assign(merged, { [key]: value });
    }
  });

  return buildRbacSearchParams(merged);
}

export function tabKeyFromSearch(search: string): RbacTabKey {
  return parseRbacSearchParams(search).tab ?? DEFAULT_RBAC_TAB;
}
