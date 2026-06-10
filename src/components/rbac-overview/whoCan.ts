/**
 * @file whoCan.ts
 * Build and POST ResourceAccessReview, LocalResourceAccessReview, and SubjectAccessReview API calls.
 */
import { isAllNamespacesKey, k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import {
  ALL_NAMESPACES_KEY,
  LocalResourceAccessReviewModel,
  LocalSubjectAccessReviewModel,
  OPENSHIFT_AUTHORIZATION_API_VERSION,
  ResourceAccessReviewModel,
  SERVICE_ACCOUNT_USER_PREFIX,
  SubjectAccessReviewModel,
} from './constants';
import { resolveUserGroupMembership } from './identity';
import { k8sClientErrorMessage } from './k8sClientError';
import type {
  CanSubjectQuery,
  CanSubjectQueryResult,
  ResourceAccessReviewResponse,
  SubjectKind,
  WhoCanQuery,
} from './types';

export function resolveWhoCanNamespace(
  namespaceInput: string,
  activeNamespace?: string,
): string | undefined {
  const trimmed = namespaceInput.trim();
  if (trimmed && !isAllNamespacesKey(trimmed)) {
    return trimmed;
  }
  if (activeNamespace && !isAllNamespacesKey(activeNamespace)) {
    return activeNamespace;
  }
  return undefined;
}

export function formatWhoCanError(error: unknown, fallbackMessage: string): string {
  const raw = k8sClientErrorMessage(error);
  if (!raw) {
    return fallbackMessage;
  }

  const lower = raw.toLowerCase();
  if (lower.includes('forbidden') && lower.includes('authorization.openshift.io')) {
    return fallbackMessage;
  }

  if (raw.includes(ALL_NAMESPACES_KEY)) {
    return fallbackMessage;
  }

  return raw;
}

const authorizationBody = ({
  verb,
  resource,
  resourceAPIGroup = '',
  resourceAPIVersion = 'v1',
  namespace,
  subresource,
  resourceName,
}: {
  verb: string;
  resource: string;
  resourceAPIGroup?: string;
  resourceAPIVersion?: string;
  namespace?: string;
  subresource?: string;
  resourceName?: string;
}) => ({
  verb: verb.trim(),
  resource: resource.trim(),
  resourceAPIGroup: resourceAPIGroup.trim(),
  resourceAPIVersion: resourceAPIVersion.trim() || 'v1',
  ...(namespace ? { namespace } : {}),
  ...(subresource?.trim() ? { subresource: subresource.trim() } : {}),
  ...(resourceName?.trim() ? { resourceName: resourceName.trim() } : {}),
});

export function subjectToAuthorizationUser(
  subjectKind: SubjectKind,
  subjectName: string,
  subjectNamespace?: string,
  userGroups?: string[],
): { user?: string; groups?: string[] } {
  if (subjectKind === 'User') {
    return {
      user: subjectName,
      ...(userGroups?.length ? { groups: userGroups } : {}),
    };
  }
  if (subjectKind === 'Group') {
    return { groups: [subjectName] };
  }
  if (subjectNamespace) {
    return {
      user: `${SERVICE_ACCOUNT_USER_PREFIX}${subjectNamespace}:${subjectName}`,
    };
  }
  return { user: subjectName };
}

export function buildResourceAccessReview(query: WhoCanQuery) {
  return {
    apiVersion: OPENSHIFT_AUTHORIZATION_API_VERSION,
    kind: 'ResourceAccessReview',
    ...authorizationBody(query),
  };
}

export function buildLocalResourceAccessReview(query: WhoCanQuery) {
  return {
    apiVersion: OPENSHIFT_AUTHORIZATION_API_VERSION,
    kind: 'LocalResourceAccessReview',
    ...authorizationBody(query),
    namespace: query.namespace,
  };
}

export function buildSubjectAccessReview(
  query: CanSubjectQuery,
  userGroups?: string[],
) {
  return {
    apiVersion: OPENSHIFT_AUTHORIZATION_API_VERSION,
    kind: 'SubjectAccessReview',
    ...authorizationBody(query),
    ...subjectToAuthorizationUser(
      query.subjectKind,
      query.subjectName,
      query.subjectNamespace,
      userGroups,
    ),
  };
}

export function buildLocalSubjectAccessReview(
  query: CanSubjectQuery,
  userGroups?: string[],
) {
  return {
    apiVersion: OPENSHIFT_AUTHORIZATION_API_VERSION,
    kind: 'LocalSubjectAccessReview',
    ...authorizationBody(query),
    namespace: query.namespace,
    ...subjectToAuthorizationUser(
      query.subjectKind,
      query.subjectName,
      query.subjectNamespace,
      userGroups,
    ),
  };
}

export async function runWhoCanQuery(query: WhoCanQuery): Promise<ResourceAccessReviewResponse> {
  if (query.scope === 'cluster') {
    const response = await k8sCreate({
      model: ResourceAccessReviewModel,
      data: buildResourceAccessReview(query),
    });
    return response as ResourceAccessReviewResponse;
  }

  if (!query.namespace) {
    throw new Error('Namespace is required for namespaced who-can queries.');
  }

  const response = await k8sCreate({
    model: LocalResourceAccessReviewModel,
    data: buildLocalResourceAccessReview(query),
    ns: query.namespace,
  });
  return response as ResourceAccessReviewResponse;
}

export async function runCanSubjectQuery(query: CanSubjectQuery): Promise<CanSubjectQueryResult> {
  const evaluatedGroups =
    query.subjectKind === 'User'
      ? await resolveUserGroupMembership(query.subjectName)
      : undefined;

  if (query.scope === 'cluster') {
    const response = await k8sCreate({
      model: SubjectAccessReviewModel,
      data: buildSubjectAccessReview(query, evaluatedGroups),
    });
    return {
      response: response as CanSubjectQueryResult['response'],
      evaluatedGroups,
    };
  }

  if (!query.namespace) {
    throw new Error('Namespace is required for namespaced can-subject queries.');
  }

  const response = await k8sCreate({
    model: LocalSubjectAccessReviewModel,
    data: buildLocalSubjectAccessReview(query, evaluatedGroups),
    ns: query.namespace,
  });
  return {
    response: response as CanSubjectQueryResult['response'],
    evaluatedGroups,
  };
}

export function parseServiceAccountUser(
  userName: string,
): { namespace: string; name: string } | null {
  if (!userName.startsWith(SERVICE_ACCOUNT_USER_PREFIX)) {
    return null;
  }
  const remainder = userName.slice(SERVICE_ACCOUNT_USER_PREFIX.length);
  const slashIndex = remainder.indexOf(':');
  if (slashIndex <= 0) {
    return null;
  }
  return {
    namespace: remainder.slice(0, slashIndex),
    name: remainder.slice(slashIndex + 1),
  };
}
