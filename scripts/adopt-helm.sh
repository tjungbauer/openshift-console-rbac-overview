#!/usr/bin/env bash
# Add Helm ownership metadata to resources previously installed via kubectl apply.
# Run once before the first `helm upgrade --install` on an existing install.
set -euo pipefail

RELEASE="${RELEASE:-rbac-overview}"
NAMESPACE="${NAMESPACE:-rbac-overview}"
PLUGIN="${PLUGIN:-rbac-overview}"

adopt_namespaced() {
  local kind="$1"
  local name="$2"

  if ! oc get "${kind}" "${name}" -n "${NAMESPACE}" >/dev/null 2>&1; then
    echo "skip ${kind}/${name} (not found)"
    return 0
  fi

  oc label "${kind}" "${name}" -n "${NAMESPACE}" \
    app.kubernetes.io/managed-by=Helm --overwrite
  oc annotate "${kind}" "${name}" -n "${NAMESPACE}" \
    meta.helm.sh/release-name="${RELEASE}" \
    meta.helm.sh/release-namespace="${NAMESPACE}" \
    --overwrite
  echo "adopted ${kind}/${name}"
}

adopt_cluster() {
  local kind="$1"
  local name="$2"

  if ! oc get "${kind}" "${name}" >/dev/null 2>&1; then
    echo "skip ${kind}/${name} (not found)"
    return 0
  fi

  oc label "${kind}" "${name}" \
    app.kubernetes.io/managed-by=Helm --overwrite
  oc annotate "${kind}" "${name}" \
    meta.helm.sh/release-name="${RELEASE}" \
    meta.helm.sh/release-namespace="${NAMESPACE}" \
    --overwrite
  echo "adopted ${kind}/${name}"
}

echo "Adopting existing resources for Helm release ${RELEASE}..."

adopt_cluster namespace "${NAMESPACE}"
adopt_namespaced configmap "${PLUGIN}"
adopt_namespaced service "${PLUGIN}"
adopt_namespaced deployment "${PLUGIN}"
adopt_cluster consoleplugin "${PLUGIN}"

echo "Done. Run helm upgrade --install with --set namespace.create=false"
