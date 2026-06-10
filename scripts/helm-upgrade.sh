#!/usr/bin/env bash
# Upgrade an EXISTING Helm release (image tag / chart values).
# Requires namespace + helm release from a prior install. Does not create the namespace.
#
# Usage:
#   VERSION=0.5.4 ./scripts/helm-upgrade.sh
#   VERSION=0.5.4 SKIP_BUILD=true ./scripts/helm-upgrade.sh   # helm only, image already pushed
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

VERSION="${VERSION:-$(node -p "require('./package.json').version")}"
QUAY_USER="${QUAY_USER:-tjungbau}"
IMAGE_REPO="${IMAGE_REPO:-quay.io/${QUAY_USER}/openshift-console-rbac-overview}"
IMAGE="${IMAGE:-${IMAGE_REPO}:${VERSION}}"
RELEASE="${RELEASE:-rbac-overview}"
NAMESPACE="${NAMESPACE:-rbac-overview}"
PLATFORM="${PLATFORM:-linux/amd64}"
SKIP_BUILD="${SKIP_BUILD:-false}"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

step() {
  echo ""
  echo "==> $*"
}

command -v helm >/dev/null || die "helm not found"
command -v oc >/dev/null || die "oc not found"
oc whoami >/dev/null 2>&1 || die "Not logged in. Run: oc login <api-url>"

if ! oc get namespace "${NAMESPACE}" >/dev/null 2>&1; then
  die "$(cat <<EOF
Namespace '${NAMESPACE}' does not exist — there is nothing to upgrade.

Run a baseline install first (one time):
  VERSION=${VERSION} ./scripts/build-install.sh

Or Helm only (image already pushed):
  helm upgrade --install ${RELEASE} ./chart/rbac-overview \\
    --namespace ${NAMESPACE} \\
    --create-namespace \\
    --set namespace.create=false \\
    --set image.repository=${IMAGE_REPO} \\
    --set image.tag=${VERSION} \\
    --set image.pullPolicy=Always \\
    --wait
EOF
)"
fi

if ! helm list -n "${NAMESPACE}" -q 2>/dev/null | grep -Fxq "${RELEASE}"; then
  die "$(cat <<EOF
Helm release '${RELEASE}' not found in namespace '${NAMESPACE}'.

Run a baseline install first (one time):
  VERSION=${VERSION} ./scripts/build-install.sh
EOF
)"
fi

if [[ "${SKIP_BUILD}" != "true" ]]; then
  command -v npm >/dev/null || die "npm not found"
  command -v podman >/dev/null || die "podman not found"

  step "1/3 Build plugin + image (${VERSION})"
  npm run build
  test -f dist/plugin-manifest.json || die "dist/ missing after npm run build"
  podman build --platform="${PLATFORM}" -t "${IMAGE}" .
  podman push "${IMAGE}"
else
  step "1/3 Skipped build/push (SKIP_BUILD=true)"
fi

step "2/3 Helm upgrade (${RELEASE} → image ${VERSION})"
helm upgrade --install "${RELEASE}" ./chart/rbac-overview \
  --namespace "${NAMESPACE}" \
  --set namespace.create=false \
  --set "image.repository=${IMAGE_REPO}" \
  --set "image.tag=${VERSION}" \
  --set image.pullPolicy=Always \
  --wait \
  --timeout 10m

step "3/3 Rollout + verify"
oc -n "${NAMESPACE}" rollout status "deploy/rbac-overview" --timeout=180s
if [[ -x "${ROOT}/scripts/verify-deployment.sh" ]]; then
  RELEASE="${RELEASE}" NAMESPACE="${NAMESPACE}" "${ROOT}/scripts/verify-deployment.sh"
fi

echo ""
echo "Upgrade complete."
echo "  Release: ${RELEASE}"
echo "  Image:   ${IMAGE}"
oc -n "${NAMESPACE}" get deploy rbac-overview -o jsonpath='  Deployed: {.spec.template.spec.containers[0].image}{"\n"}'
