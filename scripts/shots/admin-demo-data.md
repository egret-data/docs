# Demo data assumed by admin.mjs


- Engine `docs-trino` declares `demo_catalog` and `tpch_bench`, bound to profile `docs-trino-policy` (a `trino` profile whose `config.tagService` names the `tag` profile `docs-trino-tags`; both created through `POST /api/control-plane/policies/services`).
- On `demo_catalog.analytics.sessions`: a grant for user `member-sso`, a row filter, a mask by path, a mask by tag, tag `Personal data (PII)` on `user_id`, clearance `data_steward` on the tag, an engine permission (system session property `query_max_run_time` for `member-sso`).
- Workspaces `Docs sandbox` (members, connection `trino-sandbox`, dashboard `Finance KPIs` with two shares) and `Finance analytics` (access request from `member-sso`, approved at the end), archived workspace `Legacy reporting`.
- Role `finance_reporter` (inherits `ws_viewer`, plus `chart:manage`, `dashboard:manage`); catalog `tpch_bench`; secret `docs-warehouse-password`; storage connection `sandbox-lake`.
- `scripts/capture-member-request-dialog.mjs` captures the request dialog as `member-sso` (needs a saved SSO state).

