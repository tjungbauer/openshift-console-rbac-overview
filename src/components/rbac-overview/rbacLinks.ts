/**
 * @file rbacLinks.ts
 * Build in-app paths like /rbac-overview?tab=subjects&subject=… for cross-tab navigation.
 */
import type { SubjectKind } from './types';
import { buildRbacSearchParams, type RbacUrlParams } from './urlParams';

export const RBAC_OVERVIEW_BASE_PATH = '/rbac-overview';

export function buildRbacOverviewPath(params: RbacUrlParams = {}): string {
  return `${RBAC_OVERVIEW_BASE_PATH}${buildRbacSearchParams(params)}`;
}

export function buildSubjectsTabPath(
  kind: SubjectKind,
  name: string,
  subjectNamespace?: string,
): RbacUrlParams {
  return {
    tab: 'subjects',
    kind,
    name,
    subjectNamespace,
  };
}

export function buildCanSubjectPath(options: {
  subjectKind: SubjectKind;
  subjectName: string;
  subjectNamespace?: string;
  verb?: string;
  resource?: string;
  scope?: 'namespaced' | 'cluster';
  namespace?: string;
  apiGroup?: string;
  subresource?: string;
  resourceName?: string;
}): RbacUrlParams {
  return {
    tab: 'who-can',
    whoCanMode: 'can-subject',
    run: '1',
    ...options,
  };
}
