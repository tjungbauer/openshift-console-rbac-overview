/**
 * @file useTabPermissions.ts
 * Per-tab permission messages (what is missing) for TabPermissionAlert.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { evaluateTabAccess, tabChecksForKey } from './tabAccess';
import type { RbacTabKey } from './types';
import { useRbacPermissionChecks } from './useRbacPermissionChecks';
import { K } from './i18nKeys';

export function useTabPermissions(tab: RbacTabKey, namespace = 'default') {
  const { t } = useTranslation('plugin__rbac-overview');
  const checks = useRbacPermissionChecks(namespace);
  const tabChecks = useMemo(() => tabChecksForKey(tab, checks), [checks, tab]);
  const access = useMemo(() => evaluateTabAccess(tabChecks), [tabChecks]);

  const missingPermissions = useMemo(
    () =>
      access.missing.map((id) => t(`permission.${id}`, { defaultValue: id })),
    [access.missing, t],
  );

  const message = useMemo(() => {
    if (access.loading || access.missing.length === 0) {
      return null;
    }
    return t(K.permission.limitedTab, {
      permissions: missingPermissions.join(', '),
    });
  }, [access.loading, access.missing.length, missingPermissions, t]);

  return {
    loading: access.loading,
    accessible: access.accessible,
    blocked: access.blocked,
    missing: access.missing,
    missingPermissions,
    message,
  };
}
