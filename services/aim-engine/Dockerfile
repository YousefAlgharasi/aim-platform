# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools
RUN pip install --no-cache-dir build wheel

# Install dependencies into isolated prefix
COPY services/aim-engine/pyproject.toml ./
RUN pip install --no-cache-dir --prefix=/install .

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Non-root user
RUN addgroup --system aim && adduser --system --ingroup aim aim

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY --chown=aim:aim services/aim-engine/app ./app
COPY --chown=aim:aim services/api/src/aim ./api/src/aim

ENV PYTHONPATH=/app/api/src

USER aim

EXPOSE 8010

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8010/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8010"]
