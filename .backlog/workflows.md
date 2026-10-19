| Area | Type | Sev | Description | Evidence (page/URL/steps) |
|---|---|---|---|---|
| workflows | Bug | S1 | SECRET inputs are stored and returned in clear text (execution API, Overview tab). | Run a flow with a SECRET input via API; open Overview: value visible. |
| workflows | Gap | S2 | Flow-level `finally:` and `afterExecution:` are accepted without warning but never run (topology shows "Finally · Not run"). | docs.demo/flaky-import execution. |
| workflows | Gap | S2 | `concurrency`, `checks`, `sla`, `quotas` only warn; two runs of a `limit: 1` flow ran together. | docs.demo/one-at-a-time. |
| workflows | Gap | S2 | `trigger.*` (date, body) unreadable in task expressions; `{{ trigger.date }}` in a scheduled flow fails with "undefined value". | nightly-heartbeat first runs. |
| workflows | Gap | S2 | API/schedule/webhook starts do not validate required inputs, types or SELECT values; only the run form does. | docs.demo/required-inputs executions. |
| workflows | Gap | S2 | Flow `outputs:` are not computed; Subflow `outputs` always `{}`. | call-subflow / add-numbers. |
| workflows | Gap | S3 | YAML input defaults are not parsed into an object in expressions. | docs.demo/input-types-tour. |
| workflows | Bug | S2 | Deleting a flow keeps its namespace/id reserved ("a trashed flow still holds"), with no way to restore or purge. | DELETE a flow then POST same id. |
| workflows | Bug | S3 | Served schema's `DependsOn` lists `condition`/`inputs`, but the engine reads namespace/flowId/states/labels/when. | GET /workflows/schema. |
| workflows | UX | S3 | Unknown top-level keys, unknown task properties, `warningOnRetry` and Pause `onResume` save with no warning. | validate endpoint. |
| workflows | UX | S3 | Schedule `inputs` with `{{ }}` and bad cron only fail at the scheduler (Last error), not on save. | Triggers drawer. |
| workflows | UX | S3 | Flow header shows "Active" for a never-published draft. | Flow page. |
| workflows | Gap | S3 | `errorLogs()`, `render()`, `max()`, `min()`, urlencode/base64 filters missing. | expression-probe flow. |
| workflows | Infra | S3 | The Vite dev server on :5180 went down once during the session (restarted by someone else). | ERR_CONNECTION_REFUSED. |
