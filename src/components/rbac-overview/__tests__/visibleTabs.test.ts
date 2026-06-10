/**
 * @file visibleTabs.test.ts
 * Tab bar visibility and ordering for permission-limited users.
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { TabAccessState } from '../tabAccess';
import type { RbacTabKey } from '../types';
import { getVisibleRbacTabs } from '../visibleTabs';

const denied = (): TabAccessState => ({
  loading: false,
  accessible: false,
  blocked: true,
  missing: ['test'],
});

const allowed = (): TabAccessState => ({
  loading: false,
  accessible: true,
  blocked: false,
  missing: [],
});

const allDenied = (): Record<RbacTabKey, TabAccessState> => ({
  'who-can': denied(),
  'cluster-admins': denied(),
  'namespace-access': denied(),
  subjects: denied(),
  'role-access': denied(),
  scc: denied(),
});

describe('getVisibleRbacTabs', () => {
  it('always includes who-can and pins it first for normal users', () => {
    const tabs = getVisibleRbacTabs({
      ...allDenied(),
      'namespace-access': allowed(),
    });

    assert.deepEqual(tabs, ['who-can', 'namespace-access']);
  });

  it('lists only who-can when no other tab is accessible', () => {
    assert.deepEqual(getVisibleRbacTabs(allDenied()), ['who-can']);
  });
});
