# ===========================
# 1) BUILD STAGE (React)
# ===========================
FROM node:18-alpine AS build

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* yarn.lock* ./

# Installer les dépendances (npm OU yarn, selon ce que tu as)
RUN if [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copier tout le code du frontend
COPY . .

# Récupérer la variable passée par Coolify (REACT_APP_API_URL)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Construire l'application React
RUN npm run build

# ===========================
# 2) SERVE STAGE (nginx)
# ===========================
FROM nginx:alpine

# ⚠️ Coolify va injecter ici les ARG (SOURCE_COMMIT, etc.) automatiquement,
# donc on ne touche pas à cette partie.

# SPA nginx config (no external file needed)
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
  location /health { return 200 "ok"; add_header Content-Type text/plain; }\n\
  gzip on;\n\
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;\n\
}\n' > /etc/nginx/conf.d/default.conf

# ➜ On copie le build React du stage précédent
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
