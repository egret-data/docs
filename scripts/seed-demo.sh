#!/usr/bin/env bash
# Seed a running Egret platform with the demo data used by the docs screenshots.
# Usage: BASE=http://localhost:5180 TRINO_HOST=localhost TRINO_PORT=8091 scripts/seed-demo.sh
# Idempotent enough for a fresh instance; re-running creates duplicates, so reset the DB first.
set -euo pipefail
BASE=${BASE:-http://localhost:5180}
WS=${WS:-default}
TRINO_HOST=${TRINO_HOST:-localhost}
TRINO_PORT=${TRINO_PORT:-8091}
EMAIL=${EGRET_ADMIN_EMAIL:-admin@egret.local}
PASSWORD=${EGRET_ADMIN_PASSWORD:-Admin12345!}
JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT

curl -fsS -c "$JAR" -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$BASE/api/auth/login" >/dev/null
CSRF=$(awk '$6=="egret_csrf"{print $7}' "$JAR")

post() { curl -fsS -b "$JAR" -H "X-Egret-CSRF: $CSRF" -H 'content-type: application/json' -d "$2" "$BASE$1"; }

DB=$(post "/api/ws/$WS/databases" "{\"name\":\"trino-demo\",\"engine\":\"trino\",\"host\":\"$TRINO_HOST\",\"port\":$TRINO_PORT,\"options\":{\"user\":\"egret\",\"http_scheme\":\"http\",\"catalog\":\"tpch\"}}" | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
echo "database $DB"

DS=$(post "/api/ws/$WS/datasets" "{\"name\":\"orders\",\"database_id\":\"$DB\",\"description\":\"TPC-H sample orders\",\"source\":{\"kind\":\"physical\",\"catalog\":\"tpch\",\"schema\":\"tiny\",\"table\":\"orders\"}}" | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
echo "dataset $DS"

post "/api/ws/$WS/datasets/$DS/metrics" '{"metric_name":"revenue","verbose_name":"Revenue","expression":"sum(totalprice)"}' >/dev/null
post "/api/ws/$WS/datasets/$DS/metrics" '{"metric_name":"order_count","verbose_name":"Orders","expression":"count(*)"}' >/dev/null
echo "metrics ok"
