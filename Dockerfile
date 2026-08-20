# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.eslint.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Create a non-root user to run the gateway.
RUN addgroup -S fuxa && adduser -S fuxa -G fuxa

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

USER fuxa

# The gateway is an MCP stdio server; keep stdin/stdout open for the client.
CMD ["node", "dist/index.js"]
