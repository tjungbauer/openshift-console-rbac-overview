/**
 * @file TabAccessDenied.tsx
 * Full-tab empty state when user lacks all required permissions.
 */
import { Alert, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TabLoadingState } from './StateFeedback';
import type { RbacTabKey } from './types';
import { useTabPermissions } from './useTabPermissions';
import { K } from './i18nKeys';

type TabAccessDeniedProps = {
  tab: RbacTabKey;
  namespace?: string;
};

export const TabAccessDenied: FC<TabAccessDeniedProps> = ({ tab, namespace }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { loading, blocked, missingPermissions } = useTabPermissions(tab, namespace);

  if (loading) {
    return <TabLoadingState />;
  }

  if (!blocked) {
    return null;
  }

  return (
    <EmptyState>
      <EmptyStateBody>
        <Alert variant="warning" isInline title={t(K.common.accessDenied)} className="rbac-overview__access-denied">
          {missingPermissions.length
            ? t(K.permission.tabDeniedWithList, {
                permissions: missingPermissions.join(', '),
              })
            : t(K.permission.tabDenied)}
        </Alert>
      </EmptyStateBody>
    </EmptyState>
  );
};
