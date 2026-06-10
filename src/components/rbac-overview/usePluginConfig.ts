/**
 * @file usePluginConfig.ts
 * React hook wrapping async loadPluginConfig().
 */
import { useEffect, useState } from 'react';

import { DEFAULT_PLUGIN_CONFIG, loadPluginConfig, type PluginConfig } from './pluginConfig';

export function usePluginConfig() {
  const [config, setConfig] = useState<PluginConfig>(DEFAULT_PLUGIN_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPluginConfig().then((next) => {
      if (!cancelled) {
        setConfig(next);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loaded };
}
