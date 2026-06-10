/**
 * @file roleRules.test.ts
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatRuleList, normalizePolicyRules } from '../roleRules';

describe('role-rules', () => {
  it('formatRuleList returns asterisk for empty values', () => {
    assert.equal(formatRuleList([]), '*');
    assert.equal(formatRuleList(undefined), '*');
  });

  it('formatRuleList joins values', () => {
    assert.equal(formatRuleList(['get', 'list']), 'get, list');
  });

  it('normalizePolicyRules drops empty rules', () => {
    const rules = normalizePolicyRules([
      { verbs: ['get'], resources: ['pods'] },
      { verbs: [], resources: [] },
      { nonResourceURLs: ['/healthz'] },
    ]);
    assert.equal(rules.length, 2);
  });
});
