#!/usr/bin/env bash
# Add demo charts and a dashboard on top of the `orders` dataset created by seed-demo.sh.
# Usage: BASE=http://localhost:5180 scripts/seed-bi.sh
set -euo pipefail
BASE=${BASE:-http://localhost:5180}
WS=${WS:-default}
EMAIL=${EGRET_ADMIN_EMAIL:-admin@egret.local}
PASSWORD=${EGRET_ADMIN_PASSWORD:-Admin12345!}
JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT

curl -fsS -c "$JAR" -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$BASE/api/auth/login" >/dev/null
CSRF=$(awk '$6=="egret_csrf"{print $7}' "$JAR")
call() { curl -fsS -b "$JAR" -H "X-Egret-CSRF: $CSRF" -H 'content-type: application/json' -X "$1" -d "$3" "$BASE$2"; }
id() { python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])'; }

DS=$(curl -fsS -b "$JAR" "$BASE/api/ws/$WS/datasets" | python3 -c '
import json,sys
print(next(d["id"] for d in json.load(sys.stdin) if d["name"]=="orders"))')

spec() { echo "{\"metrics\":$1,\"dimensions\":$2,\"columns\":[],\"filters\":[],\"orderby\":$3,\"row_limit\":1000,\"rollup_groups\":[]$4}"; }

BAR=$(call POST "/api/ws/$WS/charts" "{\"dataset_id\":\"$DS\",\"name\":\"Revenue by order status\",\"viz_type\":\"bar\",\"params\":{\"version\":2,\"settings\":{},\"spec\":$(spec '["revenue"]' '["orderstatus"]' '[]' '')}}" | id)
LINE=$(call POST "/api/ws/$WS/charts" "{\"dataset_id\":\"$DS\",\"name\":\"Revenue by month\",\"viz_type\":\"line\",\"params\":{\"version\":2,\"settings\":{},\"spec\":$(spec '["revenue"]' '["orderdate"]' '[{"field":"orderdate","desc":false}]' ',"temporal_units":{"orderdate":"month"}')}}" | id)
TBL=$(call POST "/api/ws/$WS/charts" "{\"dataset_id\":\"$DS\",\"name\":\"Orders by priority\",\"viz_type\":\"table\",\"params\":{\"version\":2,\"settings\":{},\"spec\":$(spec '["order_count"]' '["orderpriority"]' '[]' '')}}" | id)

DASH=$(call POST "/api/ws/$WS/dashboards" '{"name":"Sales overview","description":"Demo dashboard"}' | id)
call PUT "/api/ws/$WS/dashboards/$DASH" "{\"name\":\"Sales overview\",\"description\":\"Demo dashboard\",\"parameters\":[],\"width\":\"full\",\"tabs\":[],\"cards\":[
 {\"chart_id\":\"$BAR\",\"card_type\":\"chart\",\"grid_col\":0,\"grid_row\":0,\"size_x\":12,\"size_y\":4,\"options\":{}},
 {\"chart_id\":\"$LINE\",\"card_type\":\"chart\",\"grid_col\":12,\"grid_row\":0,\"size_x\":12,\"size_y\":4,\"options\":{}},
 {\"chart_id\":\"$TBL\",\"card_type\":\"chart\",\"grid_col\":0,\"grid_row\":4,\"size_x\":24,\"size_y\":5,\"options\":{}}]}" >/dev/null
echo "charts $BAR $LINE $TBL dashboard $DASH"
