# RBAC Overview console plugin — Project Hummingbird runtime (hi/nginx).
# dist/ must exist before build: npm run build (scripts/build-install.sh does this first).
# In-container npm is intentionally omitted to avoid duplicating node_modules and filling disk.
# hi/nginx is distroless — no shell; use COPY --chown instead of RUN.

FROM registry.access.redhat.com/hi/nginx:latest

COPY --chown=65532:65532 chart/rbac-overview/files/nginx.conf /etc/nginx/nginx.conf
COPY --chown=65532:65532 dist /usr/share/nginx/html

USER 65532

ENTRYPOINT ["/usr/sbin/nginx"]
CMD ["-c", "/etc/nginx/nginx.conf", "-e", "/dev/stderr", "-g", "daemon off;"]
