/**
 * @file rbac.test.ts
 * Unit tests for extractClusterAdminRows sensitive-role filtering.
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractClusterAdminRows, extractSubjectsFromBindings } from '../rbac';
import type { RoleBindingLike } from '../types';

describe('extractClusterAdminRows', () => {
  it('includes only sensitive roles', () => {
    const clusterRoleBindings: RoleBindingLike[] = [
      {
        metadata: { name: 'admin-binding' },
        roleRef: { kind: 'ClusterRole', name: 'cluster-admin' },
        subjects: [{ kind: 'User', name: 'alice' }],
      },
      {
        metadata: { name: 'view-binding' },
        roleRef: { kind: 'ClusterRole', name: 'view' },
        subjects: [{ kind: 'User', name: 'bob' }],
      },
    ];

    const rows = extractClusterAdminRows(clusterRoleBindings, [], new Set(['cluster-admin']));
    assert.equal(rows.length, 1);
    assert.equal(rows[0].subjectName, 'alice');
    assert.equal(rows[0].isDangerous, true);
  });
});

describe('extractSubjectsFromBindings', () => {
  it('collects unique subjects from bindings', () => {
    const subjects = extractSubjectsFromBindings(
      [
        {
          metadata: { name: 'crb-a' },
          roleRef: { kind: 'ClusterRole', name: 'view' },
          subjects: [
            { kind: 'Group', name: 'system:authenticated' },
            { kind: 'User', name: 'alice' },
          ],
        },
      ],
      [
        {
          metadata: { name: 'rb-a', namespace: 'default' },
          roleRef: { kind: 'Role', name: 'edit' },
          subjects: [{ kind: 'ServiceAccount', name: 'builder', namespace: 'default' }],
        },
      ],
    );

    assert.equal(subjects.length, 3);
    assert.ok(subjects.some((subject) => subject.kind === 'Group' && subject.name === 'system:authenticated'));
    assert.ok(
      subjects.some(
        (subject) => subject.kind === 'ServiceAccount' && subject.displayName === 'default/builder',
      ),
    );
  });
});
