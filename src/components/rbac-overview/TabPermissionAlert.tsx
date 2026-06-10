/**
 * @file TabPermissionAlert.tsx
 * Yellow banner: partial visibility, lists missing permissions.
 */
import { Alert } from '@patternfly/react-core';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { RbacTabKey } from './types';
import { useTabPermissions } from './useTabPermissions';
import { K } from './i18nKeys';

type TabPermissionAlertProps = {
  tab: RbacTabKey;
  namespace?: string;
};

export const TabPermissionAlert: FC<TabPermissionAlertProps> = ({ tab, namespace }) => {
  const { t } = useTranslation('plugin__rbac-overview');
  const { loading, message } = useTabPermissions(tab, namespace);

  if (loading || !message) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      isInline
      title={t(K.common.limitedVisibility)}
      className="rbac-overview__tab-permission-alert"
    >
      {message}
    </Alert>
  );
};
