---
sidebar_position: 26
sidebar_label: Governance data browser
description: REST endpoints in the control-plane-governance group.
---

# Governance data browser API

Governance Data: browse a catalog and read an object's lineage (DG frontend redesign #1).

This page lists 11 endpoints (OpenAPI tag `control-plane-governance`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/classifications/{id}/handwritten` | `tag_handwritten` | Hand-written tag policies of a classification. |
| GET | `/api/control-plane/classifications/{id}/usage` | `tag_usage` | Where a classification is used. |
| GET | `/api/control-plane/governance/attention` | `attention` | What needs attention in governance, per the reader's permissions. |
| GET | `/api/control-plane/governance/browse/{catalog_id}` | `browse` |  |
| GET | `/api/control-plane/governance/catalogs` | `list_catalogs` | `GET /governance/catalogs`: every registry catalog, by name, for the Governance Data tree. |
| GET | `/api/control-plane/governance/changes` | `changes` | Recent governance changes, newest first. |
| GET | `/api/control-plane/governance/engines/{id}/plugin` | `engine_plugin` | What the Ranger plugins of an engine's profile report downloading. |
| GET | `/api/control-plane/governance/lineage/{catalog_id}` | `object_lineage` |  |
| GET | `/api/control-plane/governance/objects/{catalog_id}/handwritten` | `object_handwritten` | Hand-written policies that reach a Data object. |
| GET | `/api/control-plane/governance/principals/{kind}/{id}/handwritten` | `principal_handwritten` | Hand-written policies that name a principal. |
| GET | `/api/control-plane/governance/tags/{catalog_id}` | `object_tags` |  |

## GET `/api/control-plane/classifications/{id}/handwritten`

Operation id: `tag_handwritten`. Auth: Session cookie. Forbidden (403): Lacks policy:read.

Hand-written tag policies of a classification.

Every hand-written (operator) policy of every usable tag service whose tag resource matches this classification's NAME through the tag service-def's matcher (wildcards yes, case folding no), with the Trino profiles and engines that download it. Classification names are unique ignoring case (migration 0207), so no other classification shares the name. `no_tag_service` when no Trino profile has a tag service. Requires policy:read.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Tag id |

**Response 200 (application/json)**: `TagHandWritten`

| Field | Type | Required | Description |
|---|---|---|---|
| `tag` | TagRef | yes |  |
| `state` | TagPolicyState | yes |  |
| `policies` | TagPolicyRow[] | yes |  |
| `unreadable` | UnreadablePolicy[] | yes | Hand-written tag policies whose body could not be read: they may name this tag, so the list above may be incomplete. |

| Status | Meaning |
|---|---|
| 200 | The hand-written tag policies naming the classification |
| 401 | Not authenticated |
| 403 | Lacks policy:read |
| 404 | No tag with this id |
| 500 | Internal error |

## GET `/api/control-plane/classifications/{id}/usage`

Operation id: `tag_usage`. Auth: Session cookie. Forbidden (403): Lacks both tag:read and policy:read.

Where a classification is used.

The tables and columns of egret catalogs carrying the classification (grouped by table; assignments in a warehouse no catalog names are counted as `orphaned`), and the BI objects carrying it: each is checked with the caller's read permission, in workspace, kind, id order, up to 500 per request; readable ones are listed, unreadable ones only counted (no name, no workspace), the rest reported as `remaining`, and assignments to deleted objects counted. Each table of an embedded catalog says whether the catalog has it (`state`: live, dropped or missing) and which of its tagged columns it lacks, with the column's likely new name (`missingColumns`). Requires tag:read or policy:read.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Tag id |

**Response 200 (application/json)**: `TagUsage`

| Field | Type | Required | Description |
|---|---|---|---|
| `tag` | UsageTag | yes |  |
| `data` | DataUsage | yes |  |
| `bi` | BiUsage | yes |  |

| Status | Meaning |
|---|---|
| 200 | Where the classification is used |
| 401 | Not authenticated |
| 403 | Lacks both tag:read and policy:read |
| 404 | No tag with this id |
| 500 | Internal error |

## GET `/api/control-plane/governance/attention`

Operation id: `attention`. Auth: Session cookie. Forbidden (403): Holds neither policy:read nor tag:read.

What needs attention in governance, per the reader's permissions.

Findings computed from egret's own records, each only for a reader holding its source's permissions; the rest are listed in `notChecked`. A source that fails is reported as a `source_unavailable` finding and the others still answer. Counts the reader may not read are `null`.

**Response 200 (application/json)**: `AttentionResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `generatedAt` | string (date-time) | yes |  |
| `counts` | Counts | yes | Counts the reader may read; `null` for one they may not (never `0`). |
| `findings` | Finding[] | yes | Critical, warning, info; then by kind. |
| `notChecked` | NotChecked[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Counts, findings and the checks not run for this reader |
| 401 | Not authenticated |
| 403 | Holds neither policy:read nor tag:read |
| 500 | Internal error |

## GET `/api/control-plane/governance/browse/{catalog_id}`

Operation id: `browse`. Auth: Session cookie. Forbidden (403): Missing policy:read and tag:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `catalog_id` | path | string (uuid) | yes | Registry catalog id |
| `schema` | query | string | no | The schema to list (dotted for a nested egret namespace). |
| `table` | query | string | no | The table or view whose columns to list; needs `schema`. |

**Response 200 (application/json)**: `BrowseResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | BrowseSource | no |  |
| `engines` | BrowseEngine[] | yes | Every engine the catalog is attached to, by name. |
| `items` | BrowseItem[], nullable | no | Schemas, or a schema's tables and views. `null` when `table` is given or the level was not listed. |
| `columns` | BrowseColumn[], nullable | no | The table's columns, when `table` is given and it was listed. |
| `notListed` | NotListed | no |  |

| Status | Meaning |
|---|---|
| 200 | One level of the catalog, or why it was not listed |
| 400 | `table` without `schema`, or an empty `schema` or `table` |
| 401 | Not authenticated |
| 403 | Missing policy:read and tag:read permission |
| 404 | No such catalog, or (egret catalog) no such schema or table |
| 500 | Internal error |

## GET `/api/control-plane/governance/catalogs`

Operation id: `list_catalogs`. Auth: Session cookie. Forbidden (403): Missing policy:read and tag:read permission.

`GET /governance/catalogs`: every registry catalog, by name, for the Governance Data tree. Gated like browse, on `policy:read` OR `tag:read`, so a steward who cannot read the catalog registry (`catalog_registry:read`) can still pick a catalog to browse.

**Response 200 (application/json)**: array of `GovernanceCatalog`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes | The registry name, which is also the catalog's SQL name on every engine. |
| `source` | GovernanceCatalogSource | yes | How a catalog is read: from egret's own warehouse, or through an engine. |
| `connectorType` | string | yes | The catalog's kind as the registry stores it (`iceberg`, `hive`, `jdbc`, ...). |
| `engines` | string[] | yes | The names of the engines the catalog is attached to, by name. |
| `warehouseId` | string (uuid), nullable | no | The warehouse an egret catalog is; `null` for any other catalog. |
| `warehouseName` | string, nullable | no | That warehouse's name; `null` exactly when `warehouse_id` is. |
| `workspaces` | GovernanceWorkspace[] | yes | The workspaces the catalog is assigned to, by name: the rows `GET /control-plane/catalogs/\{id\}/workspaces` reads (`registry.catalog_workspaces`). |

| Status | Meaning |
|---|---|
| 200 | Every registry catalog, by name |
| 401 | Not authenticated |
| 403 | Missing policy:read and tag:read permission |
| 500 | Internal error |

## GET `/api/control-plane/governance/changes`

Operation id: `changes`. Auth: Session cookie. Forbidden (403): Holds neither policy:read nor tag:read.

Recent governance changes, newest first.

Governance events, newest first: grant, rule, hand-written policy, migration and compile changes and role assignments for a `policy:read` reader; clearance changes and catalog-column tags for a `tag:read` reader; user deletes for a reader who also holds `user:read`. Recorded from the version that introduced this feed on; role assignments and catalog tags are best-effort (recorded after commit).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `limit` | query | integer (int64) | no | Page size, default 25, at most 100. |
| `cursor` | query | string | no | The previous page's `nextCursor` (`&lt;ts_rfc3339>,&lt;id>`). |

**Response 200 (application/json)**: `ChangesPage`

| Field | Type | Required | Description |
|---|---|---|---|
| `entries` | ChangeEntry[] | yes |  |
| `nextCursor` | string, nullable | no |  |
| `retentionDays` | integer (int64), nullable | no | Days after which events are pruned; `null` when they are never pruned. |

| Status | Meaning |
|---|---|
| 200 | One page of governance changes |
| 400 | A malformed cursor |
| 401 | Not authenticated |
| 403 | Holds neither policy:read nor tag:read |
| 500 | Internal error |

## GET `/api/control-plane/governance/engines/{id}/plugin`

Operation id: `engine_plugin`. Auth: Session cookie. Forbidden (403): Lacks policy:read or engine:read.

What the Ranger plugins of an engine's profile report downloading.

The plugin download ledger of the engine's policy profile, judged by the same rules as the Governance Overview's plugin findings. Records what plugins report holding. Requires policy:read and engine:read.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: `EnginePluginResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `generatedAt` | string (date-time) | yes |  |
| `engine` | PluginEngine | yes |  |
| `profile` | PluginProfile | no |  |
| `sharedWith` | PluginEngineRef[] | yes | The other engines bound to the same profile (legacy shared), by name. |
| `plugin` | PluginReportDto | yes | Which Ranger plugin the engine runs (`egret_perm::ranger_plugin_report`). |
| `judged` | Judged | yes |  |
| `kinds` | KindReport[] | yes | One entry per kind (`policies`, then `tags`); empty when not judged. |
| `rows` | LedgerRowDto[] | yes | The profile's raw ledger rows, newest first; empty without a profile. |

| Status | Meaning |
|---|---|
| 200 | The engine's plugin download state |
| 401 | Not authenticated |
| 403 | Lacks policy:read or engine:read |
| 404 | No engine with this id |
| 500 | Internal error |

## GET `/api/control-plane/governance/lineage/{catalog_id}`

Operation id: `object_lineage`. Auth: Session cookie. Forbidden (403): Missing policy:read and tag:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `catalog_id` | path | string (uuid) | yes | Registry catalog id |
| `schema` | query | string | yes | The object's schema (dotted for a nested egret namespace). |
| `table` | query | string | yes | The table or view. |

**Response 200 (application/json)**: `ObjectLineage`

| Field | Type | Required | Description |
|---|---|---|---|
| `readers` | LineageReader[] | yes | The views and materialized views that read this table. See `readers_incomplete`. |
| `readersIncomplete` | ReadersIncomplete | no |  |
| `view` | ViewLineageInfo | no |  |

| Status | Meaning |
|---|---|
| 200 | The object's readers, and for a view its own lineage |
| 400 | A missing or empty `schema` or `table` |
| 401 | Not authenticated |
| 403 | Missing policy:read and tag:read permission |
| 404 | No such catalog, or (egret catalog) no such table or view |
| 500 | Internal error |
| 503 | (egret catalog) egret's warehouse could not be read to tell a table from a view |
| 504 | (egret catalog) egret's warehouse did not answer within the deadline |

## GET `/api/control-plane/governance/objects/{catalog_id}/handwritten`

Operation id: `object_handwritten`. Auth: Session cookie. Forbidden (403): Lacks policy:read.

Hand-written policies that reach a Data object.

Every hand-written (operator) Ranger policy of the profiles whose engines reach the catalog, and of their tag services, that reaches the object: `applies` (the policy names this object, or it and everything below it), `part` (it names something below), `parent` (it names a parent only, which engines do not apply to this object's data) or `unknown` (the body cannot be read). A resource match, not an access decision. egret-seeded policies are counted per profile. External engines are read from the database only. Requires policy:read.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `catalog_id` | path | string (uuid) | yes | Registry catalog id |
| `schema` | query | string | no | The schema (StarRocks: database); needed for `table`. |
| `table` | query | string | no | The table or view; needs `schema`, needed for `column`. |
| `column` | query | string | no | The column; needs `table`. |

**Response 200 (application/json)**: `ObjectHandWritten`

| Field | Type | Required | Description |
|---|---|---|---|
| `catalog` | HandWrittenCatalog | yes |  |
| `target` | HandWrittenTarget | yes |  |
| `state` | ListedState | yes |  |
| `reason` | NotDeterminedReason | no |  |
| `profiles` | HandWrittenProfile[] | yes |  |
| `policies` | HandWrittenPolicy[] | yes |  |
| `seeded` | SeededCount[] | yes | egret-seeded (`infra`) policies that reach the object, counted per profile and never listed. |

| Status | Meaning |
|---|---|
| 200 | The hand-written policies reaching the object |
| 400 | A level named without its parent, or empty or `*` |
| 401 | Not authenticated |
| 403 | Lacks policy:read |
| 404 | No catalog with this id |
| 500 | Internal error |

## GET `/api/control-plane/governance/principals/{kind}/{id}/handwritten`

Operation id: `principal_handwritten`. Auth: Session cookie. Forbidden (403): Lacks policy:read.

Hand-written policies that name a principal.

Every hand-written (operator) Ranger policy, in every profile and tag service, with an item naming the principal: a user's username (`direct`), or a group or role the user holds (`group` / `role`, with `onEngines: false`: engines resolve no groups or roles, so such an item reaches nobody there). Items naming `public` or `\{USER\}` are reported under `everyone`, never attributed. A user with no username is `no_username` with only the `everyone` policies. Requires policy:read.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `kind` | path | string | yes | `user`, `group` or `role` |
| `id` | path | string | yes | A user's id, or a group's or role's name |

**Response 200 (application/json)**: `PrincipalHandWritten`

| Field | Type | Required | Description |
|---|---|---|---|
| `principal` | PrincipalRef | yes |  |
| `state` | PrincipalState | yes |  |
| `policies` | PrincipalPolicy[] | yes |  |
| `everyone` | EveryoneSummary | yes | Policies with an item naming `public` or `\{USER\}`: they apply to everyone, never attributed to this principal. |
| `unreadable` | UnreadablePolicy[] | yes | Hand-written policies whose body could not be read: they may name this principal, so the list above may be incomplete. |

| Status | Meaning |
|---|---|
| 200 | The hand-written policies naming the principal |
| 400 | An unknown kind |
| 401 | Not authenticated |
| 403 | Lacks policy:read |
| 404 | No such user, group or role |
| 500 | Internal error |

## GET `/api/control-plane/governance/tags/{catalog_id}`

Operation id: `object_tags`. Auth: Session cookie. Forbidden (403): Missing policy:read and tag:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `catalog_id` | path | string (uuid) | yes | Registry catalog id |
| `schema` | query | string | yes | The table's schema (dotted for a nested egret namespace). |
| `table` | query | string | yes | The table or view. |

**Response 200 (application/json)**: `ObjectTags`

| Field | Type | Required | Description |
|---|---|---|---|
| `supported` | boolean | yes | `false` for a catalog that is not egret's: its objects cannot be tagged (tags are keyed by an egret warehouse), and `assignments` is `null`. |
| `assignments` | ResourceTagDto[], nullable | no | Each tag directly on the table (`column` empty) or on one of its columns, sorted by column then tag key. `null` exactly when not `supported`. |

| Status | Meaning |
|---|---|
| 200 | The table's and its columns' tags, or that the catalog cannot carry tags |
| 400 | A missing or empty `schema` or `table` |
| 401 | Not authenticated |
| 403 | Missing policy:read and tag:read permission |
| 404 | No such catalog |
| 500 | Internal error |

