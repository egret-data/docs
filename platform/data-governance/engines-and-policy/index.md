---
sidebar_position: 4
---

# Engines and policy

**Governance → Engine & policy** is where data-access policy reaches the query engines. Each engine downloads one **policy profile**, a named bundle of Apache Ranger policies that egret compiles from the grants and rules you write. This page lists the engines and profiles; each engine has its own page for engine permissions, policies, overlaps, the Ranger plugin and advanced policies.

![Engine and policy: the provisioned docs-trino and the external trino-demo-ext, and four profiles without an engine](/img/platform/admin/gov-engines-index.png)

The area needs the **policy:read** permission. Writes are checked per control.

:::note
Egret is the Ranger admin for its engines. There is no separate Ranger server: the plugin inside Trino or StarRocks downloads the profile from egret and enforces it, including row filters and column masks.
:::

## The Engine & policy list

The header counts **engines**, **profiles without an engine** and **hand-written policies**. Two sections follow.

### Engines

| Column | Meaning |
|---|---|
| **Engine** | The engine name. Select it to open the engine page. |
| **Type** | Trino or StarRocks. |
| **Origin** | **Provisioned** for an engine egret runs, **External** for one you registered. |
| **Profile** | The profile the engine downloads, or *No profile* with the hint *Bind a profile in Control plane*. |
| **Plugin** | Whether the engine's plugin is up to date (**Up to date** for `docs-trino` on the demo stack). *Not judged: external*, *Not judged: not running* or *Not judged: no profile* say why egret cannot tell: an external engine is not monitored, a stopped engine cannot download, and an engine with no profile has nothing to download. |
| **Engine grants** | How many engine permissions are granted on the engine. |
| **Hand-written policies** | How many policies in the profile were written by hand in Ranger rather than compiled by egret. |

### Profiles without an engine

Profiles that no engine downloads yet, with **Profile**, **Type**, **Origin** (**Manual** for one you created, **Generated** for one provisioning created) and **Policies** columns. The profile of a deleted provisioned engine stays here, with its policies. When every profile is bound the section says *Every profile is bound to an engine.* A profile can be deleted from here: the confirmation says *The profile and every policy in it are removed. No engine downloads it.*

## Create a policy profile

Provisioned engines get their profile automatically: provisioning `docs-trino` created the Trino profile `docs-trino` and its tag service `docs-trino_tag`. For an engine you run yourself, you create the profile first.

1. Press **New profile**.
2. Enter a **Name**, for example `starrocks-prod`.
3. Choose the **Type**: **Trino** or **StarRocks**.
4. Press **Create profile**.

The profile appears under **Profiles without an engine**, with origin **Manual**. Bind it to an engine on the engine's **Settings** tab in the Control Plane (see [Register an external engine](../../control-plane/query-engines/register-external.md)).

![The unbound profile docs-external-policy with the 13 policies added by Seed default policies](/img/platform/admin/gov-profile.png)

:::warning
A profile you create here cannot be bound to a Trino engine: egret refuses with *policy profile … has no usable tag service … so every tag-based column mask and row filter would silently compile to nothing*. A Trino profile needs a tag service, which the console cannot set. Use a profile created by provisioning, or create the profile pair through the API: a profile of type `tag` and a Trino profile whose `config` names it in `tagService`.
:::

## The engine page

Select an engine to open its page. The header shows the engine name, its **Type** badge, **Provisioned** or **External**, the bound **Profile**, the **Ranger plugin** version, and **Open in Control plane**. For an external engine a note reads *egret compiles this engine's policies but cannot see whether the external engine downloads them.*

The tabs are:

| Tab | What it is for | Page |
|---|---|---|
| **Engine permissions** | Grant capabilities such as impersonating a user. | [Engine permissions](./engine-permissions.md) |
| **Policies** | Every policy in the profile, by source. | [Policies and overlaps](./policies-and-overlaps.md) |
| **Overlaps** | Mask and row-filter rules that collide. | [Policies and overlaps](./policies-and-overlaps.md#the-overlaps-tab) |
| **Plugin** | Files and settings to install the Ranger plugin. | [Ranger plugin](./ranger-plugin.md) |
| **Advanced** | Hand-written policies and default policies. | [Hand-written policies](./policy-editor.md) |
| **Migrate** | Move hand-written policies into the permission model. | [Migrate policies](./migrate.md) |

**Migrate** appears only while the profile holds a hand-written policy. An unbound profile has its own page with the frame of an engine page, but without **Engine permissions** and **Plugin**. A bound profile has no page of its own: its URL redirects to its engine.

![The Policies tab of docs-trino: 28 policies, 12 compiled by egret and 16 seeded by egret](/img/platform/admin/gov-engine-policies.png)

## Make an engine serve a catalog

Policies reach an engine only for the catalogs it serves. In **Control plane → Engines → *engine* → Catalogs**, attach the catalog (provisioned engine) or declare it (external engine). The Data page's **Engines** line then shows the engine, and the Governance overview stops reporting *catalog is attached to no engine*. See [Engine detail](../../control-plane/query-engines/engine-detail.md).

## How a change reaches the engine

1. You save a grant, rule, clearance or engine permission.
2. Egret recompiles every profile it touches, in the same transaction. A compile that fails rolls the write back.
3. The engine's plugin polls egret on an interval (30 seconds by default) and downloads the new policy set. Until then the engine enforces the previous one. The engine's **Plugin** tab shows the version each plugin last reported; confirmation takes two polls, about a minute.

On StarRocks a table change recompiles too: a create, rename, register, undrop or column change of a table that carries a classification with a clearance on the whole table recompiles the StarRocks profiles bound to its catalog, and a change whose recompile would be refused is refused at the Iceberg commit (see [Clearance](../classifications/clearance.md#on-columns-or-on-a-whole-table)). Egret also recompiles, at every start and one profile at a time, each StarRocks profile that reaches a whole-table classification with a clearance or one selected by a row-filter rule; a refusal there keeps the profile's previous compile and shows as **Profile compile failed** on the Governance overview.

Changing the profile bound to an engine recompiles both the old and the new profile. If that would leave two mask or row-filter rules deciding one column differently, egret refuses and changes nothing.

## Limits and known issues

- Egret cannot see whether an external engine downloads its profile. The Governance overview's plugin checks are *Not judged* for external engines.
- Profiles created in the console cannot be bound to Trino engines (see the warning above).

## Further reading

- [How permissions work](../concepts.md)
- [Ranger plugin](./ranger-plugin.md)
- [Control plane: Engines](../../control-plane/query-engines/index.md)
