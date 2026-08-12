# No build step — the site in ./site is already the deployable artifact.
FROM nginx:1.27-alpine

# nginxinc/nginx-unprivileged would also work; this image runs the workers as
# nginx already, and binding 8080 avoids needing NET_BIND_SERVICE.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/      /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1
