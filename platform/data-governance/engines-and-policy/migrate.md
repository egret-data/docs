---
sidebar_position: 4
---

# Migrate policies

The **Migrate** tab moves hand-written Ranger policies into egret's permission model: grants and rules that egret compiles and manages. It appears on an engine page only while the profile holds a hand-written policy. It is built to be safe: every migration is proved equivalent before it is written, and each migrated policy can be undone.

Previewing, migrating and undoing all need **policy:update**. A reader sees the list but no controls.

:::note
This page describes the screen from the product source. It was not run on the demo instance, because the demo profile holds no hand-written policy.
:::

## Why migrate

A hand-written policy is outside egret's model. The Data and People pages cannot show it, explain marks it *Outside the permission model*, and egret does not check it for overlaps. Once migrated, the same access is a grant or rule you can edit from the Governance pages, and egret recompiles it with everything else.

## The policy list

The tab lists every policy in the profile with:

| Column | Meaning |
|---|---|
| **Policy** | The policy name. *Switched off* appears under a disabled one. |
| **Owner** | What the policy is: who owns it. |
| **Verdict** | **Migratable**, **Migrated**, **Locked** or **Blocked**. |
| **Why** | The server's sentence explaining the verdict. |

A summary counts how many policies are migratable, migrated, locked and blocked. An empty profile shows *No policies in this profile* with *There is nothing to migrate: this profile holds no policies.* **Search policies…** filters the list.

| Verdict | Meaning |
|---|---|
| **Migratable** | Egret can express the policy as grants and rules. You can select it. |
| **Migrated** | Already migrated. The original is switched off and a generated grant or rule replaces it. **Undo migration** reverses it. |
| **Locked** | Cannot be selected; the **Why** column says why. |
| **Blocked** | Egret cannot express the policy in the model. The *Why* column says what stops it. |

Every sentence explaining a verdict, a blocker, a disagreement or a refusal comes from the server verbatim, so the screen never tells you something different from what the server enforces.

## Migrate policies

1. Tick the migratable policies you want. The line below the table reads *Selected: …* or *No policy selected.*
2. Press **Preview**. Egret runs a dry-run migration and compares the engine's decisions before and after on a set of probe requests.
3. Read the result. A proved migration says *Proved equivalent: N probe evaluations agreed on every affected profile. Nothing has been written yet.*
4. Read **Before you migrate** (notices), **Affected profiles** and, if any, **Disagreements**.
5. Press **Migrate**. The migration is written, and appears under **Recent changes** on the Governance overview.

**Migrate** is enabled only by a proved, current preview of the exact selection. Otherwise the reason is shown:

- *Select at least one migratable policy, then preview it.*
- *Preview the current selection before migrating.*
- *The selection changed since that preview — preview it again before migrating.*
- *The preview was refused, so this selection cannot be migrated.*
- *The preview did not prove this migration, so it cannot be migrated.*

### Affected profiles

A grant compiles into every profile that serves its catalog, and a tag rule into every profile sharing the tag service, so a migration can change more than the profile on screen. **Affected profiles** lists each one with its **Plugin versions**, its **Disagreements** count and what it **No longer serves**; profiles other than the current one are marked **Also changed**.

### Disagreements

A disagreement is a probe request the engine would answer differently after the migration, per plugin version and access type. **Migrate** stays disabled unless the preview proves equivalence. Leave such a policy hand-written.

## Undo a migration

On a migrated policy press **Undo migration of \<policy\>**. The dialog is *Undo the migration of "\<policy\>"?*. Undo removes the generated grants and rules and switches the original policy back on. A summary of what was restored is shown.

If the profiles changed since the preview, a migration reports *Migrating found that the profiles changed since the preview* and writes nothing.

## Limits and known issues

- Migration is proven for Trino with plugin 2.5.0 or 2.8.0 and StarRocks with 2.8.0 or 2.9.0. For another plugin version the tab refuses.
- A policy naming a group or role in a way the model cannot express is **Blocked**.

## Further reading

- [Hand-written policies](./policy-editor.md)
- [Policies and overlaps](./policies-and-overlaps.md)
