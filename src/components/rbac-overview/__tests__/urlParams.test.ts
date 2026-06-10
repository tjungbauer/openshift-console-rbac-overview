/**
 * @file urlParams.test.ts
 * Unit tests for URL param parse/build/merge round-trips.
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildRbacSearchParams,
  mergeRbacSearchParams,
  parseRbacSearchParams,
  tabKeyFromSearch,
} from '../urlParams';

describe('url-params', () => {
  it('parses who-can query parameters', () => {
    const params = parseRbacSearchParams(
      '?tab=who-can&whoCanMode=can-subject&verb=get&resource=pods&namespace=default&subjectKind=User&subjectName=alice&run=1',
    );
    assert.equal(params.tab, 'who-can');
    assert.equal(params.whoCanMode, 'can-subject');
    assert.equal(params.verb, 'get');
    assert.equal(params.resource, 'pods');
    assert.equal(params.namespace, 'default');
    assert.equal(params.subjectName, 'alice');
    assert.equal(params.run, '1');
  });

  it('builds and merges search params', () => {
    const built = buildRbacSearchParams({
      tab: 'namespace-access',
      namespace: 'kube-system',
      section: 'cluster-wide',
    });
    assert.match(built, /namespace=kube-system/);
    const merged = mergeRbacSearchParams(built, { tab: 'who-can', namespace: undefined });
    assert.doesNotMatch(merged, /tab=/);
    assert.doesNotMatch(merged, /namespace=/);
  });

  it('serializes cluster-admins tab explicitly', () => {
    const built = buildRbacSearchParams({ tab: 'cluster-admins' });
    assert.match(built, /tab=cluster-admins/);
    const parsed = parseRbacSearchParams(built);
    assert.equal(parsed.tab, 'cluster-admins');
  });

  it('ignores invalid tab values', () => {
    const params = parseRbacSearchParams('?tab=not-a-tab');
    assert.equal(params.tab, undefined);
  });

  it('resolves active tab from search', () => {
    assert.equal(tabKeyFromSearch('?tab=subjects'), 'subjects');
    assert.equal(tabKeyFromSearch(''), 'who-can');
  });

  it('parses role-access deep link', () => {
    const params = parseRbacSearchParams('?tab=role-access&roleName=cluster-admin');
    assert.equal(params.tab, 'role-access');
    assert.equal(params.roleName, 'cluster-admin');
    const built = buildRbacSearchParams({ tab: 'role-access', roleName: 'view' });
    assert.match(built, /tab=role-access/);
    assert.match(built, /roleName=view/);
  });
});
