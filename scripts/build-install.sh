#!/usr/bin/env bash
# Full release pipeline: npm build → container image → push → Helm install → verify.
# For upgrades on an existing release use scripts/helm-upgrade.sh.
#
# Prerequisites:
#   oc login …          (cluster access for Helm)
#   podman login quay.io  (if pushing to a private Quay repo)
#
# Usage:
#   ./scripts/build-install.sh
#   VERSION=0.5.1 QUAY_USER=myuser ./scripts/build-install.sh
#   PLATFORM=linux/arm64 ./scripts/build-install.sh   # local arch only if cluster matches
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
SKIP_VERIFY="${SKIP_VERIFY:-false}"

step() {
  echo ""
  echo "==> $*"
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

step "Preflight checks"
command -v npm >/dev/null || die "npm not found"
command -v podman >/dev/null || die "podman not found"
command -v helm >/dev/null || die "helm not found"
command -v oc >/dev/null || die "oc not found"

oc whoami >/dev/null 2>&1 || die "Not logged in to OpenShift. Run: oc login <api-url>"

step "1/5 Webpack build (plugin assets → dist/)"
npm run build

step "2/5 Container image build (${PLATFORM})"
echo "    Image: ${IMAGE}"
test -f dist/plugin-manifest.json || die "dist/ missing — step 1 (npm run build) must succeed before image build"
podman build --platform="${PLATFORM}" -t "${IMAGE}" .

step "3/5 Push image to registry"
podman push "${IMAGE}"

step "4/5 Helm upgrade --install (${RELEASE} in ${NAMESPACE})"
if [[ -n "${CREATE_NAMESPACE:-}" ]]; then
  CREATE_NS="${CREATE_NAMESPACE}"
elif ! oc get namespace "${NAMESPACE}" >/dev/null 2>&1; then
  CREATE_NS=true
  echo "    Namespace ${NAMESPACE} not found — using --create-namespace"
else
  CREATE_NS=false
fi

# Helm --create-namespace and chart templates/namespace.yaml must not both manage the Namespace.
NAMESPACE_CREATE="${NAMESPACE_CREATE:-false}"
if [[ "${CREATE_NS}" == "true" ]]; then
  NAMESPACE_CREATE=false
fi

HELM_ARGS=(
  upgrade --install "${RELEASE}" ./chart/rbac-overview
  --namespace "${NAMESPACE}"
  --set "image.repository=${IMAGE_REPO}"
  --set "image.tag=${VERSION}"
  --set image.pullPolicy=Always
  --set "namespace.create=${NAMESPACE_CREATE}"
  --wait
  --timeout 10m
)
if [[ "${CREATE_NS}" == "true" ]]; then
  HELM_ARGS+=(--create-namespace)
fi
if ! helm "${HELM_ARGS[@]}"; then
  echo ""
  echo "Helm wait failed. Check the new pod (common: nginx IPv6 bind, missing serving cert, image pull):"
  echo "  oc -n ${NAMESPACE} get pods"
  echo "  oc -n ${NAMESPACE} describe pod -l app.kubernetes.io/name=rbac-overview | tail -40"
  echo "  oc -n ${NAMESPACE} logs -l app.kubernetes.io/name=rbac-overview --tail=50"
  echo "  oc -n ${NAMESPACE} get secret rbac-overview-cert"
  exit 1
fi

oc -n "${NAMESPACE}" rollout status "deploy/rbac-overview" --timeout=180s

if [[ "${SKIP_VERIFY}" != "true" && -x "${ROOT}/scripts/verify-deployment.sh" ]]; then
  step "5/5 Verify deployment"
  RELEASE="${RELEASE}" NAMESPACE="${NAMESPACE}" "${ROOT}/scripts/verify-deployment.sh"
else
  step "5/5 Skipped verify (SKIP_VERIFY=${SKIP_VERIFY})"
fi

echo ""
echo "Success."
echo "  Image:   ${IMAGE}"
echo "  Release: ${RELEASE} (namespace ${NAMESPACE})"
echo "  Console: Administrator → User Management → RBAC Overview"
