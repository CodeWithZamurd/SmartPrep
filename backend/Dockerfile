FROM node:20-alpine

WORKDIR /app

# Install deps separately to leverage Docker layer cache
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

# Healthcheck hits /health (already implemented in server.js)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "src/server.js"]
