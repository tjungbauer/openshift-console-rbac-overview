/**
 * @file TabContentGate.tsx
 * Shared permission, loading, and error gates before tab content renders.
 */
import type { FC, ReactNode } from 'react';

import { TabAccessDenied } from './TabAccessDenied';
import { TabErrorAlert, TabLoadingState } from './StateFeedback';
import type { RbacTabKey } from './types';

type TabContentGateProps = {
  tab: RbacTabKey;
  permissions: { loading: boolean; blocked: boolean };
  loaded: boolean;
  error?: unknown;
  permissionNamespace?: string;
  children: ReactNode;
};

export const TabContentGate: FC<TabContentGateProps> = ({
  tab,
  permissions,
  loaded,
  error,
  permissionNamespace,
  children,
}) => {
  if (permissions.loading) {
    return <TabLoadingState />;
  }

  if (permissions.blocked) {
    return <TabAccessDenied tab={tab} namespace={permissionNamespace} />;
  }

  if (!loaded) {
    return <TabLoadingState />;
  }

  if (error) {
    return <TabErrorAlert error={error} />;
  }

  return <>{children}</>;
};
