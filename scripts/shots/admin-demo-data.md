# Demo data assumed by admin.mjs

Captured on the Docker demo stack (`BASE=http://egret.localtest.me:18080`). Run in this order; every step is idempotent or
checks first.

1. Sign in once through SSO as `member-sso` and `admin-sso` (Keycloak users of the demo realm) and keep their storage
   states outside the repository. `member-sso` is used for the request dialog (`scripts/capture-member-request-dialog.mjs`).
2. `node scripts/seed-admin.mjs` with `STATE` (admin) and `MEMBER_STATE` (member-sso): local users (`alice.nguyen`,
   `bao.tran`, `carla.mendes`, `david.kim`, `emma.schmidt`, `farid.haddad`, `grace.lee` disabled, `hiro.tanaka`, all
   `@egret.local`), groups `finance-analysts`, `marketing`, `data-stewards` (role `data_steward`), `executives`, roles
   `finance_reporter`, `marketing_analyst`, `security_auditor`, workspaces `Docs sandbox`, `Finance analytics`,
   `Sales operations`, `Data science lab` and the archived `Legacy reporting`, members, the connection `trino-sandbox`
   (`trino-demo:8080`), dataset `orders`, two charts and the dashboard `Finance KPIs` with five shares, five secrets, the
   storage connection `sandbox-lake`, the TPC-H catalog `tpch_bench`, four classifications and five access requests.
3. Through the UI (as documented on the pages):
   - **Add engine** `docs-trino`: `demo_warehouse` primary, `tpch_bench` attached, worker replicas `0`; assign it to
     `Docs sandbox`. Settings: `query.max-run-time` = `2h`.
   - SQL on `docs-trino` in `Docs sandbox` (as admin): schemas `demo_warehouse.analytics` and `demo_warehouse.finance`,
     tables `analytics.customers`, `analytics.sessions`, `analytics.orders`, `finance.invoices` (CTAS from
     `tpch_bench.tiny`), view `analytics.revenue_by_country`.
   - Governance: grant read on `analytics.sessions` to user `member-sso`; grants on `finance` (groups `finance-analysts`,
     `data-team`), on the catalog (role `data_steward`, read and write), on `analytics.ord*` (groups `marketing`,
     `data-team`), on `analytics.customers` (group `marketing`) and a deny on `analytics.customers.phone` (group
     `marketing`); rules `EU sessions only` (row filter), `Hide revenue outside finance` (Nullify on `revenue`),
     `Hash personal data` (Hash by tag `Personal data (PII)`); tags on `sessions.user_id`, `sessions.revenue`,
     `customers.email/phone/name`, `orders.total_price` and the table `finance.invoices` (`Confidential`); clearance
     role `data_steward` on `Confidential`; engine permission `query_max_run_time` for `member-sso`; role
     `data_steward` given directly to Farid Haddad.
   - **Register external engine** `trino-demo-ext` (`trino-demo:8080`, plugin 2.8.0) with `tpch_bench` and `finance_pg`
     declared; profile pair `docs-legacy-tags` / `docs-legacy-trino` (API, `config.tagService`) bound to it, with the
     hand-written policy `legacy: analysts read finance_pg` (migratable). Profiles `docs-external-policy` (Trino, seeded
     defaults), `docs-external-trino` and `starrocks-prod` unbound.
   - JDBC catalog `finance_pg` (secret `finance-postgres`), SMTP and Slack settings of `Docs sandbox` (Mailpit), a local
     platform admin `ops.admin@egret.local` used for impersonation.
4. Capture: `node scripts/screenshots.mjs admin/<id> …` with the admin `STATE`.

The engines are removed at the end of a docs pass (**Delete engine**), so the engine shots can only be re-captured after
repeating step 3.
