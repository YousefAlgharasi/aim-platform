# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (cache layer)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY nest-cli.json tsconfig*.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm run build

# Prune dev deps
RUN npm prune --production

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Non-root user
RUN addgroup -S aim && adduser -S aim -G aim

COPY --from=builder --chown=aim:aim /app/dist ./dist
COPY --from=builder --chown=aim:aim /app/node_modules ./node_modules
COPY --from=builder --chown=aim:aim /app/prisma ./prisma
COPY --chown=aim:aim package.json ./

USER aim

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
