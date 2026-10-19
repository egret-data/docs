---
sidebar_position: 3
---

# Publish and version an app

What viewers open is never your draft. It is a **version**: a frozen copy of the app's source taken when you publish. You can keep editing the draft without disturbing anyone, publish when you are ready, and go back to an earlier version when a release goes wrong.

![The Versions dialog listing v2 and v1, each with a Restore button](/img/platform/apps/versions-dialog.png)

## Publish a draft

1. Open the app's editor (**⋯ → Edit**).
2. Save in the marimo editor with Ctrl+S or ⌘+S. Publishing freezes the **saved** draft, not what is on screen.
3. Press **Publish draft rev N**, where N is the draft's revision shown in the header.

A message confirms *Published version N*. The header badge changes from **Draft only** to **Published vN**, and the Apps list shows the same in **Status**.

The button publishes the revision it shows. If the draft has changed since the page loaded (a second tab, or someone else with edit access), Egret refuses with *The draft changed while you were publishing. Save in the editor, then publish again.* and nothing is published.

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

Each row shows the version number (`v2`), when it was published and by whom, and a **Restore** button. A new app that has never been published shows *Nothing has been published yet.*

### What a version records

| Field | Meaning |
|---|---|
| `version_no` | The version number. |
| `from_revision` | The draft revision the version was published from. Empty for a restored version. |
| `restored_from` | For a version created by **Restore**, the version whose source it copied. |
| `published_by` and `published_at` | Who published it and when. |

## Roll back to an earlier version

Versions are append-only, so a rollback is a new publish of old source.

1. Open **Versions**.
2. Press **Restore** on the version you want back.
3. A dialog titled *Restore vN?* asks you to confirm. It says *This publishes vN's source again as a brand-new version. It does not move or remove any existing version — the app's history only ever grows.* Press **Restore this version**.

A message confirms *Published version N*, where N is the next number. In the walk-through, restoring v1 of **Revenue explorer** created v3 (`restored_from` v1), and restoring v2 afterwards created v4. The latest version, v4, is what viewers get.

Restoring does not change the draft. Your draft keeps its unpublished edits.

## Opening a version

Viewers press **Open** and get the latest version. The REST API can also open a specific older version, which is useful for checking a release before restoring it: `POST /api/ws/{workspace}/apps/{id}/ticket` with `{"mode": "run", "version_id": "…"}`. The list and editor do not offer this.

## API reference

The same operations over REST, using the session cookie and CSRF header like the rest of the product:

| Call | Purpose |
|---|---|
| `GET /api/ws/{ws}/apps/{id}/draft` | The draft source and its revision. |
| `PUT /api/ws/{ws}/apps/{id}/draft` | Save the draft. Needs `If-Match: <revision>`; a stale revision answers `409`. |
| `POST /api/ws/{ws}/apps/{id}/publish` | Publish the draft. Optional body `{"expected_revision": N}`. Answers `201` with the new version. |
| `GET /api/ws/{ws}/apps/{id}/versions` | The version list, newest first. |
| `GET /api/ws/{ws}/apps/{id}/versions/{version_id}` | One version with its source. |
| `POST /api/ws/{ws}/apps/{id}/versions/{version_id}/restore` | Publish an old version again. |

A save without `If-Match` is refused: `If-Match with the draft revision is required`.

## Limits and known issues

- Publishing without saving first publishes the last saved draft. A brand-new app published straight away publishes the starter notebook.
- There is no unpublish. To stop viewers opening an app, move it to the Trash.

## Further reading

- [Write an app](./authoring)
- [Access and data](./access-and-data)
