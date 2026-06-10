/**
 * @file resolvePermissionNamespace.test.ts
 * Unit tests for namespace pick logic for permission checks.
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolvePermissionNamespace } from '../resolvePermissionNamespace';

describe('resolvePermissionNamespace', () => {
  it('prefers the console active namespace', () => {
    assert.equal(resolvePermissionNamespace('my-project', ['other']), 'my-project');
  });

  it('uses the first accessible project when active namespace is all projects', () => {
    assert.equal(resolvePermissionNamespace('#ALL_NS#', ['alpha', 'beta']), 'alpha');
  });

  it('falls back to default only when no namespace context exists', () => {
    assert.equal(resolvePermissionNamespace(undefined, []), 'default');
  });
});
