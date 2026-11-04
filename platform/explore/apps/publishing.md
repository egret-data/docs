---
sidebar_position: 3
---

# Publish and version an app

What viewers open is never your draft. It is a **version**: a frozen copy of the app's source taken when you publish. You can keep editing the draft without disturbing anyone, publish when you are ready, and go back to an earlier version when a release goes wrong.

![The Versions dialog of Revenue explorer listing v4 to v1, newest first, each with a Restore button; v4 and v3 are marked restored from an earlier version](/img/platform/apps/versions-dialog.png)

## Publish a draft

1. Open the app's editor (**⋯ → Edit**).
2. Save in the marimo editor with Ctrl+S or ⌘+S. Publishing freezes the **saved** draft, not what is on screen.
3. Press **Publish draft rev N**. You do not have to wait for the button to show the new revision: publishing first re-reads the draft revision from the server and publishes that one.

A message confirms *Published version N from draft revision R*, naming the revision that was frozen. The header badge changes from **Draft only** to **Published vN**, and the Apps list shows the same in **Status**.

The button's label is refreshed every 5 seconds and may lag behind a save you just made; that no longer matters, because **Publish** reads the current revision itself. It then publishes exactly that revision. If the draft changes between that read and the publish (a save landing at that moment, a second tab, or someone else with edit access), Egret refuses with *The draft changed while you were publishing. Save in the editor, then publish again.* and nothing is published.

A new app whose draft is still the untouched starter notebook cannot be published: Egret answers `409` with the code `starter_draft`, and the editor says *Nothing to publish yet: the draft is still the new-app starter. Change it, save (Ctrl/⌘+S), then publish.* Any change to the notebook, saved, makes it publishable.

| | |
|---|---|
| Version numbers | 1, 2, 3 … per app, never reused. |
| What is frozen | The source at that draft revision. |
| Who can publish | Anyone with `app:write` on the app. |
| What viewers get | The **latest** version. Publishing makes it live immediately. |

Publishing needs the app to be out of the trash. A trashed app is refused (`app is in the trash; restore it first`).

:::note
Publishing does not check the app's queries or run it. A published app with a broken query fails for each viewer when they open it. Open the app yourself after publishing.
:::

## Version history

Press **Versions** in the editor header. The dialog says: *Every version ever published, newest first. Restoring one publishes it again as a new version — it never moves or removes anything.*

Each row shows the version number (`v4`), when it was published and by whom (the publisher's profile name, else their email, for example `by Administrator`), *restored from v1* for a restored one, and a **Restore** button. Every editor sees the name, also one who may not list users. A shortened user id is shown only when the publisher's account no longer exists. An app that has never been published shows *Nothing has been published yet.*

The dialog follows a publish at once: a new version appears without reloading the page.

### What a version records

The REST API returns these fields for each version:

| Field | Meaning |
|---|---|
| `version_no` | The version number. |
| `from_revision` | The draft revision the version was published from. Empty for a restored version. |
| `restored_from` | For a version created by **Restore**, the version whose source it copied. |
| `published_by` and `published_at` | Who published it (a user id) and when. |
| `published_by_name` | The publisher's display name: the profile name, else the email. Empty when the user no longer exists. |

## Roll back to an earlier version

Versions are append-only, so a rollback is a new publish of old source.

1. Open **Versions**.
2. Press **Restore** on the version you want back.
3. A dialog titled *Restore vN?* asks you to confirm: *This publishes vN's source again as a brand-new version. It does not move or remove any existing version — the app's history only ever grows.* Press **Restore this version**.

![The Restore v2? confirmation over the Versions dialog, with Cancel and Restore this version](/img/platform/apps/restore-dialog.png)

A message confirms *Published version N*, where N is the next number. The walk-through app **Revenue explorer** has four versions: v1 (a table), v2 (table and chart), v3 (restored from v1) and v4 (restored from v2). The latest, v4, is what viewers get.

Restoring does not change the draft. Your draft keeps its unpublished edits.

## Opening a version

Viewers press **Open** and get the latest version. The REST API can also open a specific older version, which is useful for checking a release before restoring it: `POST /api/ws/{workspace}/apps/{id}/ticket` with `{"mode": "run", "version_id": "…"}`. The list and editor do not offer this.

## API reference

The same operations over REST, using the session cookie and CSRF header like the rest of the product:

| Call | Purpose |
|---|---|
| `GET /api/ws/{ws}/apps/{id}/draft` | The draft source and its revision. |
| `PUT /api/ws/{ws}/apps/{id}/draft` | Save the draft. Needs `If-Match: <revision>`; a stale revision answers `409`. |
| `POST /api/ws/{ws}/apps/{id}/publish` | Publish the draft. Optional body `{"expected_revision": N}`. Answers `201` with the new version, `409` when `expected_revision` is stale (with `current_revision`), when the draft is still the untouched starter (`{"code":"starter_draft"}`), or when the app is in the trash. |
| `GET /api/ws/{ws}/apps/{id}/versions` | The version list, newest first. |
| `GET /api/ws/{ws}/apps/{id}/versions/{version_id}` | One version with its source. |
| `POST /api/ws/{ws}/apps/{id}/versions/{version_id}/restore` | Publish an old version again. |

A save without `If-Match` is refused with `428` and says where the revision comes from: *If-Match with the draft revision is required: GET the draft first and send its ETag (also its `revision` field) as If-Match*.

## Limits and known issues

- Publishing without saving first publishes the last saved draft. A brand-new app whose draft is still the starter notebook is refused (`starter_draft`). The check compares the notebook with the starter as marimo saves it; a marimo upgrade that saves notebooks differently would let the editor publish the starter again until the template follows (a starter sent through the API stays refused).
- There is no unpublish. To stop viewers opening an app, move it to the Trash.

## Further reading

- [Write an app](./authoring)
- [Access and data](./access-and-data)
