# ===========================
# 1) BUILD STAGE (React)
# ===========================
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./

RUN if [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

# ===========================
# 2) SERVE STAGE (nginx)
# ===========================
FROM nginx:alpine

# SPA nginx config supporting both /health and /health/ on PORT 3000
RUN rm -f /etc/nginx/conf.d/default.conf && \
printf 'server {\n\
    listen 3000;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri /index.html;\n\
    }\n\
    location ~ ^/health/?$ {\n\
        return 200 "ok";\n\
        add_header Content-Type text/plain;\n\
    }\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]