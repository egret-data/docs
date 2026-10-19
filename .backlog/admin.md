# Backlog: admin area (Governance, Control plane, Workspace settings)

Findings recorded while writing the detailed pages. Recorded, not fixed.

## Demo data created for the screenshots

Shots in `scripts/shots/admin.mjs` assume these objects exist on the demo instance:

- Engine `docs-trino` declares `demo_catalog` and `tpch_bench`, bound to profile `docs-trino-policy` (a `trino` profile whose `config.tagService` names the `tag` profile `docs-trino-tags`; both created through `POST /api/control-plane/policies/services`).
- On `demo_catalog.analytics.sessions`: a grant for user `member-sso`, a row filter, a mask by path, a mask by tag, tag `Personal data (PII)` on `user_id`, clearance `data_steward` on the tag, an engine permission (system session property `query_max_run_time` for `member-sso`).
- Workspaces `Docs sandbox` (members, connection `trino-sandbox`, dashboard `Finance KPIs` with two shares) and `Finance analytics` (access request from `member-sso`, approved at the end), archived workspace `Legacy reporting`.
- Role `finance_reporter` (inherits `ws_viewer`, plus `chart:manage`, `dashboard:manage`); catalog `tpch_bench`; secret `docs-warehouse-password`; storage connection `sandbox-lake`.
- `scripts/capture-member-request-dialog.mjs` captures the request dialog as `member-sso` (needs a saved SSO state).

## Findings

| Area | Type | Sev | Description | Evidence |
|---|---|---|---|---|
| Governance / Engines | Gap | S2 | A policy profile created with **New profile** (Trino) can never be bound to an engine: binding fails with "has no usable tag service". The console cannot set `tagService`, so an external Trino engine can only be bound by creating the `tag` + `trino` profile pair through the API. | Engine & policy → New profile → docs-trino-profile; Control Plane → Engines → docs-trino → Settings → Policy profile → Save changes (400) |
| Workspace settings / Notifications | Bug | S2 | Saving SMTP settings returns HTTP 500 "internal error" on this instance (the Notifications form shows "internal error"), so the saved state, "Send test message" and the Slack save could not be verified. | `PUT /api/ws/docs-sandbox/notifications/smtp` with host smtp.example.com, port 587, from alerts@example.com |
| Workspace settings / Roles | UX | S3 | A custom role that inherits shows only its own permissions ("2 permissions") on the workspace Roles & permissions page, while the Control Plane role page counts 8 (including inherited). `data_api_invoker` is missing from the workspace list but is offered in the Members role picker. | /explore/docs-sandbox/settings/roles vs /control-plane/roles/<finance_reporter> |
| Workspace settings / Members | UX | S3 | Typing a partial email ("member-sso") in Add member gives no suggestions and the add silently does nothing visible; only the exact email works. | /explore/docs-sandbox/settings/members → Add member |
| Control plane / Storage | Bug (unverified) | S3 | On a connection created with Key prefix `sandbox`, the Browse tab lists the bucket root, not the prefix. | Storage → sandbox-lake → Browse |
| Governance / Overview | Doc | S3 | The count tiles say "classifications" and the tag page "0 tagged objects" counts BI objects only; a tag on a table column does not raise the count. | /governance/classifications/<tag> after tagging `user_id` |
| Governance / Data | UX | S3 | Grant and rule row actions are icon-only (pencil, bin) and the row text is not a link. The single grant/rule page (`/governance/grants/<id>`) has no visible link from the row. | Data → Permissions tab |
| Governance / Data | UX | S3 | The New grant dialog taller than a 900 px viewport scrolls inside the dialog and the Preview result sits below the fold. | Data → Grant access → Preview |
| Control plane / Workspaces | Gap | S3 | No way to delete a workspace, only archive; archived workspaces still count in the summary strip. | /control-plane/workspaces |
| Control plane / Audit log | Gap | S3 | The Action filter is an exact match (`secret` matches nothing; `secret:read` does). Creating a secret, workspace, catalog or engine registration did not show as a mutation entry when filtered by kind. | /control-plane/audit-log, API `kind=mutation` |
| Governance / Engines | Gap | S3 | "Seed default policies" on an empty manual profile showed no change and no message. | Profile page → Advanced → Seed default policies |
| Governance / Lineage | Gap | S3 | The sidebar entry Data Lineage is a placeholder while a working Lineage tab exists on each table. | /governance/data-lineage |
| Unverified | Not run | - | Provisioning wizard (Control Plane → Engines → Add engine), provisioned engine detail, Migrate tab, Data App pods, impersonation from the Members menu, tagging BI objects: not exercised (no Kubernetes, no hand-written policy to migrate). Pages state this. | |
