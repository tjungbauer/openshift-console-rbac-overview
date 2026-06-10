/**
 * @file pluginConfig.test.ts
 */
import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_PLUGIN_CONFIG, parsePluginConfig, roleRefKey } from '../pluginConfig';

describe('parsePluginConfig', () => {
  it('returns defaults for invalid input', () => {
    assert.deepEqual(parsePluginConfig(null), DEFAULT_PLUGIN_CONFIG);
    assert.deepEqual(parsePluginConfig('bad'), DEFAULT_PLUGIN_CONFIG);
  });

  it('filters non-string sensitive role names', () => {
    const config = parsePluginConfig({
      sensitiveRoles: ['admin', 42, 'custom'],
      sensitiveRoleLabelKey: 'custom.io/key',
      sensitiveRoleLabelValue: 'yes',
    });
    assert.deepEqual(config.sensitiveRoles, ['admin', 'custom']);
    assert.equal(config.sensitiveRoleLabelKey, 'custom.io/key');
    assert.equal(config.sensitiveRoleLabelValue, 'yes');
  });

  it('filters hidden SCC names and falls back to defaults', () => {
    const config = parsePluginConfig({
      hiddenSccNames: ['privileged', 1, 'custom'],
    });
    assert.deepEqual(config.hiddenSccNames, ['privileged', 'custom']);

    assert.deepEqual(parsePluginConfig({}).hiddenSccNames, DEFAULT_PLUGIN_CONFIG.hiddenSccNames);
  });
});

describe('roleRefKey', () => {
  it('includes namespace for namespaced roles', () => {
    assert.equal(roleRefKey('Role', 'edit', 'default'), 'Role/default/edit');
    assert.equal(roleRefKey('ClusterRole', 'admin'), 'ClusterRole/admin');
  });
});
