# rbac-overview Helm chart

Installs the [OpenShift Console RBAC Overview](https://github.com/tjungbauer/openshift-console-rbac-overview) dynamic plugin:

- Namespace, Deployment, Service, ConfigMap (nginx + `plugin-config.json`)
- `ConsolePlugin` CR
- Optional post-install Job to append the plugin to `console.operator` `spec.plugins`

## Install

This chart deploys the plugin **only** — it does not build or push the container image.

From the repository root, use the full pipeline:

```bash
oc login …
podman login quay.io   # if needed
QUAY_USER=<user> ./scripts/build-install.sh
```

Helm-only (after you have pushed an image):

**Fresh install** (namespace does not exist yet):

```bash
helm upgrade --install rbac-overview ./chart/rbac-overview \
  --namespace rbac-overview \
  --create-namespace \
  --set namespace.create=false \
  --set image.repository=quay.io/<user>/openshift-console-rbac-overview \
  --set image.tag=1.0.5 \
  --set image.pullPolicy=Always \
  --wait
```

Do **not** combine `--create-namespace` with `--set namespace.create=true` — Helm 4 fails with
`original object Namespace with the name "rbac-overview" not found`.

Disable automatic console enable (patch manually):

```bash
helm install rbac-overview ./chart/rbac-overview \
  --set enableConsolePlugin.enabled=false
```

## Upgrade

Namespace and release must already exist:

```bash
helm upgrade --install rbac-overview ./chart/rbac-overview \
  --namespace rbac-overview \
  --set namespace.create=false \
  --set image.repository=quay.io/<user>/openshift-console-rbac-overview \
  --set image.tag=1.0.5 \
  --set image.pullPolicy=Always \
  --wait
```

## Uninstall

```bash
helm uninstall rbac-overview --namespace rbac-overview
```

Remove the plugin from the console operator if needed (replace `<index>` with the array index of `rbac-overview`):

```bash
oc patch console.operator cluster --type=json \
  -p='[{"op":"remove","path":"/spec/plugins/<index>"}]'
```

## Files

- `files/nginx.conf` — shared with the container image (`Dockerfile` copies this path); tuned for non-root Hummingbird nginx (UID 65532, TLS on 9443)
- `values.yaml` → `pluginConfig` — overrides built-in `plugin-config.json` at runtime

## Values

| Key | Default | Description |
|-----|---------|-------------|
| `namespace.create` | `true` | Create the workload namespace |
| `namespace.name` | `rbac-overview` | Namespace for plugin resources |
| `image.repository` | `quay.io/tjungbau/openshift-console-rbac-overview` | Plugin image |
| `image.tag` | chart `appVersion` | Image tag |
| `pluginConfig.sensitiveRoles` | `cluster-admin`, `admin` | Sensitive roles for Cluster admins tab |
| `enableConsolePlugin.enabled` | `true` | Run hook Job to enable plugin on console |

See `values.yaml` for probes, resources, and security context.
