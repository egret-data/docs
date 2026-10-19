---
sidebar_position: 24
sidebar_label: Policy administration
description: REST endpoints in the policy-admin group.
---

# Policy administration API

Data-governance policy console: access/masking/row-filter policy CRUD, profiles, and the principal picker.

This page lists 14 endpoints (OpenAPI tag `policy-admin`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/policies` | `list_policies` | GET /policies?service=&type=&q= — policy summaries for one profile, filtered. |
| POST | `/api/control-plane/policies` | `create_policy` | POST /policies — create an Access/Masking/Row-filter policy (by `kind`). |
| GET | `/api/control-plane/policies/resource-lookup` | `resource_lookup` | GET /policies/resource-lookup — suggestions for one resource level. |
| GET | `/api/control-plane/policies/service-def/{name}` | `get_service_def` | GET /policies/service-def/\{name\} — the def slices the editor renders from. |
| GET | `/api/control-plane/policies/services` | `list_profiles` | GET /policies/services — profiles + the engine(s) that link to each. |
| POST | `/api/control-plane/policies/services` | `create_profile` | POST /policies/services — create a policy profile (a Ranger service instance) of the given type. |
| DELETE | `/api/control-plane/policies/services/{service}` | `delete_profile` | DELETE /policies/services/\{service\} — delete a policy profile (Ranger service) and, via `ON DELETE CASCADE`, every policy under it. |
| POST | `/api/control-plane/policies/services/{service}/seed-defaults` | `seed_defaults` | POST /policies/services/\{service\}/seed-defaults — seed default "admin has all access" policies (one per Trino resource hierarchy) for a profile, mirroring Ra... |
| GET | `/api/control-plane/policies/services/{service}/trino-config` | `trino_config` | GET /policies/services/\{service\}/trino-config — the two files a Trino coordinator needs to enforce this profile via the native ranger plugin. |
| GET | `/api/control-plane/policies/{id}` | `get_policy` | GET /policies/\{id\} — the raw stored Ranger body (with id + isEnabled), for detail. |
| PUT | `/api/control-plane/policies/{id}` | `update_policy` | PUT /policies/\{id\} — replace a policy's body (any kind). |
| DELETE | `/api/control-plane/policies/{id}` | `delete_policy_handler` | DELETE /policies/\{id\} |
| PUT | `/api/control-plane/policies/{id}/enabled` | `set_policy_enabled` | PUT /policies/\{id\}/enabled — toggle a policy's enabled flag. |
| GET | `/api/control-plane/principals` | `list_principals` | GET /principals?q=&kind= — egret users + groups for the policy picker. |

## GET `/api/control-plane/policies`

Operation id: `list_policies`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /policies?service=&type=&q= — policy summaries for one profile, filtered.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | query | string | yes | Policy profile (Ranger service) name to list policies for. |
| `type` | query | string | no | Optional kind filter: `access` \| `masking` \| `rowfilter`. |
| `q` | query | string | no | Optional case-insensitive name/resource-path substring filter. |

**Response 200 (application/json)**: array of `PolicySummary`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes |  |
| `name` | string | yes |  |
| `service` | string | yes |  |
| `policy_type` | string | yes |  |
| `resource_path` | string | yes |  |
| `principals` | string[] | yes |  |
| `permissions` | string[] | yes |  |
| `is_enabled` | boolean | yes |  |
| `description` | string | yes |  |
| `labels` | string[] | yes |  |
| `managed_by` | string | yes | Who owns the row (migration 0180): `"operator"`, `"compiler"` or `"infra"`. The server refuses edits, toggles and deletes of an `"infra"` row, so the profile page withholds those controls. |

| Status | Meaning |
|---|---|
| 200 | Policy summaries for the profile, filtered |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such policy profile |
| 500 | Internal error |

## POST `/api/control-plane/policies`

Operation id: `create_policy`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:create permission.

POST /policies — create an Access/Masking/Row-filter policy (by `kind`).

Missing `kind` defaults to "access" (see `editor_to_ranger_json`), so the P2 editor form — which never sent `kind` — stays wire-compatible.

**Request body (application/json)**: `object`

**Response 200 (application/json)**: `CreatedPolicyId`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes | The created/updated policy's id. |
| `filledLevels` | string[], nullable | no | Present only when this save stored an emptied resource level as `*` (SP4d-4 Task 11): the level names, root first. |
| `note` | string, nullable | no | Present with `filledLevels`: what the fill means in Ranger — the policy now covers every child of those levels, and it moved earlier in the evaluation order of its priority band. |
| `warnings` | PolicyWriteWarning[], nullable | no | Present only when the fill moved the saved policy ahead of another same-band policy that may decide the same request. |

| Status | Meaning |
|---|---|
| 200 | Policy created. When the save stored an emptied resource level as `*`, the body adds `filledLevels`, a `note` (the broader policy is evaluated first within a priority band) and, where the fill moved this policy ahead of another same-band... |
| 400 | Invalid editor input (including a Ranger-shaped body, i.e. `policyItems`, `denyPolicyItems`, `dataMaskPolicyItems` or `rowFilterPolicyItems`, which is refused naming the keys because the form's grants are `items`; an EMPTY catalog level,... |
| 401 | Not authenticated |
| 403 | Missing policy:create permission |
| 404 | No such policy profile |
| 409 | A policy with this name already exists, the target profile is compiled by the SP4a permission model (generated) and cannot be hand-edited, or a mask/row-filter policy would form a rule overlap with another policy or compiled rule that may... |
| 500 | Internal error |

## GET `/api/control-plane/policies/resource-lookup`

Operation id: `resource_lookup`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /policies/resource-lookup — suggestions for one resource level. catalog: engine-catalog names of engines bound to the profile + values used in the service's existing policies. schema/table/column: distinct values used in the service's policies, filtered so parent levels match.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | query | string | yes | Policy profile (Ranger service) name to draw suggestions from. |
| `level` | query | string | yes | Resource level to suggest: `catalog` \| `schema` \| `table` \| `column`. |
| `catalog` | query | string | no | Parent catalog filter (for schema/table/column levels). |
| `schema` | query | string | no | Parent schema filter (for table/column levels). |
| `table` | query | string | no | Parent table filter (for the column level). |
| `q` | query | string | no | Optional case-insensitive substring filter on the suggestions. |

**Response 200 (application/json)**: array of `string`

| Status | Meaning |
|---|---|
| 200 | Suggested resource values for the given level (max 50) |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such policy profile |
| 500 | Internal error |

## GET `/api/control-plane/policies/service-def/{name}`

Operation id: `get_service_def`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /policies/service-def/\{name\} — the def slices the editor renders from. The frontend passes a SERVICE name; resolve it to its service-def (by the service's `type`). Falls back to treating `name` as a def name directly (back-compat) when no such service exists.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `name` | path | string | yes | Profile name (resolved to its service-def) or a def name directly |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | The raw Ranger service-definition the editor renders from |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such service-def |
| 500 | Internal error |

## GET `/api/control-plane/policies/services`

Operation id: `list_profiles`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /policies/services — profiles + the engine(s) that link to each.

**Response 200 (application/json)**: array of `ProfileDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `policy_version` | integer (int64) | yes |  |
| `policy_count` | integer (int64) | yes |  |
| `engines` | ProfileEngine[] | yes |  |
| `tag_service` | string, nullable | no | The classification-tag policy service this Trino profile carries its tag-based masking/row-filters in: the profile's OWN `config.tagService`, resolved to a real profile. `None` when the profile carries no link or the link names nothing —... |
| `origin` | string | yes | `"manual"` (hand-authored, fully editable) or `"generated"` (compiled by the SP4a permission model from its grants and rules). |
| `policy_counts` | PolicyCounts | yes | Policies by owner, the profile's own plus its `tag_service`'s (DG #4a Q1): `compiler` (egret-compiled), `infra` (egret-seeded), `operator` (hand-written). `policy_count` stays the profile's own total. |

| Status | Meaning |
|---|---|
| 200 | Policy profiles with their linked engines and policy counts |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

## POST `/api/control-plane/policies/services`

Operation id: `create_profile`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:create permission.

POST /policies/services — create a policy profile (a Ranger service instance) of the given type. The manual analogue of Trino provisioning's auto-bind, so a StarRocks profile can exist without an egret-provisioned engine.

`config` is stored VERBATIM except for two refusals — the type rule below, and SP4d debt Task 9's value-shape rule: a `tagService` whose value is not a non-empty string names no profile, and four of the five readers of that field go through `as_str()` while the fifth reads `->>`, so the shape produces four different behaviours. See `egret_policy::store`'s `refuse_unnameable_tag_service`.

**Request body (application/json)**: `CreateProfileBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Ranger service (profile) name. |
| `type` | string | yes | Ranger service type: `"trino"` or `"starrocks"`. |
| `config` | object | no | Optional service config (e.g. StarRocks JDBC coordinates). Stored verbatim. |

**Response 200 (application/json)**: `CreatedProfile`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Profile created |
| 400 | Invalid type (must be `trino`, `starrocks` or `tag`), missing name, a `tagService` that names a profile that is missing or not of type `tag`, a `tagService` in `config` on a profile whose type is not `trino` (its service-def has no `schema`... |
| 401 | Not authenticated |
| 403 | Missing policy:create permission |
| 409 | A profile with this name already exists |
| 500 | Internal error |

## DELETE `/api/control-plane/policies/services/{service}`

Operation id: `delete_profile`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:delete permission.

DELETE /policies/services/\{service\} — delete a policy profile (Ranger service) and, via `ON DELETE CASCADE`, every policy under it.

GUARD: refused (409) while an engine still enforces the profile — deleting it out from under a bound engine would silently strip that engine's access control. The admin must unbind (or delete) the engine first. A paired tag service (`&lt;name>_tag`), if any, is a separate profile and is deleted on its own.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | path | string | yes | Policy profile (Ranger service) name |

| Status | Meaning |
|---|---|
| 204 | Profile deleted |
| 401 | Not authenticated |
| 403 | Missing policy:delete permission |
| 404 | No such policy profile |
| 409 | Profile is still enforced by an engine, or is compiled by the SP4a permission model (generated) and cannot be deleted through the editor |
| 500 | Internal error |

## POST `/api/control-plane/policies/services/{service}/seed-defaults`

Operation id: `seed_defaults`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:seed permission.

POST /policies/services/\{service\}/seed-defaults — seed default "admin has all access" policies (one per Trino resource hierarchy) for a profile, mirroring Ranger's default-policy-on-service-create behavior. Idempotent: a no-op (created: 0) if the service already has any policy.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | path | string | yes | Policy profile (Ranger service) name |

**Response 200 (application/json)**: `SeedResult`

| Field | Type | Required | Description |
|---|---|---|---|
| `created` | integer (int64) | yes | How many default policies were created (0 if the profile already had any). |

| Status | Meaning |
|---|---|
| 200 | Number of default policies created (0 if the profile already had policies) |
| 400 | The profile is not of type trino; the default set is Trino-shaped and its engine would reject it. Nothing is written |
| 401 | Not authenticated |
| 403 | Missing policy:seed permission |
| 404 | No such policy profile |
| 409 | The profile is compiled by the SP4a permission model (generated) and cannot be hand-edited |
| 500 | Internal error |

## GET `/api/control-plane/policies/services/{service}/trino-config`

Operation id: `trino_config`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /policies/services/\{service\}/trino-config — the two files a Trino coordinator needs to enforce this profile via the native ranger plugin.

Rendered by `egret_engine_mgmt_api::ranger_config::ranger_plugin_files`, the same code that writes the files egret mounts into its own engines.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | path | string | yes | Policy profile (Ranger service) name |

**Response 200 (application/json)**: array of `ConfigFile`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `content` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The Trino coordinator config files for this profile's native ranger plugin, from the same renderer that writes the files egret mounts into its own engines (`access-control.properties` and `ranger-trino-security.xml`). Since SP4d-4 the... |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such policy profile |
| 500 | Internal error |

## GET `/api/control-plane/policies/{id}`

Operation id: `get_policy`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /policies/\{id\} — the raw stored Ranger body (with id + isEnabled), for detail.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | integer (int64) | yes | Policy id |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | The raw stored Ranger policy body (with id + isEnabled) |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 404 | No such policy |
| 500 | Internal error |

## PUT `/api/control-plane/policies/{id}`

Operation id: `update_policy`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

PUT /policies/\{id\} — replace a policy's body (any kind).

# SP4d debt Task 16: the tag branch

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | integer (int64) | yes | Policy id |

**Request body (application/json)**: `object`

**Response 200 (application/json)**: `CreatedPolicyId`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes | The created/updated policy's id. |
| `filledLevels` | string[], nullable | no | Present only when this save stored an emptied resource level as `*` (SP4d-4 Task 11): the level names, root first. |
| `note` | string, nullable | no | Present with `filledLevels`: what the fill means in Ranger — the policy now covers every child of those levels, and it moved earlier in the evaluation order of its priority band. |
| `warnings` | PolicyWriteWarning[], nullable | no | Present only when the fill moved the saved policy ahead of another same-band policy that may decide the same request. |

| Status | Meaning |
|---|---|
| 200 | Policy replaced. Same optional `filledLevels` / `note` / `warnings` as create |
| 400 | Invalid editor input (including a Ranger-shaped body, i.e. `policyItems`, `denyPolicyItems`, `dataMaskPolicyItems` or `rowFilterPolicyItems`, which is refused naming the keys because the form's grants are `items`; an EMPTY catalog level,... |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such policy |
| 409 | The policy's profile is compiled by the SP4a permission model (generated) and cannot be hand-edited, or the mask/row-filter body would form a rule overlap with another policy or compiled rule that may decide the same request with different... |
| 500 | Internal error |

## DELETE `/api/control-plane/policies/{id}`

Operation id: `delete_policy_handler`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:delete permission.

DELETE /policies/\{id\}

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | integer (int64) | yes | Policy id |

| Status | Meaning |
|---|---|
| 204 | Policy deleted |
| 401 | Not authenticated |
| 403 | Missing policy:delete permission |
| 404 | No such policy |
| 409 | The policy's profile is compiled by the SP4a permission model (generated) and cannot be hand-edited, or the change is a data mask on a StarRocks profile and the profile cannot be recompiled with it (its classification masks fold the... |
| 500 | Internal error |

## PUT `/api/control-plane/policies/{id}/enabled`

Operation id: `set_policy_enabled`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing policy:update permission.

PUT /policies/\{id\}/enabled — toggle a policy's enabled flag.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | integer (int64) | yes | Policy id |

**Request body (application/json)**: `EnabledBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 204 | Policy enabled flag updated |
| 401 | Not authenticated |
| 403 | Missing policy:update permission |
| 404 | No such policy |
| 409 | The policy's profile is compiled by the SP4a permission model (generated) and cannot be hand-edited, or the change is a data mask on a StarRocks profile and the profile cannot be recompiled with it (its classification masks fold the... |
| 500 | Internal error |

## GET `/api/control-plane/principals`

Operation id: `list_principals`. Auth: Session cookie. Forbidden (403): Missing policy:read permission.

GET /principals?q=&kind= — egret users + groups for the policy picker.

Correctness note: `name` is the user's `email`, kept for the raw-JSON Ranger policy editor, which deliberately writes emails. A `user` principal's `username` field carries its allocated `users.username` when one exists — the engine-visible identity — so a caller that needs the engine-native `ref` (e.g. the permission-UI's `PrincipalPicker`) should read `username`, not derive one from `name`. If a deployment's Trino/Ranger group-mapping keys identities on something else entirely, an admin can still free-type a value directly in the raw-JSON editor.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `q` | query | string | no | Optional case-insensitive substring filter on name/label. |
| `kind` | query | string | no | Optional kind filter: `user` \| `group`. |

**Response 200 (application/json)**: array of `Principal`

| Field | Type | Required | Description |
|---|---|---|---|
| `kind` | string | yes |  |
| `name` | string | yes | The value written into the raw-JSON Ranger policy editor (user email / group name). Deliberately unchanged by `username` below — that editor surface is Ranger-native and an email can be the right value there. |
| `label` | string | yes | Display label. |
| `username` | string, nullable | no | The user's allocated bare username (`users.username`, minted by [`egret_auth::users::UserRepo::ensure_username`]) — this is the value the engine actually sees (SP4a D7 measured `current_user` as `admin`, never `admin@egret.local`). `None`... |

| Status | Meaning |
|---|---|
| 200 | egret users + groups for the policy principal picker (max 50) |
| 401 | Not authenticated |
| 403 | Missing policy:read permission |
| 500 | Internal error |

