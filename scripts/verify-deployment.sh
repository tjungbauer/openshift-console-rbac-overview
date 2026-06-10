#!/usr/bin/env bash
# Verify Helm-installed RBAC Overview plugin resources (release, rollout, ConsolePlugin, manifest URL).
set -euo pipefail

NAMESPACE="${NAMESPACE:-rbac-overview}"
RELEASE="${RELEASE:-rbac-overview}"
PLUGIN="${PLUGIN:-rbac-overview}"

failures=0

check() {
  local description="$1"
  shift
  if "$@"; then
    echo "OK   ${description}"
  else
    echo "FAIL ${description}"
    failures=$((failures + 1))
  fi
}

echo "Verifying RBAC Overview in namespace ${NAMESPACE}..."

check "Helm release ${RELEASE} is deployed" \
  helm status "${RELEASE}" -n "${NAMESPACE}" >/dev/null 2>&1

check "Deployment rollout complete" \
  oc -n "${NAMESPACE}" rollout status "deploy/${PLUGIN}" --timeout=120s

check "Pod is Running" \
  oc -n "${NAMESPACE}" get pods -l "app=${PLUGIN}" -o jsonpath='{.items[0].status.phase}' | grep -q Running

check "Service exists" \
  oc -n "${NAMESPACE}" get svc "${PLUGIN}" >/dev/null 2>&1

check "ConsolePlugin CR exists" \
  oc get consoleplugin "${PLUGIN}" >/dev/null 2>&1

# Hummingbird hi/nginx is distroless — no shell/curl inside the plugin pod for oc exec.
# Readiness probe already hits https://:9443/plugin-manifest.json; confirm container ready.
check "HTTPS readiness probe passing (plugin-manifest.json)" \
  oc -n "${NAMESPACE}" get pods -l "app=${PLUGIN}" \
    -o jsonpath='{.items[0].status.containerStatuses[0].ready}' | grep -qi true

if oc get console.operator cluster -o jsonpath='{.spec.plugins}' 2>/dev/null | grep -q "\"${PLUGIN}\""; then
  echo "OK   Plugin enabled on console.operator cluster"
else
  echo "FAIL Plugin not in console.operator spec.plugins"
  failures=$((failures + 1))
fi

IMAGE=$(oc -n "${NAMESPACE}" get deploy "${PLUGIN}" -o jsonpath='{.spec.template.spec.containers[0].image}')
echo "INFO Deployment image: ${IMAGE}"

# Locale JSON is not content-hashed; confirm the running pod serves current strings.
LOCALE_URL="https://${PLUGIN}.${NAMESPACE}.svc:9443/locales/en/plugin__rbac-overview.json"
LOCALE_JSON=$(
  oc run "rbac-overview-locale-check-$$" \
    --rm -i --restart=Never \
    -n "${NAMESPACE}" \
    --image=curlimages/curl:8.5.0 \
    --command -- \
    curl -sk --max-time 20 "${LOCALE_URL}" 2>/dev/null || true
)
if echo "${LOCALE_JSON}" | grep -q '"tab.roleAccess"[[:space:]]*:[[:space:]]*"Role access"'; then
  echo "OK   Locale bundle includes tab.roleAccess"
else
  echo "FAIL Locale bundle missing tab.roleAccess (stale image or cached locales)"
  echo "      Check: oc port-forward -n ${NAMESPACE} svc/${PLUGIN} 9443:9443"
  echo "            curl -sk https://127.0.0.1:9443/locales/en/plugin__rbac-overview.json | grep roleAccess"
  failures=$((failures + 1))
fi

if [[ "${failures}" -eq 0 ]]; then
  echo "All checks passed."
  exit 0
fi

echo "${failures} check(s) failed."
exit 1
