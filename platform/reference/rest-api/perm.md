---
sidebar_position: 23
sidebar_label: Permission model
description: REST endpoints in the perm group.
---

# Permission model API

Data permission model (grants, rules, explain).

This page lists 34 endpoints (OpenAPI tag `perm`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/perm/clearances/{tag_id}/people` | `cleared_people` |  |
| POST | `/api/control-plane/perm/compile/{service_id}` | `compile` | The manual/repair trigger. |
| GET | `/api/control-plane/perm/engine-capabilities` | `list_engine_capabilities` |  |
| GET | `/api/control-plane/perm/engine-grants` | `list_all_engine_grants` |  |
| PATCH | `/api/control-plane/perm/engine-grants/{id}` | `patch_engine_grant` |  |
| DELETE | `/api/control-plane/perm/engine-grants/{id}` | `delete_engine_grant` |  |
| GET | `/api/control-plane/perm/engines/{engine_id}/grants` | `list_engine_grants` |  |
| POST | `/api/control-plane/perm/engines/{engine_id}/grants` | `create_engine_grant` |  |
| POST | `/api/control-plane/perm/explain` | `explain` | POST because the request carries a subject, an action and a whole target scope — a body, not a query string. |
| POST | `/api/control-plane/perm/explain/capability` | `explain_capability` | Evaluate one user and one engine capability on the artifact the engine's profile serves. |
| POST | `/api/control-plane/perm/explain/principal` | `explain_principal` |  |
| GET | `/api/control-plane/perm/grants` | `list_grants` |  |
| POST | `/api/control-plane/perm/grants` | `create_grant` |  |
| PATCH | `/api/control-plane/perm/grants/{id}` | `patch_grant` | **Edit in place, keeping the id — SP4b D1.** The body is the whole grant, exactly the create route's shape: this replaces the grant's body and keeps its iden... |
| DELETE | `/api/control-plane/perm/grants/{id}` | `delete_grant` |  |
| GET | `/api/control-plane/perm/overlaps` | `list_overlaps` | Every mask / row-filter pair already stored in a profile's download. |
| GET | `/api/control-plane/perm/people` | `list_people` |  |
| GET | `/api/control-plane/perm/people/groups/{name}` | `read_group` |  |
| GET | `/api/control-plane/perm/people/roles/{name}` | `read_role` |  |
| GET | `/api/control-plane/perm/people/users/{user_id}` | `read_user` |  |
| POST | `/api/control-plane/perm/people/users/{user_id}/username` | `allocate_username` |  |
| GET | `/api/control-plane/perm/policies/services/{service_id}/classify` | `classify_service_policies` | SP4d-3 Task 5: every policy of one profile, classified — its owner, whether it can be migrated into the permission model, and if not, every reason as a sente... |
| POST | `/api/control-plane/perm/policies/services/{service_id}/migrate` | `migrate_service_policies` | SP4d-3 Task 7: migrate hand-written policies of one profile into the permission model, PROVABLY — see `crate::migrate` for the transaction, its order, and th... |
| POST | `/api/control-plane/perm/policies/services/{service_id}/migrate/undo` | `undo_service_policy_migration` | SP4d-3 Task 7: undo migrations — delete the grants and rules provenance names, recompile, switch each original back on, delete the provenance. |
| GET | `/api/control-plane/perm/policies/services/{service_id}/warnings` | `service_policy_warnings` | SP4d-4 Task 11: the policies of one profile whose stored resource levels Ranger reads differently from how the editor shows them — a policy that stops above ... |
| POST | `/api/control-plane/perm/preview` | `preview` | **The dry run — SP4b D2. |
| GET | `/api/control-plane/perm/rules` | `list_rules` |  |
| POST | `/api/control-plane/perm/rules` | `create_rule` | Create a named mask or row-filter rule and recompile the profiles it affects, in one transaction. |
| GET | `/api/control-plane/perm/rules/enforcement` | `rules_enforcement` | Whether each listed STORED rule is enforced — the `enforcedBy` / `notEnforced` / `catalogs` half of `GET /perm/rules/\{id\}/effect`, computed by the same funct... |
| PATCH | `/api/control-plane/perm/rules/{id}` | `patch_rule` | Edit a rule in place, keeping the id — the rule half of SP4b D1. |
| DELETE | `/api/control-plane/perm/rules/{id}` | `delete_rule` |  |
| GET | `/api/control-plane/perm/rules/{id}/effect` | `rule_effect` | What a STORED rule does — the same [`crate::effect::RuleEffect`] a preview returns, from the same [`crate::effect::rule_effect`], so a surface showing a stor... |
| GET | `/api/control-plane/perm/unresolved-principals` | `list_unresolved_principals` | Every stored grant principal and rule exemption whose ref matches nobody (J-F3 Task 2, design R5/R6). |
| GET | `/api/control-plane/perm/username-reuse` | `username_reuse` | Evidence of past username takeovers (before migration 0209 a deleted user's username could be minted for the next person): user refs and policy bodies older ... |

## GET `/api/control-plane/perm/clearances/{tag_id}/people`

Operation id: `cleared_people`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `tag_id` | path | string (uuid) | yes | The classification's (tag's) id |

**Response 200 (application/json)**: `ClearedPeople`

| Field | Type | Required | Description |
|---|---|---|---|
| `count` | integer (int32) | yes | Every person listed by the rules above (not only the first 200). It is not everyone egret clears: platform admins are cleared and not listed (see the type doc). |
| `people` | ClearedPerson[] | yes | The first [`CLEARED_PEOPLE_LIMIT`] (200) of them, sorted by label. |
| `truncated` | boolean | yes | More people are listed than `people` carries. |
| `enginesEnforce` | boolean | yes | Whether engines enforce the clearance at all: true when it names at least one required role. False means anyone with SQL access reads the data on engines. |
| `onEnginesCount` | integer (int32) | yes | How many of `count` are `onEngines`, independent of the 200 cap. |

| Status | Meaning |
|---|---|
| 200 | The people listed for the classification's clearance, each once with every way they are listed: direct holders of a required role (live, allow, any scope; the compiler's read), holders of a required role through a group they are a direct... |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No classification has this id |
| 500 | Internal error |

## POST `/api/control-plane/perm/compile/{service_id}`

Operation id: `compile`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

The manual/repair trigger. Unlike the mutating routes it has no write of its own to be atomic with, so it opens its own transaction around `recompile_service_in_tx` and the `profile:compile` governance event (DG #3); a refused compile also records its failure in `perm.compile_runs`.

It exists because the affected-service sets above are derived from the mutated ROW, and there are model-adjacent changes no row mutation covers — an engine newly bound to a profile, a profile that had no binding when a grant was written, a tag renamed out from under a rule. This is how an operator brings one profile current without editing the model.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service_id` | path | integer (int64) | yes | policy.authz_services id |

**Response 200 (application/json)**: `CompileResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `services` | integer (int64)[] | yes | The services this pass recompiled. |
| `created` | integer | yes |  |
| `updated` | integer | yes |  |
| `deleted` | integer | yes |  |
| `unchanged` | integer | yes |  |
| `skipped` | SkipReport[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | What the recompile wrote |
| 400 | The model cannot be compiled for this profile |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such policy profile |
| 409 | A rule overlap: two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already holds one, which refuses every recompile of that profile until one rule is... |
| 500 | Internal error |

## GET `/api/control-plane/perm/engine-capabilities`

Operation id: `list_engine_capabilities`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

**Response 200 (application/json)**: `EngineCapabilitiesResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `engines` | EngineCapabilities[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The curated engine capability catalogue, per engine type, with what is deliberately not grantable and why |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |

## GET `/api/control-plane/perm/engine-grants`

Operation id: `list_all_engine_grants`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

**Response 200 (application/json)**: array of `EngineGrantView`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `engineId` | string (uuid) | yes | The engine the grant was written on. On a legacy shared profile a listing of another engine of the profile shows it too (it reaches that engine), marked by this id and [`Self::engine_name`]. |
| `engineName` | string | yes |  |
| `capability` | string | yes |  |
| `values` | string[] | yes | The values in the catalogue's key order, an impersonation target as the user's CURRENT username (it is stored by id). A target with no username is left out; `targetUserId` still names them. |
| `targetUserId` | string (uuid), nullable | no | The impersonation target's user id, for an impersonation capability. |
| `principals` | PermPrincipal[] | yes | Allow-only, include-only (spec E5). |
| `policyName` | string | yes | `perm-engine-\{id\}`. |
| `reach` | Reach | yes | Every engine a grant reaches: every engine bound to the profile it compiles into, ordered by name (spec E9). One engine in every installation created since I2; more only on a legacy shared profile. |

| Status | Meaning |
|---|---|
| 200 | Every engine grant, each with the engines it reaches (People pages match principals against `standsFor`) |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |

## PATCH `/api/control-plane/perm/engine-grants/{id}`

Operation id: `patch_engine_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine grant id |

**Request body (application/json)**: `NewEngineGrant`

| Field | Type | Required | Description |
|---|---|---|---|
| `capability` | string | yes |  |
| `values` | string[] | no | In the catalogue's key order; an impersonation target as a username. |
| `principals` | PermPrincipal[] | no | `user`, `group` (never `public`) or `role`; at least one. |

**Response 200 (application/json)**: `EngineGrantWriteResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `compile` | CompileResponse | yes | What a mutation's (or `compile`'s) recompile pass did, aggregated over every service it touched. |
| `reach` | Reach | yes | Every engine a grant reaches: every engine bound to the profile it compiles into, ordered by name (spec E9). One engine in every installation created since I2; more only on a legacy shared profile. |

| Status | Meaning |
|---|---|
| 200 | Engine grant replaced (the engine is fixed) AND its profile recompiled |
| 400 | As for create |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such engine grant |
| 409 | As for create |

## DELETE `/api/control-plane/perm/engine-grants/{id}`

Operation id: `delete_engine_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine grant id |

**Response 200 (application/json)**: `EngineGrantWriteResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `compile` | CompileResponse | yes | What a mutation's (or `compile`'s) recompile pass did, aggregated over every service it touched. |
| `reach` | Reach | yes | Every engine a grant reaches: every engine bound to the profile it compiles into, ordered by name (spec E9). One engine in every installation created since I2; more only on a legacy shared profile. |

| Status | Meaning |
|---|---|
| 200 | Engine grant deleted AND its compiled policy reaped |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such engine grant |

## GET `/api/control-plane/perm/engines/{engine_id}/grants`

Operation id: `list_engine_grants`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `engine_id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: `EngineGrantsResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `engine` | EngineRef | yes | The engine a listing is about. |
| `profile` | ProfileRef | no |  |
| `reach` | Reach | yes | Every engine a grant reaches: every engine bound to the profile it compiles into, ordered by name (spec E9). One engine in every installation created since I2; more only on a legacy shared profile. |
| `grants` | EngineGrantView[] | yes |  |
| `managed` | ManagedEntry[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The engine, its profile, every engine it shares that profile with, its engine grants and the profile's seeded (managed) policies |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such engine |

## POST `/api/control-plane/perm/engines/{engine_id}/grants`

Operation id: `create_engine_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `engine_id` | path | string (uuid) | yes | Engine id |

**Request body (application/json)**: `NewEngineGrant`

| Field | Type | Required | Description |
|---|---|---|---|
| `capability` | string | yes |  |
| `values` | string[] | no | In the catalogue's key order; an impersonation target as a username. |
| `principals` | PermPrincipal[] | no | `user`, `group` (never `public`) or `role`; at least one. |

**Response 201 (application/json)**: `EngineGrantWriteResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `compile` | CompileResponse | yes | What a mutation's (or `compile`'s) recompile pass did, aggregated over every service it touched. |
| `reach` | Reach | yes | Every engine a grant reaches: every engine bound to the profile it compiles into, ordered by name (spec E9). One engine in every installation created since I2; more only on a legacy shared profile. |

| Status | Meaning |
|---|---|
| 201 | Engine grant created AND the engine's profile recompiled, in one transaction |
| 400 | Unknown capability, a capability of another engine type, a value that breaks the catalogue's rules, a catalog the engine does not reach, or empty/invalid/unresolvable principals |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such engine |
| 409 | The engine has no profile, is being deleted or is RisingWave; the impersonation target is reserved or an engine admin; the engine already has that grant; or the recompile refused (overlap, ceiling) |

## POST `/api/control-plane/perm/explain`

Operation id: `explain`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:read permission, or a workspace-scoped impersonation overlay asking about a catalog that workspace is not assigned.

POST because the request carries a subject, an action and a whole target scope — a body, not a query string. **It is nonetheless read-only**: it opens no transaction and issues no write. It gates on `policy:read`, not `policy:update`, precisely so the method does not decide the permission.

# What this answers with, and why it changed (SP4d-2a)

**Request body (application/json)**: `ExplainRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | ExplainSubject | yes | The caller `explain` decides about. |
| `action` | Action | yes | The two actions SP4a knows. `read` compiles to `select` on every engine; `write` compiles to `insert,delete` on Trino (no `update` access type exists there) and `insert,update,delete` on StarRocks. DDL is out of scope for SP4a — see the... |
| `target` | Scope | yes | A path into a catalog. `schema`/`table`/`column` narrow progressively — `perm.grants` and `perm.rules` both CHECK that a level cannot be skipped (a column implies a table implies a schema). |

**Response 200 (application/json)**: `ExplainResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `outcome` | ExplainOutcome | yes | Which of `explain`'s two shapes a response carries. |
| `profiles` | ExplainProfile[] | yes | Empty exactly when `outcome` is `no_profile_serves_the_catalog`. |
| `tag_resolution_declined` | ExplainTagDecline | no |  |
| `effect_line` | ExplainEffectLine | no |  |

| Status | Meaning |
|---|---|
| 200 | One verdict per profile over the artifact each engine downloads — including the `no_profile_serves_the_catalog` outcome for a catalog that exists and that no profile serves, which is an answer and not an error |
| 400 | The target skips a resource level (a column implies a table implies a schema), names a level as "" or "*" (Ranger's "every value", not a resource name), or names a catalog id no registered catalog has |
| 401 | Not authenticated |
| 403 | Missing policy:read permission, or a workspace-scoped impersonation overlay asking about a catalog that workspace is not assigned |
| 500 | Internal error |

## POST `/api/control-plane/perm/explain/capability`

Operation id: `explain_capability`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:read permission.

Evaluate one user and one engine capability on the artifact the engine's profile serves. Undecidable is returned as such: on a delegating Trino profile every impersonation question is Undecidable, because the self-impersonation baseline names `\{USER\}`, which egret's evaluator does not expand.

**Request body (application/json)**: `ExplainCapabilityRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `subject` | ExplainSubject | yes | A username; no groups or roles, as `/perm/explain`. |
| `engineId` | string (uuid) | yes |  |
| `capability` | string | yes |  |
| `values` | string[] | no | In the catalogue's key order, an impersonation target as a username. |

**Response 200 (application/json)**: `ExplainCapabilityResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `engine` | EngineRef | yes | The engine a listing is about. |
| `profile` | ProfileRef | no |  |
| `reach` | Reach | yes | Every engine a grant reaches: every engine bound to the profile it compiles into, ordered by name (spec E9). One engine in every installation created since I2; more only on a legacy shared profile. |
| `outcome` | CapabilityOutcome | yes | Whether the engine's profile could be asked at all. |
| `decision` | WireDecision | no |  |
| `attribution` | ExplainAttribution | no |  |
| `policyName` | string, nullable | no |  |
| `tagResolution` | CapabilityTagResolution | yes | What egret did about tags for this question. |

| Status | Meaning |
|---|---|
| 200 | The decision, or `outcome: no_profile` with `decision: null` for an engine that downloads no profile |
| 400 | Unknown capability, a capability of another engine type, or a value that breaks the catalogue's rules |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such engine |
| 409 | The profile's engines run a plugin version egret does not model |

## POST `/api/control-plane/perm/explain/principal`

Operation id: `explain_principal`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:read permission, or a workspace-scoped impersonation overlay asking about a catalog that workspace is not assigned.

**Request body (application/json)**: `ExplainPrincipalRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `principal` | ExplainPrincipalRef | yes | A group or a role, as a grant principal stores it. |
| `action` | Action | yes | The two actions SP4a knows. `read` compiles to `select` on every engine; `write` compiles to `insert,delete` on Trino (no `update` access type exists there) and `insert,update,delete` on StarRocks. DDL is out of scope for SP4a — see the... |
| `target` | Scope | yes | A path into a catalog. `schema`/`table`/`column` narrow progressively — `perm.grants` and `perm.rules` both CHECK that a level cannot be skipped (a column implies a table implies a schema). |

**Response 200 (application/json)**: `ExplainPrincipalResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `membersTotal` | integer | yes | Every member, with or without a username. |
| `limit` | integer | yes | [`EXPLAIN_MEMBER_LIMIT`]. |
| `truncated` | boolean | yes | More members with a username than `limit`: the rest were not evaluated (`membersTotal - evaluated - notEvaluated` of them). |
| `evaluated` | MemberVerdict[] | yes | Sorted by username; the first `limit` members with one. |
| `notEvaluated` | MemberNotEvaluated[] | yes | Every member with no username, sorted by label. |

| Status | Meaning |
|---|---|
| 200 | Each member of the group or role (as the compiler reads them) evaluated as a user over the artifacts each engine downloads, exactly as `/perm/explain` answers for that user. At most 200 are evaluated, sorted by username; members with no... |
| 400 | The principal is `public`, a workspace, a user (ask `/perm/explain`), or a group or role no one has; or the target is refused as `/perm/explain` refuses it |
| 401 | Not authenticated |
| 403 | Missing policy:read permission, or a workspace-scoped impersonation overlay asking about a catalog that workspace is not assigned |
| 500 | Internal error |

## GET `/api/control-plane/perm/grants`

Operation id: `list_grants`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

**Response 200 (application/json)**: array of `GrantView`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `effect` | Effect | yes | `perm.effect`. |
| `actions` | Action[] | yes |  |
| `scope` | Scope | yes | A path into a catalog. `schema`/`table`/`column` narrow progressively — `perm.grants` and `perm.rules` both CHECK that a level cannot be skipped (a column implies a table implies a schema). |
| `principals` | PrincipalSet | yes | A principal subtract: `include` minus `exclude`. This is what lets egret drop Ranger's allow-exception/deny-exception blocks from the authoring surface (see `crates/egret-perm/tests/store.rs`) — both `Grant.principals` and `Rule.exempt` use... |
| `origin` | GrantOrigin | yes | Why a grant exists. `WorkspaceAssignment` rows are written by the assignment path, not by a human, and are recreated from the assignment on demand (D3) — `perm.grants` enforces at most one such row per `(catalog_id, workspace_id)` via... |
| `catalog_name` | string, nullable | no | `registry.catalogs.name` for `scope.catalog_id`, resolved server-side. |

| Status | Meaning |
|---|---|
| 200 | Every grant in the model, with its principal subtract and its catalog's resolved name |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## POST `/api/control-plane/perm/grants`

Operation id: `create_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

**Request body (application/json)**: `NewGrant`

| Field | Type | Required | Description |
|---|---|---|---|
| `effect` | Effect | yes | `perm.effect`. |
| `actions` | Action[] | yes |  |
| `scope` | Scope | yes | A path into a catalog. `schema`/`table`/`column` narrow progressively — `perm.grants` and `perm.rules` both CHECK that a level cannot be skipped (a column implies a table implies a schema). |
| `principals` | PrincipalSet | no | A principal subtract: `include` minus `exclude`. This is what lets egret drop Ranger's allow-exception/deny-exception blocks from the authoring surface (see `crates/egret-perm/tests/store.rs`) — both `Grant.principals` and `Rule.exempt` use... |

| Status | Meaning |
|---|---|
| 201 | Grant created AND the profiles it affects recompiled, in one transaction |
| 400 | The grant names a scope level as "" (Ranger's "every value at that level", not a resource name — it would be enforced across the whole catalog), names a level beneath a "*" one (a path cannot skip a level, and a "*" names none), or cannot... |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 409 | A rule overlap: two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already holds one, which refuses every recompile of that profile until one rule is... |
| 500 | Internal error |

## PATCH `/api/control-plane/perm/grants/{id}`

Operation id: `patch_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

**Edit in place, keeping the id — SP4b D1.** The body is the whole grant, exactly the create route's shape: this replaces the grant's body and keeps its identity, which is what a UI "Edit" must mean. Before this route the only way to change a grant was delete-plus-create, i.e. a new id, two recompiles and a window with no row — and an `explain` reason carries the `grant_id` the UI deep-links from, so every such link broke on every edit.

Replace a grant's body, keeping its id, and recompile the UNION of the profiles it affected before and after the change — a patch that moves the grant to another catalog must reap the policy from the profile it used to reach, or that engine enforces it forever.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Grant id |

**Request body (application/json)**: `NewGrant`

| Field | Type | Required | Description |
|---|---|---|---|
| `effect` | Effect | yes | `perm.effect`. |
| `actions` | Action[] | yes |  |
| `scope` | Scope | yes | A path into a catalog. `schema`/`table`/`column` narrow progressively — `perm.grants` and `perm.rules` both CHECK that a level cannot be skipped (a column implies a table implies a schema). |
| `principals` | PrincipalSet | no | A principal subtract: `include` minus `exclude`. This is what lets egret drop Ranger's allow-exception/deny-exception blocks from the authoring surface (see `crates/egret-perm/tests/store.rs`) — both `Grant.principals` and `Rule.exempt` use... |

**Response 200 (application/json)**: `CompileResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `services` | integer (int64)[] | yes | The services this pass recompiled. |
| `created` | integer | yes |  |
| `updated` | integer | yes |  |
| `deleted` | integer | yes |  |
| `unchanged` | integer | yes |  |
| `skipped` | SkipReport[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Grant updated AND every affected profile recompiled, in one transaction |
| 400 | The patched grant names a scope level as "" (Ranger's "every value at that level", not a resource name), names a level beneath a "*" one (a path cannot skip a level, and a "*" names none), cannot be compiled, names no principal or no... |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such grant |
| 409 | The grant changed concurrently and now affects a profile this request did not lock; retry; or two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already... |
| 500 | Internal error |

## DELETE `/api/control-plane/perm/grants/{id}`

Operation id: `delete_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Grant id |

| Status | Meaning |
|---|---|
| 200 | Grant deleted AND its compiled policies reaped, in one transaction |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such grant |
| 409 | A rule overlap: two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already holds one, which refuses every recompile of that profile until one rule is... |
| 500 | Internal error |

## GET `/api/control-plane/perm/overlaps`

Operation id: `list_overlaps`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

Every mask / row-filter pair already stored in a profile's download. Writes refuse only the pairs they create; this is where an operator sees the rest.

**Response 200 (application/json)**: array of `StoredOverlap`

| Field | Type | Required | Description |
|---|---|---|---|
| `serviceId` | integer (int64) | yes | The profile whose download serves the pair (a tag service on its own when no profile names it). |
| `serviceName` | string | yes |  |
| `kind` | string | yes | `"mask"` or `"row_filter"`. |
| `coordinate` | string | yes |  |
| `rules` | StoredMember[] | yes | In the pair's order (policy names ascending). |
| `servedToday` | StoredMember | no |  |
| `sentence` | string | yes |  |
| `howToFix` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Every overlapping mask or row-filter pair stored in a profile's download, compiled or hand-written, with the profile that serves it |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## GET `/api/control-plane/perm/people`

Operation id: `list_people`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `kind` | query | string | no | `user` \| `group` \| `role`. Required. |
| `q` | query | string | no | Case-insensitive substring of a user's name, email or username, or of a group's or role's name. `%` and `_` are literal. |
| `username` | query | string | no | Exact, case-insensitive username lookup. `kind=user` only. Finds a service account whatever `includeServiceAccounts` says. |
| `includeServiceAccounts` | query | boolean | no | `kind=user` only: list service accounts too. Default false. |
| `limit` | query | integer (int64) | no | Page size; default 50, at most 200 (a larger value is capped). |
| `offset` | query | integer (int64) | no | Rows to skip; default 0. |

**Response 200 (application/json)**: `PeoplePage`

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | PersonRow[] | yes |  |
| `total` | integer (int64) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Users, groups or roles, filtered and paged. Users exclude service accounts unless `includeServiceAccounts=true` or `username` is given (a service account row is marked `serviceAccount`), and are sorted by label; groups and roles by name. A... |
| 400 | `kind` missing or not `user`, `group` or `role`; `username` or `includeServiceAccounts` with a kind other than `user`; or a negative `limit` or `offset` |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## GET `/api/control-plane/perm/people/groups/{name}`

Operation id: `read_group`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `name` | path | string | yes | The group's name, as a grant principal stores it; `public` for everyone |

**Response 200 (application/json)**: `GroupPrincipal`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `source` | string, nullable | no | `local` or `oidc`; null for `public`. |
| `isPublic` | boolean | yes |  |
| `members` | MemberRef[] | yes | Direct members, as the compiler reads them; empty for `public`. |
| `serviceAccounts` | integer (int64) | yes | How many of `members` are service accounts. |
| `roles` | Membership[] | yes |  |
| `workspaces` | Membership[] | yes |  |
| `standsFor` | StandsFor[] | yes |  |
| `clearances` | ClearanceFact[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The group: source, direct members (as the compiler reads them; service accounts included), the roles and workspaces it holds (egret only), `standsFor` and clearances. `public` answers `isPublic: true` with no members |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No group has this name |
| 500 | Internal error |

## GET `/api/control-plane/perm/people/roles/{name}`

Operation id: `read_role`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `name` | path | string | yes | The role's name, across every scope defining it |

**Response 200 (application/json)**: `RolePrincipal`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `scopes` | string[] | yes | Every scope defining the name, sorted. |
| `holders` | MemberRef[] | yes | Live allow holders that are users, as the compiler reads them. |
| `serviceAccounts` | integer (int64) | yes | How many of `holders` are service accounts. |
| `holderGroups` | GroupRef[] | yes | Groups holding the role, unexpired (egret only). |
| `standsFor` | StandsFor[] | yes |  |
| `clearances` | ClearanceFact[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The role: scopes, live holders that are users (as the compiler reads them; service accounts included), groups holding it (egret only), `standsFor` and clearances |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No role has this name |
| 500 | Internal error |

## GET `/api/control-plane/perm/people/users/{user_id}`

Operation id: `read_user`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `user_id` | path | string (uuid) | yes | The user's id |

**Response 200 (application/json)**: `UserPrincipal`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `username` | string, nullable | no |  |
| `status` | string | yes | `active` or `disabled`. |
| `serviceAccount` | boolean | yes |  |
| `groups` | Membership[] | yes |  |
| `roles` | Membership[] | yes | Role grants, direct and through a group. |
| `workspaces` | Membership[] | yes | Workspace-scoped grants, direct and through a group. |
| `standsFor` | StandsFor[] | yes |  |
| `clearances` | ClearanceFact[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The user: identity, memberships (groups, roles and workspaces, direct and through a group, expired ones included and marked), `standsFor` (every grant principal that reaches the user, and whether engines apply it) and a clearance answer per... |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No user has this id |
| 500 | Internal error |

## POST `/api/control-plane/perm/people/users/{user_id}/username`

Operation id: `allocate_username`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `user_id` | path | string (uuid) | yes | The user's id |

**Response 200 (application/json)**: `AllocatedUsername`

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | string | yes |  |
| `allocated` | boolean | yes | `true` only for the one request that allocated it; every other call (before or concurrently) answers `false`. |

| Status | Meaning |
|---|---|
| 200 | The user's engine username. A user who has none is allocated the name egret would allocate at their first query (`allocated: true`); one who has one is answered it unchanged (`allocated: false`). A service account is allocated like any user |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No user has this id |
| 409 | A stored grant principal or rule exemption already names the username that would be allocated as a `user` ref (compared case-insensitively, as egret resolves user refs). It matches nobody today and would start applying to this person, so... |
| 500 | Internal error |

## GET `/api/control-plane/perm/policies/services/{service_id}/classify`

Operation id: `classify_service_policies`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

SP4d-3 Task 5: every policy of one profile, classified — its owner, whether it can be migrated into the permission model, and if not, every reason as a sentence naming the offending value. Read-only; `infra` and `compiler` rows are reported (as not migratable, with the reason), never omitted. The `classify` module doc says how the service kind, the catalog lookup and the tag lookup are derived from the profile.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service_id` | path | integer (int64) | yes | policy.authz_services id |

**Response 200 (application/json)**: array of `ClassifiedPolicy`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes |  |
| `name` | string | yes |  |
| `managed_by` | string | yes | `compiler` \| `infra` \| `operator` — `policy.authz_policies.managed_by`. |
| `enabled` | boolean | yes | The `enabled` COLUMN — what decides whether the engine downloads it. |
| `migratable` | boolean | yes |  |
| `blockers` | string[] | yes | Every reason the policy cannot be migrated, as operator-readable sentences naming the offending value. Empty iff `migratable`. |
| `proposed` | ProposedObjects | no |  |
| `migrated` | MigrationRecord | no |  |
| `warnings` | PolicyWarning[] | yes | SP4d-4 Task 11: what this policy's resource levels mean to Ranger, independent of migration — a policy that stops above `column` and allows `select` grants no column read, and one with a gap decides nothing. Empty for every row that is... |

| Status | Meaning |
|---|---|
| 200 | Every policy of the profile, ordered by id, with its owner, verdict and blocker sentences |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such policy profile |
| 500 | Internal error |

## POST `/api/control-plane/perm/policies/services/{service_id}/migrate`

Operation id: `migrate_service_policies`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

SP4d-3 Task 7: migrate hand-written policies of one profile into the permission model, PROVABLY — see `crate::migrate` for the transaction, its order, and the refusal order. The equivalence gate runs inside the transaction over every profile the new objects compile into, against the downloads as they stand after the write.

**`dry_run` runs the identical code and differs in exactly one place: the line below that decides to commit.** A proven migration answers 200; one the gate did not prove answers 422 with the same body shape (its disagreements, or why the gate refused), and nothing is written.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service_id` | path | integer (int64) | yes | policy.authz_services id |

**Request body (application/json)**: `MigrateRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `policy_names` | string[] | yes | Names of policies of THIS profile, exactly as stored. |
| `dry_run` | boolean | no | Run everything, report it, and roll back. |

**Response 200 (application/json)**: `MigrateResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `dry_run` | boolean | yes |  |
| `committed` | boolean | yes | Whether the transaction committed. `false` for every dry run and for every migration the gate did not prove. |
| `equivalent` | boolean | yes | The gate ran over every affected profile and found no disagreement. |
| `refusal` | string, nullable | no | Why the gate refused to answer at all (no disagreement list is a proof then). Absent when it answered. |
| `policies` | MigratedPolicy[] | yes | Each migrated policy and the model objects it became. |
| `profiles` | GatedProfile[] | yes | EVERY profile the gate evaluated — the source and every other profile the new objects compile into — with what changed in its download. |
| `probe_evaluations` | integer | yes | Probe evaluations run (probes × plugin versions, over every profile). |
| `disagreements` | WireDisagreement[] | yes | Every probe on which a profile answers differently after the write. |
| `compile` | CompileResponse | yes | What the recompile did. |
| `notices` | string[] | yes | Consequences to read before committing (see the module doc). |

| Status | Meaning |
|---|---|
| 200 | Proved equivalent on every affected profile; committed unless `dry_run` |
| 400 | A named policy is not migratable (the classifier's sentences), or the request names no policy / a policy twice |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such profile, or no policy of that name in it |
| 409 | Already migrated, not hand-written (compiler or infra owned), or a rule name it would create is taken; or two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it... |
| 422 | Not proved: the disagreements on any affected profile, or why the gate could not answer. Nothing was written |
| 500 | Internal error |

## POST `/api/control-plane/perm/policies/services/{service_id}/migrate/undo`

Operation id: `undo_service_policy_migration`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

SP4d-3 Task 7: undo migrations — delete the grants and rules provenance names, recompile, switch each original back on, delete the provenance. One transaction.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service_id` | path | integer (int64) | yes | policy.authz_services id |

**Request body (application/json)**: `UndoRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `policy_names` | string[] | yes |  |

**Response 200 (application/json)**: `UndoResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `policies` | UndonePolicy[] | yes |  |
| `compile` | CompileResponse | yes | What a mutation's (or `compile`'s) recompile pass did, aggregated over every service it touched. |
| `notices` | string[] | yes | Consequences that outlive the undo (review I-2). |

| Status | Meaning |
|---|---|
| 200 | Every named migration undone |
| 400 | The request names no policy, or a policy twice |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such profile, or no migration on record for a named policy |
| 409 | Nothing was changed: an object the migration created was edited or deleted since, or the original was edited or switched on (each change is named); or a profile became reachable from the migrated objects while undo waited for its locks... |
| 500 | Internal error |

## GET `/api/control-plane/perm/policies/services/{service_id}/warnings`

Operation id: `service_policy_warnings`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

SP4d-4 Task 11: the policies of one profile whose stored resource levels Ranger reads differently from how the editor shows them — a policy that stops above `column` and allows `select` (it grants no column read), or one with a gap (it decides nothing) — with `warningCount` for the profile. Read-only: a stored row is flagged here, never rewritten. The same `warnings` ride on each policy of `GET .../classify`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service_id` | path | integer (int64) | yes | policy.authz_services id |

**Response 200 (application/json)**: `ProfileWarnings`

| Field | Type | Required | Description |
|---|---|---|---|
| `warningCount` | integer | yes |  |
| `policies` | WarnedPolicy[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | `warningCount` and, ordered by id, the policies of the profile that carry a warning |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such policy profile |
| 500 | Internal error |

## POST `/api/control-plane/perm/preview`

Operation id: `preview`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

**The dry run — SP4b D2. It runs the REAL write and rolls it back.**

Dry-run a grant or rule write: report the policy profiles it would recompile, and the compile error it would fail with, without storing anything. Runs the real write in a transaction that is rolled back, so the answer cannot differ from what the write would do.

**Request body (application/json)**: `PreviewRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid), nullable | no | Present ⇒ preview a PATCH of this existing row. Absent ⇒ a create. |
| `grant` | NewGrant | no |  |
| `rule` | NewRule | no |  |

**Response 200 (application/json)**: `PreviewResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `affected` | AffectedProfile[] | yes |  |
| `compile` | CompileResponse | yes | What a mutation's (or `compile`'s) recompile pass did, aggregated over every service it touched. |
| `effect` | RuleEffect | no |  |

| Status | Meaning |
|---|---|
| 200 | The profiles the write would touch, and what its recompile would do |
| 400 | The same refusal the write itself would have returned (including code `table_tag_mask_conflict` for a tag-addressed mask over a table-level attachment) |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | Previewing a patch of an id that does not exist |
| 409 | The previewed row changed concurrently — the same refusal the write would have given; or two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already holds... |
| 500 | Internal error |

## GET `/api/control-plane/perm/rules`

Operation id: `list_rules`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

**Response 200 (application/json)**: array of `RuleView`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `kind` | RuleKind | yes | `perm.rule_kind` plus its type-dependent payload, CHECK-constrained in the database (`(kind = 'mask') = (mask_type IS NOT NULL)`, etc.) and made unrepresentable here instead. |
| `selector` | Selector | yes | What a rule's scope is selected by. `Tag` references `tags.key` — never `tags.name`, which is mutable and non-unique (D6) — and egret never emits a tag *access* policy for it (D2); only masking/row-filter rules select by tag. `Path` is a... |
| `exempt` | PrincipalSet | yes | A principal subtract: `include` minus `exclude`. This is what lets egret drop Ranger's allow-exception/deny-exception blocks from the authoring surface (see `crates/egret-perm/tests/store.rs`) — both `Grant.principals` and `Rule.exempt` use... |
| `catalog_name` | string, nullable | no | `registry.catalogs.name` for a `path` selector's catalog; `None` for a `tag` selector. |
| `tag_name` | string, nullable | no | `tags.name` for a `tag` selector's `key`; `None` for a `path` selector. |

| Status | Meaning |
|---|---|
| 200 | Every named rule in the model, with its exemption set and its selector's resolved display name |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## POST `/api/control-plane/perm/rules`

Operation id: `create_rule`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

Create a named mask or row-filter rule and recompile the profiles it affects, in one transaction. A tag-selected rule is installation-wide: it recompiles every Trino and StarRocks profile an engine binds, and a compile failure on any one of them fails this request and rolls the rule back.

**Request body (application/json)**: `NewRule`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `kind` | RuleKind | yes | `perm.rule_kind` plus its type-dependent payload, CHECK-constrained in the database (`(kind = 'mask') = (mask_type IS NOT NULL)`, etc.) and made unrepresentable here instead. |
| `selector` | Selector | yes | What a rule's scope is selected by. `Tag` references `tags.key` — never `tags.name`, which is mutable and non-unique (D6) — and egret never emits a tag *access* policy for it (D2); only masking/row-filter rules select by tag. `Path` is a... |
| `exempt` | PrincipalSet | no | A principal subtract: `include` minus `exclude`. This is what lets egret drop Ranger's allow-exception/deny-exception blocks from the authoring surface (see `crates/egret-perm/tests/store.rs`) — both `Grant.principals` and `Rule.exempt` use... |

| Status | Meaning |
|---|---|
| 201 | Rule created AND the profiles it affects recompiled, in one transaction |
| 400 | The rule names a path level as "" (Ranger's "every value at that level", not a resource name), names a path level beneath a "*" one (a path cannot skip a level, and a "*" names none), is a tag-addressed mask whose tag is attached to a whole... |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 409 | A rule overlap: two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already holds one, which refuses every recompile of that profile until one rule is... |
| 500 | Internal error |

## GET `/api/control-plane/perm/rules/enforcement`

Operation id: `rules_enforcement`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

Whether each listed STORED rule is enforced — the `enforcedBy` / `notEnforced` / `catalogs` half of `GET /perm/rules/\{id\}/effect`, computed by the same functions, for surfaces that list rules. Bounded by [`crate::effect::RULE_ENFORCEMENT_CAP`] ids per request.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `ids` | query | string | no | Comma-separated rule ids, at most 100 distinct. |

**Response 200 (application/json)**: array of `RuleEnforcement`

| Field | Type | Required | Description |
|---|---|---|---|
| `ruleId` | string (uuid) | yes |  |
| `enforcedBy` | integer (int32) | yes | Distinct engines, bound to a profile, attached to a catalog the rule reaches (as `enforcedBy` in the rule's effect). |
| `notEnforced` | NotEnforced | no |  |
| `catalogs` | EffectCatalog[] | yes | Each catalog the rule reaches and who enforces it THERE, as `catalogs` in the rule's effect: a page about one catalog reads its entry, since a rule enforced in one catalog may be enforced in no other. |

| Status | Meaning |
|---|---|
| 200 | One entry per known id, in the order asked (a repeated id once, an unknown id left out): the number of engines bound to a policy profile that enforce the rule, and why none does (`no_assignment`, `no_engine`, `no_profile`, `no_tag_service`)... |
| 400 | An id is not a UUID, or more than 100 distinct ids were asked for |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## PATCH `/api/control-plane/perm/rules/{id}`

Operation id: `patch_rule`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

Edit a rule in place, keeping the id — the rule half of SP4b D1. Same old-plus-new union as [`patch_grant`], and the same reason: an `explain` reason carries the `rule_id` a UI links from.

Replace a rule's body, keeping its id, and recompile the UNION of the profiles it affected before and after the change. A patch that turns a path selector into a tag selector (or back) changes that set by the whole installation, not by one profile.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Rule id |

**Request body (application/json)**: `NewRule`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `kind` | RuleKind | yes | `perm.rule_kind` plus its type-dependent payload, CHECK-constrained in the database (`(kind = 'mask') = (mask_type IS NOT NULL)`, etc.) and made unrepresentable here instead. |
| `selector` | Selector | yes | What a rule's scope is selected by. `Tag` references `tags.key` — never `tags.name`, which is mutable and non-unique (D6) — and egret never emits a tag *access* policy for it (D2); only masking/row-filter rules select by tag. `Path` is a... |
| `exempt` | PrincipalSet | no | A principal subtract: `include` minus `exclude`. This is what lets egret drop Ranger's allow-exception/deny-exception blocks from the authoring surface (see `crates/egret-perm/tests/store.rs`) — both `Grant.principals` and `Rule.exempt` use... |

**Response 200 (application/json)**: `CompileResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `services` | integer (int64)[] | yes | The services this pass recompiled. |
| `created` | integer | yes |  |
| `updated` | integer | yes |  |
| `deleted` | integer | yes |  |
| `unchanged` | integer | yes |  |
| `skipped` | SkipReport[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Rule updated AND every affected profile recompiled, in one transaction |
| 400 | The patched rule names a path level as "" (Ranger's "every value at that level", not a resource name), names a path level beneath a "*" one (a path cannot skip a level, and a "*" names none), is a tag-addressed mask whose tag is attached to... |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such rule |
| 409 | The rule changed concurrently and now affects a profile this request did not lock; retry; or two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already... |
| 500 | Internal error |

## DELETE `/api/control-plane/perm/rules/{id}`

Operation id: `delete_rule`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Rule id |

| Status | Meaning |
|---|---|
| 200 | Rule deleted AND its compiled policies reaped, in one transaction |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such rule |
| 409 | A rule overlap: two mask (or two row-filter) rules would decide one request differently: this write would compile such a pair, or a profile it recompiles already holds one, which refuses every recompile of that profile until one rule is... |
| 500 | Internal error |

## GET `/api/control-plane/perm/rules/{id}/effect`

Operation id: `rule_effect`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

What a STORED rule does — the same [`crate::effect::RuleEffect`] a preview returns, from the same [`crate::effect::rule_effect`], so a surface showing a stored rule can say "Not enforced yet" with the preview's reason.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Rule id |

**Response 200 (application/json)**: `RuleEffect`

| Field | Type | Required | Description |
|---|---|---|---|
| `kind` | EffectKind | yes | `mask` or `row_filter`. |
| `catalogs` | EffectCatalog[] | yes | Every registry catalog the rule reaches, by name. |
| `tableCount` | integer (int32), nullable | no | Distinct tables reached; `null` when a path level is a pattern (or absent). |
| `columnCount` | integer (int32), nullable | no | Masks only; `null` for a pattern, for "every column" (a path mask without a column, or a tag on a whole table) and for row filters. |
| `enforcedBy` | integer (int32) | yes | Distinct engines, bound to a profile, attached to a reached catalog. |
| `notEnforced` | NotEnforced | no |  |
| `exemptMembers` | integer (int32) | yes | Distinct users in `exempt.include`, groups, roles and workspaces expanded. |
| `exemptEveryone` | boolean | yes | `exempt.include` names the `public` group: nobody is masked. |
| `alreadyMasked` | ExistingMask[] | yes | Other mask rules that reach a column this rule reaches (at most 20). |
| `truncated` | boolean | yes | `alreadyMasked` may be incomplete: a cap cut the columns examined (50), the classifications read (1000) or the entries listed (20). |
| `trinoColumnOnly` | TrinoColumnOnly | no |  |

| Status | Meaning |
|---|---|
| 200 | The stored rule's effect: reach, the engines that enforce it (or why none does), exemptions and the other masks on its columns. The same computation, and the same shape, as `effect` on `POST /perm/preview` |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such rule |
| 500 | Internal error |

## GET `/api/control-plane/perm/unresolved-principals`

Operation id: `list_unresolved_principals`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

Every stored grant principal and rule exemption whose ref matches nobody (J-F3 Task 2, design R5/R6). Writes refuse such a ref since J-F3 Task 1; a row stored before that, or naming a principal deleted since, is listed here, never rewritten.

**Response 200 (application/json)**: array of `UnresolvedPrincipal`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes | `"grant"`, `"rule"` or `"engine_grant"` (F11: always an allow include, so it never fails open). |
| `id` | string (uuid) | yes | The grant's or the rule's id. |
| `name` | string, nullable | no | The rule's name; `null` for a grant (a grant has none). |
| `kind` | string | yes | `user`, `group`, `role` or `workspace_members`. |
| `ref` | string | yes | The ref as stored, byte-for-byte — the string the compiled policy names. |
| `position` | string | yes | `"include"` or `"exclude"` (of the grant's `principals`, or of the rule's `exempt`). |
| `effect` | string, nullable | no | The grant's `allow` / `deny`; `null` for a rule exemption. |
| `status` | string | yes | `"unresolved"`: the ref names nobody egret knows. `"empty"`: it names a group that exists and has no members, so it matches nobody TODAY. |
| `reason` | string | yes | Why it matches nobody, as a sentence an author can act on. |
| `failsOpen` | boolean | yes | Matching nobody here makes the compiled policy allow MORE than the model states: an unresolved ref in a deny grant's include, an allow grant's exclude, or a rule exemption's exclude. An allow include, a deny grant's exclude (a... |

| Status | Meaning |
|---|---|
| 200 | Every stored grant principal and rule exemption whose ref matches nobody, ordered by source, id, position, kind and ref. `failsOpen` marks the ones where matching nobody makes the compiled policy allow more than the model states (a deny... |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## GET `/api/control-plane/perm/username-reuse`

Operation id: `username_reuse`. Auth: Session cookie. Forbidden (403): Not a platform admin.

Evidence of past username takeovers (before migration 0209 a deleted user's username could be minted for the next person): user refs and policy bodies older than the person who now holds the name, `egret-admin` bodies naming someone who is not an active platform admin, and refs nobody holds. Reported only; nothing is changed.

**Response 200 (application/json)**: `UsernameReuseReport`

| Field | Type | Required | Description |
|---|---|---|---|
| `generatedAt` | string (date-time) | yes |  |
| `findings` | ReuseFinding[] | yes |  |
| `baselineTakenAt` | string (date-time), nullable | no | When migration 0209 took the baseline; `null` when it kept no row. |

| Status | Meaning |
|---|---|
| 200 | Every finding, ordered by username |
| 401 | Not authenticated |
| 403 | Not a platform admin |
| 500 | Internal error |

