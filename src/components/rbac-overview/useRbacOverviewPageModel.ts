/**
 * @file useRbacOverviewPageModel.ts
 * i18n t(), active tab from URL, pushRbacTab() navigation.
 */
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import type { RbacTabKey } from './types';
import { DEFAULT_RBAC_TAB, mergeRbacSearchParams, tabKeyFromSearch } from './urlParams';

export type RbacOverviewPageModel = ReturnType<typeof useRbacOverviewPageModel>;

export function useRbacOverviewPageModel() {
  const { t } = useTranslation('plugin__rbac-overview');
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => tabKeyFromSearch(location.search), [location.search]);

  const pushRbacTab = useCallback(
    (key: RbacTabKey) => {
      const nextSearch = mergeRbacSearchParams(location.search, {
        tab: key === DEFAULT_RBAC_TAB ? undefined : key,
      });
      navigate({ pathname: location.pathname, search: nextSearch });
    },
    [navigate, location.pathname, location.search],
  );

  return {
    t,
    activeTab,
    pushRbacTab,
  };
}
