#!/usr/bin/env bash
# Run a local OpenShift console container that loads this plugin from webpack dev server (:9001).

set -euo pipefail

CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
CONSOLE_IMAGE_PLATFORM=${CONSOLE_IMAGE_PLATFORM:="linux/amd64"}

PLUGIN_NAME=${npm_package_consolePlugin_name:-"rbac-overview"}

echo "Starting local OpenShift console..."

BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
set +e
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null)
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null)
set +e
BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
set -e

if [ -z "$BRIDGE_K8S_AUTH_BEARER_TOKEN" ]; then
  echo ""
  echo "ERROR: No OAuth bearer token is available for this oc session."
  echo ""
  echo "Your kubeconfig uses client certificate auth (common with cluster install kubeconfigs)."
  echo "The local console container requires a bearer token to talk to the API."
  echo ""
  echo "Fix: log in again so oc stores a token, for example:"
  echo "  oc login ${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT} -u <user> -p <password>"
  echo ""
  echo "Or with an existing token:"
  echo "  oc login --token=<token> --server=${BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT}"
  echo ""
  echo "Then verify:"
  echo "  oc whoami --show-token"
  echo ""
  exit 1
fi

BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_I18N_NAMESPACES="plugin__${PLUGIN_NAME}"

set +e
GITOPS_HOSTNAME=$(oc -n openshift-gitops get route cluster -o jsonpath='{.spec.host}' 2>/dev/null)
set -e
if [ -n "$GITOPS_HOSTNAME" ]; then
  BRIDGE_K8S_MODE_OFF_CLUSTER_GITOPS="https://$GITOPS_HOSTNAME"
fi

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"
echo "Plugin dev server: http://localhost:9001"

# BRIDGE_PLUGINS tells the console where to fetch the dynamic plugin manifest (webpack dev server).
if [ -x "$(command -v podman)" ]; then
  if [ "$(uname -s)" = "Linux" ]; then
    BRIDGE_PLUGINS="${PLUGIN_NAME}=http://localhost:9001"
    podman run --pull always --platform "$CONSOLE_IMAGE_PLATFORM" --rm --network=host --env-file <(set | grep BRIDGE) "$CONSOLE_IMAGE"
  else
    BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.containers.internal:9001"
    podman run --pull always --platform "$CONSOLE_IMAGE_PLATFORM" --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) "$CONSOLE_IMAGE"
  fi
else
  BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.docker.internal:9001"
  docker run --pull always --platform "$CONSOLE_IMAGE_PLATFORM" --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) "$CONSOLE_IMAGE"
fi
