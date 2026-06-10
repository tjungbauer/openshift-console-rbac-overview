/**
 * @file scc.test.ts
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { extractSccOverviewRows } from '../scc';

describe('extractSccOverviewRows', () => {
  it('maps SCC fields and counts direct subjects', () => {
    const rows = extractSccOverviewRows([
      {
        metadata: { name: 'restricted' },
        priority: 0,
        allowPrivilegedContainer: false,
        allowHostNetwork: false,
        runAsUser: { type: 'MustRunAsRange' },
        seLinuxContext: { type: 'MustRunAs' },
        volumes: ['configMap', 'secret'],
        users: ['alice'],
        groups: ['system:authenticated'],
        serviceAccounts: ['default:builder'],
      },
    ]);

    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, 'restricted');
    assert.equal(rows[0].priority, 0);
    assert.equal(rows[0].allowPrivilegedContainer, false);
    assert.equal(rows[0].runAsUserType, 'MustRunAsRange');
    assert.equal(rows[0].volumes, 'configMap, secret');
    assert.equal(rows[0].directSubjectCount, 3);
  });
});
