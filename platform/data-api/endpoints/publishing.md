---
sidebar_position: 8
---

# Publishing, versions and rollback

Consumers never see your draft. They see a **version**: a frozen snapshot of the endpoint's contract (SQL, parameters, response settings, cache, limits and rate limit) taken when you press **Publish**. You can edit the draft as much as you like without affecting anyone, and go back to an earlier version in one click.

![The Versions tab of Orders by status: v2 Live with a 1 breaking change badge beside its note, and v1 with Roll back](/img/platform/data-api/endpoint-versions.png)

## Publish an endpoint

1. Open the endpoint and make sure there are no unsaved changes. **Save** first; Publish is disabled while changes are unsaved.
2. Go to the **Versions** tab and press **Publish saved draft**.
3. Read the dialog. It checks what the publish changes for anyone already calling the endpoint.
4. Optionally write a **Note** describing the change, and press **Publish**.

A message confirms *Published vN*, and the header badge becomes **Live · vN**. The new version answers every call from that moment. The first publish of an endpoint reads *Nothing is serving this endpoint yet, so there is nothing to break.*

Publishing validates the draft first, with the same checks as **Validate saved draft** on the **Config** tab: one read-only `SELECT`, every `{{ name }}` declared, parameters bound safely, columns described by the engine. A refusal is shown in the dialog in red.

:::note
Publishing does not grant data access. A call runs as the service account against the workspace connection, so an administrator must also grant that account the underlying tables in the engine, or the contract has nothing to serve.
:::

## Versions

The **Versions** tab, **History** table, lists every version, newest first.

| Column | What it shows |
|---|---|
| **Version** | `v1`, `v2` …, with a **Live** badge on the one being served. A version published with breaking changes shows a badge such as **1 breaking change** (hover for the detail). A version compared against something other than its predecessor is marked *compared against vN*. |
| **Note** | The note you wrote when publishing. |
| **Who** | Who published it: the email for a user who may list the platform's users (a platform administrator), a shortened user id for anyone else (KI-296). |
| **When** | When, as a relative time. |
| Action | **Roll back** on every version except the live one. |

Version numbers are per endpoint and never reused.

## Breaking changes

A change is **breaking** when a consumer built against the live version could stop working. Before you publish, the dialog compares the draft with the live version.

![The Publish dialog for Top customers: column spend of statement main is gone, and Publish stays disabled until the acknowledgement is ticked](/img/platform/data-api/publish-dialog-breaking.png)

Examples Egret classifies as breaking, each with its own message:

| Change | Message |
|---|---|
| A column is dropped or renamed | `column spend of statement main — declared double and is gone` |
| The method or path changes | `the endpoint's path: /x/probe becomes /orders/lookup` |
| **Shape**, **Naming** or **Envelope** change | `objects becomes arrays: every row changes between a JSON object and a positional array` |

Adding a column and editing a statement's SQL without changing its columns are *safe* changes. The dialog says how many safe changes it found, or *Nothing a caller can see changes.*

When there are breaking changes the dialog lists them in red under *This breaks callers of the version being served (vN)* and the **Publish** button stays disabled until you tick *I have read this change and accept that deployed callers will break.*

Under the hood the acknowledgement is a token that `POST …/validate` issues for exactly those changes. A publish that breaks callers without it is refused (`409 conflict`) with the list of changes. The token cannot be reused: it is derived from the changes and the version currently live, so one issued for yesterday's change does not fit today's. A publish that breaks nothing and sends a token is refused too.

The version row keeps the record. **1 breaking change** on `v2` of the walk-through endpoint *Orders by status* shows that someone acknowledged the removal of the `orders` column.

### A new method or path

A new method or path takes effect when you publish, not when you save it. Until then the endpoint is served on its live URL, which the generated OpenAPI document and **Try it** use too. On publish the new URL starts serving and the old one answers `404 not_found`. There is no redirect, so tell your callers before you publish.

Only one endpoint can be served at a URL. An endpoint keeps its published URL until it is published again, even when its draft has moved on. Publishing a second endpoint at that URL is refused with `409 conflict`: *another endpoint in this workspace is served at GET /x; an endpoint keeps its published URL until it is published again, so choose another path or publish the move of the endpoint that holds it first*. A disabled or trashed endpoint keeps its claim on its URL.

## Roll back

Rolling back makes an earlier version the live one again. Consumers calling the endpoint's URL immediately receive that version's frozen contract.

1. Open **Versions**.
2. Press **Roll back** on the version you want back.
3. Type `rollback` to confirm and press **Roll back**. The dialog says *Every deployed client calling this endpoint's URL will immediately start receiving this version's frozen contract instead of the current live one. This does not delete anything — publish again to move forward once you're ready.*

![The Roll back to v1? dialog with rollback typed and the red Roll back button enabled](/img/platform/data-api/rollback-dialog.png)

A message confirms *Rolled back to vN*. Nothing is deleted. The draft is untouched, so the header may read **Live · v1 · unpublished changes** when the draft is ahead of the version being served.

Rollback re-checks the rules whose inputs are live now, such as whether the connection is governed, and refuses if the old version could not be served safely today.

The rolled-back version is served at the URL it was published at. If its method or path differs from the current one, callers must switch URLs. A rollback is refused with `409 conflict` when another endpoint is now served at that URL.

## Pin a consumer to a version

A consumer that wants to keep calling a specific version while you publish others can send the `X-Egret-Version` header with the version number:

```bash
curl -s "$BASE/data-api/v1/default/orders/by-status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Egret-Version: 1"
```

In the walk-through, with `v2` live, this returned the `v1` contract (`orders` instead of `order_count`), and `meta.version` was `1`. A pin chooses which frozen **contract** answers; the grant, the endpoint's state and the rate limit are still evaluated live. A version that was never published, or one above the live version (a rollback moved consumers off it), answers `409 version_unavailable`. A value that is not a single positive integer answers `400 version_pin_invalid`.

## Disable, enable and delete

| Action | Where | Effect |
|---|---|---|
| **Disable** | Row menu in the Endpoints list | The endpoint stops serving (`404 not_found`) but keeps its live version and grants. |
| **Enable** | Row menu, on a disabled endpoint | Serves the version it had, with no new publish and no new check. Unavailable for an endpoint never published. |
| **Move to Trash** | Row menu | Only for a disabled or draft endpoint. A live one is refused: *endpoint is live and cannot be moved to the trash; disable it first*. |
| **Restore** | In **Trash** | The endpoint comes back **disabled**. |
| **Delete permanently** | In **Trash** | Removes the endpoint and its versions. Cannot be undone. |

An endpoint in the trash cannot be edited, published, rolled back, enabled or disabled, and its editor is read-only.

## Limits and known issues

- The **Roll back** button needs the endpoint to be out of the trash.
- A draft can be saved at a URL that another endpoint still serves; only its publish is refused.

## Further reading

- [Response shape](./response)
- [Cache, limits and rate limits](./config)
- [Call an endpoint with curl](../calling-endpoints)
