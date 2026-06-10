# plugin-config.json

Runtime configuration for the plugin. JSON cannot contain inline comments.

| Field | Purpose |
|-------|---------|
| `sensitiveRoles` | ClusterRole **names** treated as elevated in the **Cluster admins** tab |
| `sensitiveRoleLabelKey` | Label key on ClusterRoles also marked sensitive |
| `sensitiveRoleLabelValue` | Label value that marks a ClusterRole as sensitive |

Webpack copies this file to `dist/plugin-config.json` at build time. In cluster, Helm can override via ConfigMap mount. Loaded at runtime by `src/components/rbac-overview/pluginConfig.ts`.

