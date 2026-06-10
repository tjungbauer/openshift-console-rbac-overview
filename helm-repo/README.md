# Helm repository

Packaged releases of `chart/rbac-overview` for GitOps and `helm repo add`.

## Publish

From the repository root:

```bash
./scripts/package-helm-repo.sh
```

Serve this directory at `https://tjungbauer.github.io/openshift-console-rbac-overview` (GitHub Pages from `/helm-repo` or a `gh-pages` branch).

## Consume

```bash
helm repo add rbac-overview https://tjungbauer.github.io/openshift-console-rbac-overview
helm repo update
helm upgrade --install rbac-overview rbac-overview/rbac-overview -n rbac-overview --create-namespace
```

GitOps wrappers in `openshift-clusterconfig-gitops` depend on this repository URL.
