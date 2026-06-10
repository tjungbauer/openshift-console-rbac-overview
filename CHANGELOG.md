# Changelog

## Unreleased

## 1.0.5

Initial release.

### Added

- OpenShift Console dynamic plugin under **Administrator → User Management → RBAC Overview**
- **Cluster admins** tab — cluster-wide and namespace-elevated bindings for sensitive ClusterRoles
- **Namespace access** tab — RoleBindings and ClusterRoleBindings for a selected namespace
- **Subjects** tab — browse users, groups, and service accounts with binding details and identity context
- **Who can** tab — `ResourceAccessReview` / `LocalResourceAccessReview` queries; **Can subject** via SubjectAccessReview
- **Show my access** — logged-in user, groups, namespaces, and bindings (SelfSubjectReview)
- **SCC access** tab — direct SCC subject lists and RBAC-derived `use securitycontextconstraints` grants
- Configurable sensitive roles via `plugin-config.json` (names + `rbac-overview.io/elevated` label)
- Expandable **View rules** on role columns; cross-navigation between tabs via URL deep links
- Table sorting, kind/name filters, pagination, and CSV export
- Virtualized subject list for large directories
- Permission-aware tab visibility; partial-access warnings instead of infinite loading on forbidden watches
- Helm chart (`chart/rbac-overview`) — Deployment, Service, ConfigMap, ConsolePlugin, optional console enable hook
- Deploy scripts: `build-install.sh`, `helm-upgrade.sh`, `adopt-helm.sh`, `verify-deployment.sh`
- CI: TypeScript lint, production build, Helm lint and template

### Fixed

- Stale i18n on cluster upgrades: nginx sends `Cache-Control: no-store` for `/locales/` and `plugin-manifest.json`
- `verify-deployment.sh` checks that the running pod serves `tab.roleAccess` in the locale bundle
- `consolePlugin.version` aligned with `package.json` version