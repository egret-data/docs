---
sidebar_position: 1
---

# Namespaces

A namespace is a dotted name that groups flows and owns two things they share: **files** and a **key-value (KV) store**. `company.team` is a child of `company`, and `company.team.eu` is a child of `company.team`. The **Namespaces** page lists them all, and each namespace has its own page.

![The Namespaces page: a tree of namespaces with counts of flows, files and KV keys](/img/platform/workflows/namespaces-list.png)

## Where namespaces come from

You do not create a namespace on its own. It appears when a flow, a namespace file or a KV key is created in it, and its parents appear with it. A parent that has nothing of its own shows a **Parent only** label.

The `namespace:` of a flow follows the rule `^[a-z0-9][a-z0-9._-]*`, 1 to 150 characters. Two segment names are reserved: a namespace may not have a segment called `_files` or `_kv`, because those names are used in storage.

## Browse the namespaces

Go to **Workflows → Namespaces**. The table is a tree: press a row's arrow to open or fold its children. With the keyboard, the arrow keys move through the rows, **Right** expands, **Left** collapses and **Enter** opens a namespace.

| Column | Meaning |
|---|---|
| **Namespace** | The segment name, nested under its parent. |
| **Flows** | Flows in this namespace. |
| **Files** | Namespace files in this namespace. |
| **KV keys** | Live KV keys in this namespace. |

The counts are for the namespace alone: *Counted in this namespace only; each child namespace counts its own.* The **Namespace** filter keeps one namespace and the namespaces below it, and the choice is kept in the address (`?prefix=`).

## A namespace's page

Press a namespace to open it. A breadcrumb (**Namespaces › docs › demo**) leads back up, and a side menu holds six tabs.

![A namespace's Overview tab with counts, recent executions and child namespaces](/img/platform/workflows/namespace-overview.png)

| Tab | What it shows |
|---|---|
| **Overview** | The counts, the most recent executions with **See all executions**, and the child namespaces. |
| **Flows** | The namespace's flows in the same list as [Flows](../flows/index.md), with search and **State**. |
| **Executions** | Runs of the namespace's flows and of the namespaces below it. |
| **Dependencies** | A graph of which flows call or trigger which. |
| **Files** | The [namespace files](./files.md). |
| **KV** | The [KV store](./kv-store.md). |

### Dependencies

The **Dependencies** tab draws every flow of the namespace as a box. A solid arrow means a flow calls another with a `Subflow` task (*Subflow: the flow calls the next*). A dashed arrow means a `Flow` trigger starts one when the other ends (*Flow trigger: the flow's end starts the next*). Use the zoom buttons, or **List view** for a table of each flow and its dependencies.

![The Dependencies tab with a Subflow edge and a Flow trigger edge](/img/platform/workflows/namespace-dependencies.png)

In the demo, `call-subflow` points to `add-numbers` with a solid arrow, and `nightly-heartbeat` points to `after-heartbeat` with a dashed arrow. The tab of `docs.demo` also draws `region-rollup` calling `daily-revenue`, two flows of the child namespace `docs.demo.sales`: the graph covers the namespace and the namespaces below it. Flows with no link are drawn as loose boxes below the linked ones.

## Variables and secrets

Kestra's namespace pages also hold namespace variables and secrets. Egret's namespace page has no such tabs. Use the flow's own `variables:` for constants, the KV store for values that change, and the workspace's [Secrets](../../control-plane/secrets.md) for credentials. `secret()` in an expression resolves only on Kestra plugin tasks; see [Expressions](../flows/expressions.md).

## Who can do what

| Action | Needs |
|---|---|
| See namespaces, files and KV keys | `workflow:read` |
| Create, edit, move or delete a file or a KV key | `workflow:manage` |

Every namespace of the workspace can be read from any flow in the workspace. A running flow can write only to its own namespace through the KV and file tasks; the purge tasks reach its own namespace and the namespaces below it.

## Limits and known issues

- The counts on the list are per namespace. A parent's row is not the total of its children.
- There are no namespace-level permissions beyond the workspace roles.

## Further reading

- [Namespace files](./files.md)
- [KV store](./kv-store.md)
- [Flows](../flows/index.md)
