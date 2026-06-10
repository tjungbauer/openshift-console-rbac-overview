/**
 * @file useWhoCanTab.ts
 * Who-can / can-subject forms, API calls, result rows, and URL sync.
 */
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  ResourceAccessReviewResponse,
  SubjectAccessReviewResponse,
  SubjectKind,
  WhoCanScope,
} from './types';
import type { RbacUrlParams } from './urlParams';
import { resolvePermissionNamespace } from './resolvePermissionNamespace';
import { useProjectNamespaces } from './useProjectNamespaces';
import { K } from './i18nKeys';
import {
  formatWhoCanError,
  resolveWhoCanNamespace,
  runCanSubjectQuery,
  runWhoCanQuery,
} from './whoCan';

export type WhoCanQueryMode = NonNullable<RbacUrlParams['whoCanMode']>;

// Map form state to URL params; omit defaults so the query string stays short.
const whoCanParamsFromState = (state: {
  mode: WhoCanQueryMode;
  scope: WhoCanScope;
  verb: string;
  resource: string;
  apiGroup: string;
  subresource: string;
  resourceName: string;
  namespace: string;
  subjectKind: SubjectKind;
  subjectName: string;
  subjectNamespace: string;
}): Partial<RbacUrlParams> => ({
  tab: 'who-can',
  whoCanMode: state.mode === 'who-can' ? undefined : state.mode,
  scope: state.scope === 'namespaced' ? undefined : state.scope,
  verb: state.verb || undefined,
  resource: state.resource || undefined,
  apiGroup: state.apiGroup || undefined,
  subresource: state.subresource || undefined,
  resourceName: state.resourceName || undefined,
  namespace: state.namespace || undefined,
  subjectKind: state.subjectKind === 'User' ? undefined : state.subjectKind,
  subjectName: state.subjectName || undefined,
  subjectNamespace: state.subjectNamespace || undefined,
});

export function useWhoCanTab(
  urlParams: RbacUrlParams,
  updateParams: (patch: Partial<RbacUrlParams>) => void,
) {
  const { t } = useTranslation('plugin__rbac-overview');
  const [activeNamespace] = useActiveNamespace();
  const { namespaces: projectNamespaces } = useProjectNamespaces();
  const [mode, setMode] = useState<WhoCanQueryMode>(urlParams.whoCanMode ?? 'who-can');
  const [scope, setScope] = useState<WhoCanScope>(urlParams.scope ?? 'namespaced');
  const [verb, setVerb] = useState(urlParams.verb ?? 'get');
  const [resource, setResource] = useState(urlParams.resource ?? 'pods');
  const [apiGroup, setApiGroup] = useState(urlParams.apiGroup ?? '');
  const [subresource, setSubresource] = useState(urlParams.subresource ?? '');
  const [resourceName, setResourceName] = useState(urlParams.resourceName ?? '');
  const [namespace, setNamespace] = useState(urlParams.namespace ?? '');
  const [subjectKind, setSubjectKind] = useState<SubjectKind>(urlParams.subjectKind ?? 'User');
  const [subjectName, setSubjectName] = useState(urlParams.subjectName ?? '');
  const [subjectNamespace, setSubjectNamespace] = useState(
    urlParams.subjectNamespace ?? '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whoCanStatus, setWhoCanStatus] = useState<ResourceAccessReviewResponse | null>(null);
  const [canSubjectStatus, setCanSubjectStatus] = useState<SubjectAccessReviewResponse | null>(
    null,
  );
  const [canSubjectEvaluatedGroups, setCanSubjectEvaluatedGroups] = useState<string[] | null>(
    null,
  );
  // One-shot guard: deep links with ?run=1 should auto-search once, not on every re-render.
  const autoRunRef = useRef(false);
  const lastRunAtRef = useRef(0);
  const QUERY_COOLDOWN_MS = 1000;

  const syncUrl = useCallback(
    (run?: boolean) => {
      updateParams({
        ...whoCanParamsFromState({
          mode,
          scope,
          verb,
          resource,
          apiGroup,
          subresource,
          resourceName,
          namespace,
          subjectKind,
          subjectName,
          subjectNamespace,
        }),
        // run=1 triggers the auto-run effect; cleared after a manual search completes.
        run: run ? '1' : undefined,
      });
    },
    [
      apiGroup,
      mode,
      namespace,
      resource,
      resourceName,
      scope,
      subresource,
      subjectKind,
      subjectName,
      subjectNamespace,
      updateParams,
      verb,
    ],
  );

  const runWhoCan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWhoCanStatus(null);
    setCanSubjectStatus(null);
    setCanSubjectEvaluatedGroups(null);

    const resolvedNamespace =
      scope === 'namespaced' ? resolveWhoCanNamespace(namespace, activeNamespace) : undefined;

    // Namespaced who-can requires a single namespace; "All projects" has no default.
    if (scope === 'namespaced' && !resolvedNamespace) {
      setError(
        t(K.whoCan.errorSelectNamespace,
        ),
      );
      setLoading(false);
      return;
    }

    try {
      const response = await runWhoCanQuery({
        verb,
        resource,
        scope,
        namespace: resolvedNamespace,
        resourceAPIGroup: apiGroup,
        subresource,
        resourceName,
      });
      setWhoCanStatus(response);
      syncUrl();
    } catch (err) {
      setError(
        formatWhoCanError(
          err,
          scope === 'cluster'
            ? t(K.whoCan.errorClusterPermission,
              )
            : t(K.whoCan.errorNamespacePermission, { namespace: resolvedNamespace ?? '' }),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeNamespace,
    apiGroup,
    namespace,
    resource,
    resourceName,
    scope,
    subresource,
    syncUrl,
    t,
    verb,
  ]);

  const runCanSubject = useCallback(async () => {
    const trimmedSubject = subjectName.trim();
    if (!trimmedSubject) {
      setError(t(K.canSubject.enterSubjectName));
      return;
    }
    if (subjectKind === 'ServiceAccount' && !subjectNamespace.trim()) {
      setError(t(K.canSubject.saRequiresNamespace));
      return;
    }

    setLoading(true);
    setError(null);
    setWhoCanStatus(null);
    setCanSubjectStatus(null);
    setCanSubjectEvaluatedGroups(null);

    const resolvedNamespace =
      scope === 'namespaced' ? resolveWhoCanNamespace(namespace, activeNamespace) : undefined;

    if (scope === 'namespaced' && !resolvedNamespace) {
      setError(
        t(K.canSubject.errorSelectNamespace,
        ),
      );
      setLoading(false);
      return;
    }

    try {
      const { response, evaluatedGroups } = await runCanSubjectQuery({
        verb,
        resource,
        scope,
        namespace: resolvedNamespace,
        resourceAPIGroup: apiGroup,
        subresource,
        resourceName,
        subjectKind,
        subjectName: trimmedSubject,
        subjectNamespace: subjectNamespace.trim() || undefined,
      });
      setCanSubjectStatus(response);
      setCanSubjectEvaluatedGroups(evaluatedGroups ?? null);
      syncUrl();
    } catch (err) {
      setError(
        formatWhoCanError(
          err,
          scope === 'cluster'
            ? t(K.canSubject.errorClusterPermission,
              )
            : t(K.canSubject.errorNamespacePermission,
                { namespace: resolvedNamespace ?? '' },
              ),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeNamespace,
    apiGroup,
    namespace,
    resource,
    resourceName,
    scope,
    subresource,
    subjectKind,
    subjectName,
    subjectNamespace,
    syncUrl,
    t,
    verb,
  ]);

  const runQuery = useCallback(async () => {
    const now = Date.now();
    if (loading || now - lastRunAtRef.current < QUERY_COOLDOWN_MS) {
      return;
    }
    lastRunAtRef.current = now;
    if (mode === 'who-can') {
      await runWhoCan();
      return;
    }
    await runCanSubject();
  }, [loading, mode, runCanSubject, runWhoCan]);

  // Hydrate form fields when the user navigates via URL or browser back/forward.
  useEffect(() => {
    if (urlParams.whoCanMode) {
      setMode(urlParams.whoCanMode);
    }
    if (urlParams.scope) {
      setScope(urlParams.scope);
    }
    if (urlParams.verb) {
      setVerb(urlParams.verb);
    }
    if (urlParams.resource) {
      setResource(urlParams.resource);
    }
    if (urlParams.apiGroup !== undefined) {
      setApiGroup(urlParams.apiGroup);
    }
    if (urlParams.subresource) {
      setSubresource(urlParams.subresource);
    }
    if (urlParams.resourceName) {
      setResourceName(urlParams.resourceName);
    }
    if (urlParams.namespace) {
      setNamespace(urlParams.namespace);
    }
    if (urlParams.subjectKind) {
      setSubjectKind(urlParams.subjectKind);
    }
    if (urlParams.subjectName) {
      setSubjectName(urlParams.subjectName);
    }
    if (urlParams.subjectNamespace) {
      setSubjectNamespace(urlParams.subjectNamespace);
    }
  }, [
    urlParams.apiGroup,
    urlParams.namespace,
    urlParams.resource,
    urlParams.resourceName,
    urlParams.scope,
    urlParams.subjectKind,
    urlParams.subjectName,
    urlParams.subjectNamespace,
    urlParams.subresource,
    urlParams.verb,
    urlParams.whoCanMode,
  ]);

  useEffect(() => {
    if (urlParams.run !== '1' || autoRunRef.current) {
      return;
    }
    autoRunRef.current = true;
    runQuery();
  }, [runQuery, urlParams.run]);

  // TabPermissionAlert needs a namespace for local* access reviews even before a who-can query runs.
  const permissionNamespace = useMemo(() => {
    const resolved = resolveWhoCanNamespace(namespace, activeNamespace);
    if (resolved) {
      return resolved;
    }
    return resolvePermissionNamespace(activeNamespace, projectNamespaces);
  }, [activeNamespace, namespace, projectNamespaces]);

  return {
    mode,
    scope,
    verb,
    resource,
    apiGroup,
    subresource,
    resourceName,
    namespace,
    subjectKind,
    subjectName,
    subjectNamespace,
    activeNamespace,
    permissionNamespace,
    loading,
    error,
    whoCanStatus,
    canSubjectStatus,
    canSubjectEvaluatedGroups,
    setMode,
    setScope,
    setVerb,
    setResource,
    setApiGroup,
    setSubresource,
    setResourceName,
    setNamespace,
    setSubjectKind,
    setSubjectName,
    setSubjectNamespace,
    syncUrl,
    runQuery,
    queryRunning: loading,
  };
}
