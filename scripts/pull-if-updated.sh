#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"

git fetch origin "$BRANCH" --quiet

LOCAL="$(git rev-parse "$BRANCH")"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "Up to date with origin/$BRANCH."
else
  echo "New commits on origin/$BRANCH — pulling..."
  git pull origin "$BRANCH"
fi
