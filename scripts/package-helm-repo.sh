#!/usr/bin/env bash
# Package chart/rbac-overview and refresh helm-repo/index.yaml for GitHub Pages.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHART_DIR="${ROOT}/chart/rbac-overview"
REPO_DIR="${ROOT}/helm-repo"
REPO_URL="${HELM_REPO_URL:-https://tjungbauer.github.io/openshift-console-rbac-overview}"

mkdir -p "${REPO_DIR}"
helm package "${CHART_DIR}" -d "${REPO_DIR}"
helm repo index "${REPO_DIR}" --url "${REPO_URL}" --merge "${REPO_DIR}/index.yaml" 2>/dev/null \
  || helm repo index "${REPO_DIR}" --url "${REPO_URL}"

echo "Packaged chart in ${REPO_DIR}. Publish that directory to ${REPO_URL} (GitHub Pages)."
