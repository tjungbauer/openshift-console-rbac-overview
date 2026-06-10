/**
 * @file tabAccess.test.ts
 * Unit tests for tab accessible / blocked / loading evaluation.
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { evaluateTabAccess } from '../tabAccess';

describe('evaluateTabAccess', () => {
  it('marks tab accessible when at least one check is allowed', () => {
    const result = evaluateTabAccess([
      { id: 'users', allowed: false, loading: false },
      { id: 'groups', allowed: true, loading: false },
    ]);

    assert.equal(result.accessible, true);
    assert.equal(result.blocked, false);
    assert.deepEqual(result.missing, ['users']);
  });

  it('marks tab blocked when all checks are denied', () => {
    const result = evaluateTabAccess([
      { id: 'users', allowed: false, loading: false },
      { id: 'groups', allowed: false, loading: false },
    ]);

    assert.equal(result.accessible, false);
    assert.equal(result.blocked, true);
  });

  it('stays loading while any check is pending', () => {
    const result = evaluateTabAccess([
      { id: 'users', allowed: false, loading: true },
      { id: 'groups', allowed: true, loading: false },
    ]);

    assert.equal(result.loading, true);
    assert.equal(result.accessible, false);
    assert.equal(result.blocked, false);
  });
});
