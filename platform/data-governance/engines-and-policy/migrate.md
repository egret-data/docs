---
sidebar_position: 4
---

# Migrate policies

The **Migrate** tab moves hand-written Ranger policies into egret's permission model: grants and rules that egret compiles and manages. It appears on an engine page only while the profile holds a hand-written policy. It is built to be safe: every migration is proved equivalent before it is written, and each migrated policy can be undone.

Previewing, migrating and undoing all need **policy:update**. A reader sees the list but no controls.

![The Migrate tab of trino-demo-ext: one migratable policy selected and a preview that proved it equivalent](/img/platform/admin/gov-engine-migrate.png)

## Why migrate

A hand-written policy is outside egret's model. The Data and People pages cannot show it, explain marks it *Outside the permission model*, and egret does not check it for overlaps. Once migrated, the same access is a grant or rule you can edit from the Governance pages, and egret recompiles it with everything else.

## The policy list

The tab lists every policy in the profile with:

| Column | Meaning |
|---|---|
| **Policy** | The policy name. *Switched off* appears under a disabled one. |
| **Owner** | Who owns the policy: **operator** for a hand-written one, **compiler** for one egret compiled. |
| **Verdict** | **Migratable**, **Migrated**, **Locked** or **Blocked**. |
| **Why** | The server's sentence explaining the verdict. |

The tab opens with *Profile \<profile\>: who owns each policy, whether it can move into the permission model, and a proof before it does.* A summary counts the **policies** and how many are **migratable**, **migrated**, **locked** and **blocked**. An empty profile shows *No policies in this profile* with *There is nothing to migrate: this profile holds no policies.* **Search policies…** filters the list.

| Verdict | Meaning |
|---|---|
| **Migratable** | Egret can express the policy as grants and rules. You can select it. |
| **Migrated** | Already migrated. The original is switched off and a generated grant or rule replaces it. **Undo migration** reverses it. |
| **Locked** | Cannot be selected; the **Why** column says why. |
| **Blocked** | Egret cannot express the policy in the model. The *Why* column says what stops it. |

Every sentence explaining a verdict, a blocker, a disagreement or a refusal comes from the server verbatim, so the screen never tells you something different from what the server enforces.

## Migration status of the enforcement point

Above the list the tab shows a status badge for the enforcement point. It counts only operator policies, the hand-written ones; policies egret compiled are not part of it.

| Badge | Meaning |
|---|---|
| **Migration complete — every manual policy is in the model** | No operator policy remains un-migrated on this enforcement point. |
| **N to migrate** | N operator policies can be migrated but have not been yet. |
| **M blocked** | M operator policies cannot be migrated at all. Each is listed with its name and the reason. |

A blocked policy keeps the enforcement point **incomplete** until you remove it or rewrite it so that it can be migrated. Migrating the other policies does not complete the enforcement point while one is still blocked.

The badge above counts **operator policies only**. It is one input to a wider verdict.

## The per-enforcement-point migration gate

Beyond the operator-policy badge, egret computes a full **migration-complete** verdict for each enforcement point and records it on **every compile**. An enforcement point is migration-complete only when **all** of the following hold:

1. **No operator policy is pending or blocked** — the completeness above.
2. **No `role` principal remains** on its grants, rule exemptions or engine grants — they have been migrated to managed `role:<name> holders` groups (SP3c-1).
3. **No implicit workspace-assignment grant remains** — they have been migrated to explicit grants on managed `ws:<slug> members` groups (SP3c-3).
4. **Every gated clearance has a `withhold` rule** — groups-only clearance is enforced on engines (SP3c-2). This condition is installation-wide, not per-catalog.

The verdict is **read-only and never changes enforcement**: while an enforcement point is incomplete the current model keeps enforcing exactly as before. The verdict is a status signal for the planned per-enforcement-point switch to the model — not a switch, and not a live engine check.

Read one enforcement point's verdict at `GET /api/control-plane/perm/policies/services/{id}/migration-gate` (requires **policy:read**); it returns `complete` and, when false, the list of reasons. The **Governance Overview** counts the enforcement points whose last compile was incomplete (`migrationIncomplete`).

A dedicated badge for the full verdict, the switch itself and the live engine checks are planned follow-ups.

## Migrate policies

1. Tick the migratable policies you want. The line below the table reads *Selected: …* or *No policy selected.*
2. Press **Preview migration**. Egret runs a dry-run migration and compares the engine's decisions before and after on a set of probe requests.
3. Read the result. A proved migration says *Proved equivalent: N probe evaluations agreed on every affected profile. Nothing has been written yet.*
4. Read **Before you migrate** (notices), the profiles it changes and, if any, **Disagreements**.
5. Press **Migrate**. There is no further confirmation. The page says *The migration is written. See it in Recent changes*; the policy's verdict becomes **Migrated**, and the compiled policy that replaces it is listed as **Locked** with the owner **compiler**.

**Migrate** is enabled only by a proved, current preview of the exact selection. Otherwise the reason is shown:

- *Select at least one migratable policy, then preview it.*
- *Preview the current selection before migrating.*
- *The selection changed since that preview — preview it again before migrating.*
- *The preview was refused, so this selection cannot be migrated.*
- *The preview did not prove this migration, so it cannot be migrated.*

### The profiles a migration changes

A grant compiles into every profile that serves its catalog, and a tag rule into every profile sharing the tag service, so a migration can change more than the profile on screen. The preview lists them under *This migration changes N profile(s)* with the columns **Profile**, **Plugin versions**, **Probes**, **Disagreements**, **Now serves** and **No longer serves**; profiles other than the current one are marked **Also changed**. **Policies and what they become** sums it up, for example *legacy: analysts read finance_pg: 1 grant, 0 rules*.

### Disagreements

A disagreement is a probe request the engine would answer differently after the migration, per plugin version and access type. **Migrate** stays disabled unless the preview proves equivalence. Leave such a policy hand-written.

### Example

On the demo stack the external engine `trino-demo-ext` downloads the profile `docs-legacy-trino`, which holds the hand-written policy `legacy: analysts read finance_pg` (user `member-sso`, `select` on `finance_pg.*.*.*`).

- With the permissions `select`, `use` and `show`, the policy was **Blocked**: *Access type `use` has no equivalent in egret's permission model on this engine: egret grants only read and write, each a fixed set of Ranger access types, and spelling is matched exactly (`SELECT` is not `select`). Remove `use` from the policy, or keep the policy hand-written.*
- With `select` only it was **Migratable**: *Becomes 1 grant and 0 rules.* The preview said *Proved equivalent: 1575 probe evaluations agreed on every affected profile. Nothing has been written yet.*, with *This migration changes 1 profile* (`docs-legacy-trino`, Ranger 2.8.0, *1575 of 1875 without pruning* probes, 0 disagreements).
- After **Migrate** the row said *This policy was migrated into egret's permission model on … by admin@egret.local (1 grant(s), 0 rule(s), proved on 1575 probe evaluations) and switched off; the model now enforces what it did.*

The same policy on the catalog `tpch_bench` could not be proved: `tpch_bench` is also served by the provisioned engine `docs-trino`, so the proof had to cover both profiles, and the preview said *The gate could not prove this migration. Nothing was written. proving this migration needs 48735 probe evaluations across 2 profile(s), 2697570 units of work …, over the limit of 1300000.* A grant compiles into every profile that serves its catalog, so a hand-written policy on a widely served catalog may be too large to prove.

## Undo a migration

On a migrated policy press **Undo**. The dialog *Undo the migration of “\<policy\>”?* says *This deletes the grants and rules the migration created and switches the original policy back on. It is refused if any of them has been edited since.* Press **Undo migration**. The page then says, for example, *Undid “legacy: analysts read finance_pg”: deleted 1 grant and 0 rules, and switched the original back on.* Every profile the migration recompiled stays compiled by egret, so no new hand-written policy can be created in it.

If the profiles changed since the preview, a migration reports *Migrating found that the profiles changed since the preview* and writes nothing.

## Limits and known issues

- Migration is proven for Trino with plugin 2.5.0 or 2.8.0 and StarRocks with 2.8.0 or 2.9.0. For another plugin version the tab refuses.
- A policy naming a group or role in a way the model cannot express is **Blocked**.
- A policy that names a tag egret has no tag for is **Blocked**: the migration never creates tags. Create a tag whose key and name are both the policy's tag, or keep the policy hand-written (KI-326).
- A hand-written masking policy that names no `column` level, or stops higher, masks nothing on Trino or StarRocks and is **Blocked**. To mask every column below its path, set the missing levels to `*` in the policy editor; that takes effect at once, and the policy can then be migrated. A policy with a gap (for example, a catalog and a table but no schema) is told to name the missing level, or to set only that level to `*`.
- A hand-written tag access policy is **Blocked** and never becomes a clearance; recreate it as a classification clearance (KI-327).
- Policies egret's own plumbing writes (engine delegation, admin access, query limits and the policies **Seed default policies** adds) are **Locked** and are not rewritten (KI-328).

## Further reading

- [Hand-written policies](./policy-editor.md)
- [Policies and overlaps](./policies-and-overlaps.md)
