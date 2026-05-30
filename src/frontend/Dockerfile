# Stage 1: Build the SPA bundle with Bun
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock tsconfig.base.json ./
COPY src ./src
RUN bun install --frozen-lockfile
RUN bun run --filter @aethon/frontend build

# Stage 2: Serve the built SPA via nginx on Railway's dynamic $PORT
FROM nginx:alpine
COPY --from=build /app/src/frontend/app/dist /usr/share/nginx/html
RUN cat > /etc/nginx/conf.d/default.conf.template <<'EOF'
server {
    listen       ${PORT};
    server_name  localhost;
    root         /usr/share/nginx/html;
    index        index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
