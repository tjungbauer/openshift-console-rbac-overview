{{- define "rbac-overview.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "rbac-overview.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "rbac-overview.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "rbac-overview.labels" -}}
helm.sh/chart: {{ include "rbac-overview.chart" . }}
{{ include "rbac-overview.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: rbac-overview
{{- end }}

{{- define "rbac-overview.selectorLabels" -}}
app.kubernetes.io/name: {{ include "rbac-overview.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: rbac-overview
{{- end }}

{{- define "rbac-overview.namespace" -}}
{{- .Values.namespace.name }}
{{- end }}

{{- define "rbac-overview.image" -}}
{{- $tag := default .Chart.AppVersion .Values.image.tag }}
{{- printf "%s:%s" .Values.image.repository $tag }}
{{- end }}

{{- define "rbac-overview.pluginConfig" -}}
{{- dict "sensitiveRoles" .Values.pluginConfig.sensitiveRoles "sensitiveRoleLabelKey" .Values.pluginConfig.sensitiveRoleLabelKey "sensitiveRoleLabelValue" .Values.pluginConfig.sensitiveRoleLabelValue "hiddenSccNames" .Values.pluginConfig.hiddenSccNames | toPrettyJson }}
{{- end }}
