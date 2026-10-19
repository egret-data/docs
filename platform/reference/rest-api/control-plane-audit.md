---
sidebar_position: 34
sidebar_label: Audit log
description: REST endpoints in the control-plane-audit group.
---

# Audit log API

Platform audit-log query (read-only, append-only store).

This page lists 1 endpoint (OpenAPI tag `control-plane-audit`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/audit` | `list_audit` |  |

## GET `/api/control-plane/audit`

Operation id: `list_audit`. Auth: Session cookie. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `actor` | query | string (uuid) | no |  |
| `action` | query | string | no |  |
| `kind` | query | string | no |  |
| `decision` | query | string | no |  |
| `workspace` | query | string (uuid) | no |  |
| `from` | query | string (date-time) | no |  |
| `to` | query | string (date-time) | no |  |
| `cursor` | query | string | no | Keyset cursor from a prior page's `nextCursor`. |
| `limit` | query | integer (int64) | no |  |

**Response 200 (application/json)**: `AuditPage`

| Field | Type | Required | Description |
|---|---|---|---|
| `entries` | AuditEntryDto[] | yes |  |
| `nextCursor` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Audit entries (newest first) |
| 401 | Not authenticated |
| 403 | Requires platform_admin |

