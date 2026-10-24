---
sidebar_position: 4
---

# Glossary

Terms used across the platform, in alphabetical order. Each links to the page that covers it.

| Term | Meaning |
|---|---|
| **Access Explorer** | A Control Plane page that answers two questions with their grants: what can this user or group reach, and who can reach this object. See [Access control](../control-plane/access-control). |
| **Alert** | A scheduled check on a chart or query that notifies when a condition is met. See [Alerts and reports](../explore/alerts-and-reports). |
| **App (Data App)** | A marimo notebook published as an interactive page, run in its own pod with queries going through Egret's query gateway. See [Apps](../explore/apps). |
| **Audit log** | The append-only record of authorization decisions and governance changes. See [Audit log](../control-plane/audit-log). |
| **Break-glass administrator** | The local administrator account created by `egret init`. It keeps working when single sign-on is on, and is the way in when the identity provider is down. See [First login tour](../get-started/first-login-tour). |
| **Catalog** | A collection of tables an engine can query. An *egret warehouse* is an Iceberg REST catalog embedded in the server; external metastores can be registered too. See [Catalogs](../control-plane/catalogs). |
| **Catalog Client** | A client id and secret that an engine or script uses to authenticate to the embedded catalog. Its role's grants decide what it may read or write. |
| **Cedar** | The policy language and engine behind Egret's object-level authorization decisions. |
| **Certification** | A mark that a dataset, metric or dashboard is trusted and official. Needs `dataset:certify` or `dashboard:certify`. See [Datasets and metrics](../explore/datasets-and-metrics). |
| **Chart** | One visualization of a dataset. See [Charts](../explore/charts). |
| **Classification (tag)** | A label attached to catalog objects (tables, columns), such as `pii`. Policies can mask or filter by tag. See [Classifications](../data-governance/classifications). |
| **Control plane** | Platform-level administration: workspaces, engines, catalogs, storage, secrets, users, groups, roles and the audit log. See [Workspaces](../control-plane/workspaces). |
| **Dashboard** | A grid of charts, text and filters. See [Dashboards](../explore/dashboards). |
| **Data API** | A feature that publishes a parameterized SELECT as a REST endpoint with its own clients and rate limits. See [Data API](../data-api/overview). |
| **Data steward** | A built-in platform role for managing catalogs, policy and databases without full administration. |
| **Dataset** | A table or SQL query registered in a workspace, with typed columns and metrics. See [Datasets and metrics](../explore/datasets-and-metrics). |
| **Delegation (per-user)** | Running a query as the signed-in person, with a token the engine verifies, so engine-side policy applies to that person. A connection option; needs single sign-on. |
| **Engine** | A query engine: Trino or StarRocks. A connection points a workspace at one. See [Query engines](../control-plane/query-engines). |
| **Engine username** | The name the query engines know a person by (for example `alice`), given at their first query or when a grant naming them is compiled. Grants, rules and engine policies name people by it. A deleted user's username is retired and never given to anyone else. See [Users](../control-plane/access-control/users#what-a-retired-username-means). |
| **Execution** | One run of a flow. See [Executions](../workflows/executions). |
| **Flow** | A set of tasks in YAML that runs when started or triggered. See [Flows](../workflows/flows). |
| **Governed data** | A connection option stating that the engine enforces row filters and column masks per user, so Data API endpoints on it must run queries as the caller. |
| **Governance** | Policy over who sees which data: roles, grants, row filters, column masks, classifications. See [Data governance](../data-governance/overview). |
| **Group** | A set of users. Groups synced from the identity provider are identity-provider managed; groups can also be local. Roles are usually granted to groups. |
| **Iceberg** | Apache Iceberg, the open table format Egret's catalog serves. |
| **Identity provider (IdP)** | The system that signs people in over OpenID Connect, for example Keycloak. See [Authentication setup](../deploy-operate/authentication). |
| **Machine identity provider** | Egret's own token issuer (`/oauth/token`, `/.well-known/jwks.json`) for engines, the catalog and Data API clients. Separate from the identity provider people use. |
| **Master key** | `EGRET_SECRETS__MASTER_KEY`, the key that encrypts stored credentials. |
| **Metric** | A reusable aggregation defined on a dataset, such as `SUM(totalprice)`. |
| **Namespace (workflow)** | A dotted name that groups flows, files and key-value entries, for example `company.team`. See [Namespaces](../workflows/namespaces). |
| **Object grant** | Access to one dataset, chart, dashboard or folder given to a user or group beyond their role. See [Shared objects](../workspace-settings/shared-objects). |
| **Permission** | A named action such as `dataset:manage`. See [Permissions](./permissions). |
| **Policy profile** | A named set of data policies (a Ranger *service*) that one or more engines download. See [Engine and policy](../data-governance/engines-and-policy). |
| **Ranger** | Apache Ranger, the policy framework whose plugin runs inside Trino and StarRocks. Egret acts as the Ranger administration service the plugins poll. See [Engines and Ranger setup](../deploy-operate/engines-and-ranger). |
| **Report** | A scheduled delivery of a dashboard or chart, for example by email. |
| **Role** | A named set of permissions. *Platform roles* apply across Egret; *workspace roles* apply inside one workspace. See [Roles and permissions](../workspace-settings/roles-and-permissions). |
| **Row filter / column mask** | Data policies that hide rows or obscure column values per user, enforced by the engine. |
| **Scheduler (workflow)** | The loop that fires cron and flow triggers. Off by default. |
| **Secret** | A named, encrypted credential, used by connections, storage and flows. See [Secrets](../control-plane/secrets). |
| **Service account** | A non-human identity that owns Data API clients. |
| **Slug** | The short URL-safe name of a workspace (`default`), used in `/api/ws/{workspace}`. |
| **Storage connection** | A registered S3-compatible object store. See [Storage](../control-plane/storage). |
| **Trigger** | What starts a flow other than a person: a schedule, a webhook, another flow. See [Triggers](../workflows/triggers). |
| **Warehouse** | An Iceberg catalog in the embedded REST catalog, over one storage connection. Also called an *egret warehouse*. |
| **Worker (workflow)** | The loop that claims and runs task runs. Off by default; without it executions never advance. |
| **Workspace** | An isolated area for one team: datasets, charts, dashboards, flows, connections and members. See [Concepts](../get-started/concepts). |
