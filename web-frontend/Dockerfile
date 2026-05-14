################################################
# Stage 1 — build the static bundle with Vite
################################################
FROM node:20-alpine AS build

WORKDIR /app

# Allow the API base URL to be injected at build time.
# Vite bakes VITE_* env vars into the JS bundle, so this is build-time, not runtime.
ARG VITE_API_BASE_URL=http://localhost:4000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

################################################
# Stage 2 — serve with Nginx
################################################
FROM nginx:alpine

# SPA-friendly nginx config: any unknown path falls back to index.html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
