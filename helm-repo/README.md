# Helm repository

Packaged releases of `chart/rbac-overview` for GitOps and `helm repo add`.

## Publish

From the repository root:

```bash
./scripts/package-helm-repo.sh
```

Serve this directory at `https://tjungbauer.github.io/openshift-console-rbac-overview`.

GitHub Pages is published by `.github/workflows/publish-helm-repo.yml` on push to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** (one-time setup).

## Consume

```bash
helm repo add rbac-overview https://tjungbauer.github.io/openshift-console-rbac-overview
helm repo update
helm upgrade --install rbac-overview rbac-overview/rbac-overview -n rbac-overview --create-namespace
```

GitOps wrappers in `openshift-clusterconfig-gitops` depend on this repository URL.
