/**
 * @file sccRbac.test.ts
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clusterRoleGrantsSccUse, extractSccRbacUseRows } from '../sccRbac';
import type { RoleBindingLike } from '../types';

describe('clusterRoleGrantsSccUse', () => {
  it('detects explicit SCC use rules', () => {
    assert.equal(
      clusterRoleGrantsSccUse({
        metadata: { name: 'scc-user' },
        rules: [{ verbs: ['use'], resources: ['securitycontextconstraints'] }],
      }),
      true,
    );
  });

  it('rejects roles without SCC use', () => {
    assert.equal(
      clusterRoleGrantsSccUse({
        metadata: { name: 'viewer' },
        rules: [{ verbs: ['get'], resources: ['pods'] }],
      }),
      false,
    );
  });
});

describe('extractSccRbacUseRows', () => {
  it('emits rows for SCC use cluster roles and bindings', () => {
    const clusterRoleBindings: RoleBindingLike[] = [
      {
        metadata: { name: 'scc-binding' },
        roleRef: { kind: 'ClusterRole', name: 'scc-user' },
        subjects: [{ kind: 'User', name: 'alice' }],
      },
    ];

    const rows = extractSccRbacUseRows(
      [
        {
          metadata: { name: 'scc-user' },
          rules: [{ verbs: ['use'], resources: ['securitycontextconstraints'] }],
        },
      ],
      clusterRoleBindings,
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0].clusterRoleName, 'scc-user');
    assert.equal(rows[0].subjectName, 'alice');
  });
});
