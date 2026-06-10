/**
 * @file pluginConfig.ts
 * Fetch and parse /plugin-config.json; defaults for sensitive roles.
 */
export type PluginConfig = {
  sensitiveRoles: string[];
  sensitiveRoleLabelKey: string;
  sensitiveRoleLabelValue: string;
  hiddenSccNames: string[];
};

export const DEFAULT_PLUGIN_CONFIG: PluginConfig = {
  sensitiveRoles: ['cluster-admin', 'admin'],
  sensitiveRoleLabelKey: 'rbac-overview.io/elevated',
  sensitiveRoleLabelValue: 'true',
  hiddenSccNames: ['anyuid', 'privileged', 'hostaccess', 'hostmount-anyuid', 'hostnetwork', 'node-exporter'],
};

let cachedConfig: PluginConfig | null = null;
let configPromise: Promise<PluginConfig> | null = null;

export const parsePluginConfig = (raw: unknown): PluginConfig => {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PLUGIN_CONFIG;
  }
  const data = raw as Partial<PluginConfig>;
  return {
    sensitiveRoles: Array.isArray(data.sensitiveRoles)
      ? data.sensitiveRoles.filter((role): role is string => typeof role === 'string')
      : DEFAULT_PLUGIN_CONFIG.sensitiveRoles,
    sensitiveRoleLabelKey:
      typeof data.sensitiveRoleLabelKey === 'string'
        ? data.sensitiveRoleLabelKey
        : DEFAULT_PLUGIN_CONFIG.sensitiveRoleLabelKey,
    sensitiveRoleLabelValue:
      typeof data.sensitiveRoleLabelValue === 'string'
        ? data.sensitiveRoleLabelValue
        : DEFAULT_PLUGIN_CONFIG.sensitiveRoleLabelValue,
    hiddenSccNames: Array.isArray(data.hiddenSccNames)
      ? data.hiddenSccNames.filter((name): name is string => typeof name === 'string')
      : DEFAULT_PLUGIN_CONFIG.hiddenSccNames,
  };
};

export const loadPluginConfig = async (): Promise<PluginConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }
  if (!configPromise) {
    configPromise = fetch('./plugin-config.json')
      .then((response) => (response.ok ? response.json() : DEFAULT_PLUGIN_CONFIG))
      .then(parsePluginConfig)
      .catch(() => DEFAULT_PLUGIN_CONFIG)
      .then((config) => {
        cachedConfig = config;
        return config;
      });
  }
  return configPromise;
};

export const roleRefKey = (
  roleKind: string,
  roleName: string,
  namespace?: string,
): string =>
  roleKind === 'Role' && namespace
    ? `Role/${namespace}/${roleName}`
    : `${roleKind}/${roleName}`;
