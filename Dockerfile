# ---- Build stage ----
FROM node:18-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

# copy source
COPY . .

# pass API base url at build time (optional)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# build production bundle
RUN npm run build

# ---- Serve stage ----
FROM nginx:alpine
# clean default and add SPA config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy compiled app
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
