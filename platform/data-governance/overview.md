---
sidebar_position: 1
---

# Governance overview

**Governance → Overview** is the landing page of the Governance area. It answers two questions: what needs attention in the way data access is set up, and what changed recently.

The page needs the **policy:read** or **tag:read** permission. Platform admins have both. A person who holds only some of the permissions sees only the checks and counts those permissions allow.

## The header counts

The strip under the title counts four things:

| Count | What it counts |
|---|---|
| **catalogs** | Catalogs registered in the platform, whether egret manages them or not. |
| **egret grants** | Grants written in the permission model (see [Grants](./data/grants.md)). Grants created by workspace assignment are included. |
| **egret rules** | Mask and row-filter rules (see [Masks and row filters](./data/masks-and-filters.md)). |
| **classifications** | Classification tags (see [Classifications](./classifications/index.md)). |

A count you are not allowed to read is returned as "no value" by the API, never as `0`.

## Needs attention

**Needs attention** lists findings from a fixed set of checks. Each finding has a severity (**Critical**, **Warning** or **Info**), a one-sentence description, a count and, when it helps, an **Open** link to the object concerned. A finding keeps the true total even when the list shows only a handful of examples. The list is sorted by severity, then by kind.

The checks the server runs are:

| Check | What it looks for |
|---|---|
| Unresolved principal references | A grant or rule exemption names a user, group or role egret does not know, so it cannot match anyone (see [Unmatched names](./people-and-groups/index.md)). |
| Plugin silent, behind or quiet | An engine's Ranger plugin has not downloaded the policy profile, downloaded an older version of it, or has been quiet for longer than expected. |
| Profile compile failed | The last compile of a policy profile failed. Engines keep the previous compile. |
| Engine failed | A provisioned engine reports a failed status. |
| Rule overlaps | Two mask or row-filter rules decide the same column or table with the same priority (see [Policies and overlaps](./engines-and-policy/policies-and-overlaps.md)). |
| View lineage failed | The view lineage that drives view exposure could not be read. |
| Catalog attachments failed | A catalog could not be applied to an engine it is attached to. |
| Policy warnings | Hand-written policies carry things egret warns about. |
| Plugin version not modelled | An engine runs a Ranger plugin version egret cannot prove migrations or explanations for. |
| Classifications without clearance | Tags that gate nothing (**Info**). |
| Catalogs attached to no engine | No engine serves the catalog (**Info**). |

On the demo stack, with the engine `docs-trino` serving `demo_warehouse`, the list held two findings:

- **Warning**: *egret could not compute the lineage of 1 view, so the tables it reads are not known.*, with the view and the engine's answer: `demo_warehouse.analytics.revenue_by_country — engine docs-trino: engine: Access Denied: Cannot access catalog demo_warehouse`. Egret reads view definitions through the engine as its lineage reader. That answer came from a Docker engine before platform #728, when the engine's plugin was not recognised and so did not receive the reader's access; see [Lineage](./lineage.md#how-egret-computes-lineage) for which engines do.
- **Info**: *3 classifications have no clearance: they gate nothing.*, listing the tags.

Before an engine serves a catalog, the finding is that the catalog is attached to no engine. When everything is in order the list reads *Nothing needs attention.*

A **Not checked here** line names what the page does not check: views that may expose classified data through `DEFINER`, and classification coverage. It appears for platform admins too. Those two are covered on the [View exposure](./classifications/view-exposure.md) page. When your permissions do not allow one of the checks above, it is added to that line.

:::note
Each check needs its own permissions: engine drift checks need **policy:read** and **engine:read**, the catalog attachment check needs **catalog_registry:read**, and so on. A check you cannot run is listed as not checked, not silently dropped.
:::

## Recent changes

**Recent changes** lists governance changes as they are recorded, newest first, with the columns **When**, **Who** and **What**, and a **View** link that opens the object concerned. The text describes each change in a sentence, for example *Administrator created a grant: allow read on demo_warehouse.finance to group finance-analysts, group data-team*, *Administrator set the clearance of classification Confidential: roles data_steward; groups none*, *Administrator created an engine grant: trino.set_system_session_property (query_max_run_time) on engine docs-trino to user member-sso* or *Administrator migrated legacy: analysts read finance_pg of profile docs-legacy-trino into egret grants and rules*. The link column reads **View**, or *(deleted)* when the object no longer exists.

The list is paged: use the button at the bottom to load older changes. Under the list a note says *The oldest change you can see is from \<date\>*, and that changes older than 90 days are pruned. A second note warns that role assignments and catalog tags are recorded after they commit and can be missing if the audit writer was overloaded. Recording began when this version of egret was installed, so a fresh instance shows *No governance change has been recorded yet*.

A change made by an administrator acting as another user is shown as "Admin as User". A change by a deleted user is shown as *A deleted user*, and a change made by the platform itself, for example a recompile, as *egret*.

![The Governance overview on the demo stack: two findings and the most recent governance changes](/img/platform/admin/gov-overview.png)

## The Governance sidebar

| Section | Page | Use it to |
|---|---|---|
| Governance overview | **Overview** | See posture and recent changes (this page). |
| Data | **Data** | Browse catalogs and see who can read an object. See [Data](./data/index.md). |
| People & groups | **People & groups** | See what reaches each person, group or role. See [People & groups](./people-and-groups/index.md). |
| Classification | **Classifications** | Define tags and clearances. See [Classifications](./classifications/index.md). |
| Lineage | **Data Lineage** | A placeholder. See [Lineage](./lineage.md). |
| Engine & policy | **Engine & policy** | Bind policy profiles to engines and manage engine permissions. See [Engines and policy](./engines-and-policy/index.md). |

If you are new to the area, read [How permissions work](./concepts.md) first.

## Further reading

- [How permissions work](./concepts.md)
- [Control plane audit log](../control-plane/audit-log.md)
