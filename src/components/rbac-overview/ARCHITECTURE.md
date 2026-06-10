# RBAC Overview plugin — architecture

## File naming

| Kind | Pattern | Example |
|------|---------|---------|
| React component | `PascalCase.tsx` | `ConsoleSingleSelect.tsx`, `CanSubjectReason.tsx` |
| Hook | `useCamelCase.ts` | `useWhoCanTab.ts`, `useRbacUrlState.ts` |
| Module (logic, types, parsers) | `camelCase.ts` | `canSubjectReasonParser.ts`, `urlParams.ts` |
| Single-word module | lowercase | `rbac.ts`, `types.ts`, `filters.ts` |

Parser/util modules pair with components by domain (`canSubjectReasonParser.ts` → `CanSubjectReason.tsx`). Do not use a `.ts` filename that differs only in case from a `.tsx` component (breaks on macOS/Windows).

## Entry points

| File | Role |
|------|------|
| `../RbacOverviewPage.tsx` | Exposed module; loads CSS, renders page view |
| `../RbacOverviewPageView.tsx` | Shell: header, tab bar, permission-aware visibility |
| `useRbacOverviewPageModel.ts` | Active tab from URL, `pushRbacTab()` navigation |
| `tabRegistry.ts` | Maps each `RbacTabKey` to component + label |

## Layering

```
Page view
  └── Tabs (lazy mount via PatternFly mountOnEnter)
        └── *Tab.tsx              — UI + table layout (e.g. SccAccessTab.tsx)
              └── use*Tab.ts      — data watches, derived rows, URL sync (e.g. useSccAccessTab.ts)
```

Shared cross-cutting modules:

| Area | Files |
|------|-------|
| Permissions | `useRbacPermissionChecks.ts`, `useTabPermissions.ts`, `useVisibleTabs.ts`, `tabAccess.ts` |
| URL / deep links | `urlParams.ts`, `rbacLinks.ts`, `useRbacUrlState.ts`, `RbacNavLink.tsx` |
| K8s domain | `rbac.ts`, `whoCan.ts`, `scc.ts`, `sccRbac.ts`, `identity.ts` |
| Tables | `filters.ts`, `tableSort.ts`, `usePagination.ts`, `useRowFilters.ts` |
| Feedback | `StateFeedback.tsx`, `TabContentGate.tsx`, `TabPermissionAlert.tsx`, `TabAccessDenied.tsx`, `watchState.ts` |

## Adding a new tab

1. Add key to `types.ts` → `RBAC_TAB_KEYS`
2. Add checks in `tabAccess.ts` → `tabChecksForKey`
3. Add permission hooks in `useRbacPermissionChecks.ts` if needed
4. Create `useMyAccessTab.ts` + `MyAccessTab.tsx` (or `useSccAccessTab.ts` + `SccAccessTab.tsx` pattern)
5. Register in `tabRegistry.ts`
6. Add locale strings under `locales/en/plugin__rbac-overview.json`
7. Extend `urlParams.ts` if the tab has query state

## Configuration

| Source | Used for |
|--------|----------|
| `config/plugin-config.json` | Default baked into webpack `dist/` (local dev + image) |
| Helm `values.yaml` → `pluginConfig` | Cluster ConfigMap override at deploy time |

## Deploy

Cluster install is **Helm only** (`chart/rbac-overview/`). Webpack runs on the host (or CI) via `npm run build`; the container image is single-stage **Project Hummingbird** `hi/nginx`, copying pre-built `dist/` with `chart/rbac-overview/files/nginx.conf` baked in (TLS :9443, UID 65532). See `scripts/build-install.sh`.

## Tests

Unit tests live in `__tests__/` (Node test runner). Manual console verification: see root `README.md`.
