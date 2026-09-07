#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/opt/apps/limitra-waitlist}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.production.yml}"

cd "$APP_DIR"

docker compose -f "$COMPOSE_FILE" --profile tools pull
docker compose -f "$COMPOSE_FILE" --profile tools run --rm --no-deps migrate
docker compose -f "$COMPOSE_FILE" up -d --no-build --remove-orphans
docker compose -f "$COMPOSE_FILE" ps
