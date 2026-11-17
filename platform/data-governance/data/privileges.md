---
sidebar_position: 4
---

# Privileges and ownership

A [grant](./grants.md) gives a **privilege** on an object. The privilege vocabulary has five words: **BROWSE**, **READ**, **WRITE**, **CREATE** and **MANAGE**. Every object also has one **OWNER**. This page says what each privilege means, how privileges combine and reach down the catalog tree, and which enforcement points enforce which privilege.

## The five privileges

| Privilege | What it lets the holder do |
|---|---|
| **BROWSE** | See that the object exists: its name and its metadata. It does not open the data. |
| **READ** | Read data, for example `SELECT` on a table. |
| **WRITE** | Write data: insert, update and delete rows. |
| **CREATE** | Create child objects under it, for example a table in a schema (DDL create). |
| **MANAGE** | Manage the object itself: drop and alter it, and grant or revoke access on it. This is the DDL and ownership-style right. |

Before this version a grant could name only read and write. Those two keep their meaning. **BROWSE**, **CREATE** and **MANAGE** are new, and they take effect only where someone grants them.

## How privileges combine

Three rules decide what a person can do on an object.

- **You can see what you can use.** Holding **READ**, **WRITE**, **CREATE** or **MANAGE** on an object implies **BROWSE** on that object and on each of its ancestors (its schema and its catalog). You do not grant **BROWSE** separately for the objects you can already use.
- **Grants inherit down the tree.** A grant on a catalog reaches its schemas, tables and columns. A grant on a schema reaches that schema's tables, and so on.
- **Deny wins.** A **Deny** grant on the object or on any object above it beats every allow on the path. There is no priority between grants and no exclusion of one allow by another; the only way to override a deny is to remove it.

```text
demo_warehouse                      allow READ   -> user alice
  analytics                         deny  READ   -> user alice
    sessions                        (alice cannot read: the deny on the path wins)
  sales
    orders                          (alice can read: only the catalog allow reaches it)
```

## OWNER

Every securable object (a catalog, a schema, a table, a view) has exactly one **OWNER**. By default it is the principal that created the object. The owner holds every privilege on the object and on everything below it, and ownership can be transferred to another principal.

:::note
This version introduces the owner as part of the permission model. The screen and API for setting or transferring an owner arrive in a later package, so there is nothing to configure yet.
:::

## Which enforcement points enforce what

An enforcement point is the part of the data plane that applies the compiled policies to a query. Not every one enforces every privilege. Egret does not silently grant what a point cannot enforce: it reports the privilege as **Not enforced** by that target, with a reason, in the same way it already reports a rule that no engine applies (see [Explain access](./explain-access.md#not-enforced)).

| Enforcement point | READ | WRITE | CREATE | MANAGE | BROWSE |
|---|---|---|---|---|---|
| Trino or StarRocks on Ranger | Enforced | Enforced | Enforced | Enforced | Not separately enforced |
| Trino on OPA | Enforced | Enforced | Not enforced | Not enforced | Not enforced |

- **Ranger-backed engines** enforce **READ**, **WRITE**, **CREATE** and **MANAGE**. **BROWSE** is not enforced as a separate privilege there: these engines already list an object to a user who holds some grant on it, which is the behaviour **BROWSE** describes.
- **Trino on OPA** enforces **READ** and **WRITE** only. A grant of **CREATE**, **MANAGE** or **BROWSE** is reported as **Not enforced** by that target, with the reason. It is not treated as allowed. See [Trino on OPA](../engines-and-policy/trino-on-opa.md).

:::warning
Check the **Not enforced** answer before you rely on a **CREATE** or **MANAGE** grant on a profile that runs on OPA: the grant is stored, and the engine does not apply it.
:::

## Existing grants do not change

Every existing **read** and **write** grant compiles to exactly the same engine policies as before: the output is byte-identical, so no profile changes and no engine reloads because of this version. The new privileges affect an engine only after someone grants them.

## Further reading

- [Grants](./grants.md)
- [How permissions work](../concepts.md)
- [Explain access](./explain-access.md)
