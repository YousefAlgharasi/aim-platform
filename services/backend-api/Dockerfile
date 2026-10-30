# Pinned by digest (node 20.20.2, Alpine 3.23.4) so rebuilds get the same base and the same ffmpeg.
ARG NODE_IMAGE=node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder

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
FROM ${NODE_IMAGE}

WORKDIR /app

# ffmpeg converts the TTS provider's WAV to MP3 before it is stored (AudioTranscoderService).
# Exact package version: the build fails instead of silently changing the encoder.
RUN apk add --no-cache ffmpeg=8.0.1-r1 \
  && ffmpeg -hide_banner -encoders | grep -q libmp3lame

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
