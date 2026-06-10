/**
 * @file canSubjectReasonParser.test.ts
 * Unit tests for SAR reason string parsing.
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCanSubjectReason } from '../canSubjectReasonParser';

describe('parseCanSubjectReason', () => {
  it('parses RoleBinding reasons', () => {
    const parsed = parseCanSubjectReason(
      'RBAC: allowed by RoleBinding "test/aap" of ClusterRole "view" to Group "test"',
    );
    assert.equal(parsed?.bindingKind, 'RoleBinding');
    assert.equal(parsed?.bindingName, 'test');
    assert.equal(parsed?.bindingNamespace, 'aap');
    assert.equal(parsed?.roleName, 'view');
    assert.equal(parsed?.subjectKind, 'Group');
    assert.equal(parsed?.subjectName, 'test');
  });

  it('parses ClusterRoleBinding reasons', () => {
    const parsed = parseCanSubjectReason(
      'RBAC: allowed by ClusterRoleBinding "cluster-admins" of ClusterRole "cluster-admin" to Group "system:cluster-admins"',
    );
    assert.equal(parsed?.bindingKind, 'ClusterRoleBinding');
    assert.equal(parsed?.bindingName, 'cluster-admins');
    assert.equal(parsed?.roleName, 'cluster-admin');
  });

  it('returns null for unknown reasons', () => {
    assert.equal(parseCanSubjectReason('some other message'), null);
  });
});
