/**
 * @file useRbacUrlState.ts
 * Read/write URL search params via react-router (v5-compat shim for Console RR v6).
 */
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import type { RbacUrlParams } from './urlParams';
import { mergeRbacSearchParams, parseRbacSearchParams } from './urlParams';

export function useRbacUrlState() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => parseRbacSearchParams(location.search), [location.search]);

  const updateParams = useCallback(
    (patch: Partial<RbacUrlParams>) => {
      const nextSearch = mergeRbacSearchParams(location.search, patch);
      if (nextSearch !== location.search) {
        navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
      }
    },
    [navigate, location.pathname, location.search],
  );

  return { params, updateParams };
}
