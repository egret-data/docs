#!/usr/bin/env bash
# Seeds the Data API objects used by the data-api docs pages and screenshots (scripts/shots/data-api.mjs):
# service accounts "orders-reporting-bot" and "partner-sandbox", the endpoints "Orders by status",
# "Orders page" and "Yearly revenue summary" on the demo database trino-demo, and the sample alerts.
#
# NOT idempotent: names are unique per workspace, so a second run answers 409. The pages were written from objects
# created through these same API calls plus the UI. Usage:
#   SESSION=<egret_session cookie> CSRF=<egret_csrf cookie> ./scripts/seed-data-api.sh
set -euo pipefail
BASE="${BASE:-http://localhost:5180}"
WS="${WS:-default}"
api() { local m=$1 p=$2; shift 2
  curl -fsS -X "$m" -b "egret_session=$SESSION; egret_csrf=$CSRF" -H "X-Egret-CSRF: $CSRF" \
    -H 'content-type: application/json' "$BASE/api/ws/$WS/$p" "$@"; }
field() { python3 -c "import json,sys; print(json.loads(sys.stdin.read(), strict=False)[sys.argv[1]])" "$1"; }

DB=$(api GET databases | python3 -c "import json,sys; print([d['id'] for d in json.load(sys.stdin) if d['name']=='trino-demo'][0])")
SA=$(api POST data-api/service-accounts -d '{"name":"orders-reporting-bot","description":"Nightly orders report for the finance team"}' | field id)
api POST data-api/service-accounts -d '{"name":"partner-sandbox","description":"External partner, read access to nothing yet"}' >/dev/null
api POST "data-api/service-accounts/$SA/clients" -d '{"name":"nightly-orders-etl"}' >/dev/null   # the secret is printed once; not kept

EP=$(api POST data-api/endpoints -d "{\"name\":\"Orders by status\",\"path\":\"orders/by-status\",\"database_id\":\"$DB\",
  \"statements\":[{\"name\":\"main\",\"sql\":\"SELECT orderstatus AS status, count(*) AS orders, round(sum(totalprice), 2) AS revenue FROM tpch.tiny.orders WHERE totalprice >= {{ min_total }} {% if priority %} AND orderpriority = {{ priority }} {% endif %} GROUP BY orderstatus ORDER BY revenue DESC\"}],
  \"params\":[{\"name\":\"priority\",\"type\":\"enum\",\"location\":\"query\",\"allowed\":[\"1-URGENT\",\"2-HIGH\",\"3-MEDIUM\",\"4-NOT SPECIFIED\",\"5-LOW\"]},
              {\"name\":\"min_total\",\"type\":\"number\",\"location\":\"query\",\"default\":\"0\",\"minimum\":\"0\",\"maximum\":\"1000000\"}],
  \"cache\":{\"enabled\":true,\"ttl_seconds\":60},\"limits\":{\"max_rows\":100,\"timeout_seconds\":30},\"rate_limit\":{\"per_key_qps\":5,\"burst\":10}}" | field id)
api POST "data-api/endpoints/$EP/publish" -d '{"note":"First version"}' >/dev/null
api POST "data-api/endpoints/$EP/grants" -d "{\"service_account_id\":\"$SA\"}" >/dev/null

# Sample alert (delivery needs SMTP, so the run log records the reason; see platform/explore/alerts-and-reports/run-history).
api POST alerts -d "{\"type\":\"alert\",\"name\":\"Pending orders above 100\",\"crontab\":\"0 8 * * *\",\"timezone\":\"Asia/Ho_Chi_Minh\",
  \"database_id\":\"$DB\",\"sql\":\"SELECT count(*) FROM tpch.tiny.orders WHERE orderstatus = 'P'\",
  \"validator_type\":\"operator\",\"validator_config\":{\"op\":\">\",\"threshold\":100},\"grace_period_s\":3600,
  \"recipients\":[{\"kind\":\"email\",\"config\":{\"addresses\":[\"ops@example.com\"]}}]}" >/dev/null
echo "seeded; see scripts/shots/data-api.mjs for the other objects"
