---
sidebar_position: 5
---

# Troubleshooting

| Symptom | Cause and fix |
|---|---|
| *502 Bad Gateway* when creating a dataset or testing a database on Trino | Trino answered HTTP 406. Egret sends `X-Forwarded-Proto`; set `http-server.process-forwarded=true` on Trino. |
| *429 Too Many Requests* at sign-in | The local sign-in limit is 5 attempts per 5 minutes per address and email; rejected attempts keep the window open. Wait, or restart the server (the limiter is in memory) in a throwaway instance. |
| A workflow execution stays in *Running* | The workflow worker is off by default. Set `EGRET_WORKFLOW__WORKER_ENABLED=true` (and `EGRET_WORKFLOW__SCHEDULER_ENABLED=true` for triggers). |
| *kubernetes unavailable; engine provisioning disabled* in the log | There is no Kubernetes cluster. **Register external engine** still works; **Add engine** does not. |
| Registering a database with a secret fails | `[secrets] master_key` is not set. |
| `/control-plane/config` renders a blank page | Known issue; the page is not linked from the UI. |
