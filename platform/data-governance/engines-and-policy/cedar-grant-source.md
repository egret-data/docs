---
sidebar_position: 8
---

# The egret-object grant source

egret's permission decision point (PDP) decides access to egret objects — dashboards, charts, datasets, saved queries, apps, data API endpoints and the folders that hold them. For each decision it links the caller's **grants** onto the compiled policy. Those grants have always come from the `access_grants` table. The **grant source** switch lets an operator move that read into egret's one grant store — a mirror kept in lock-step with `access_grants` — prove the two give identical decisions, and move back, with no change to how grants are written.

The switch is **reversible by design**. The shipped default is now **shadow** (observe — see below); nothing it does is irreversible: `access_grants` stays the write target throughout, so you can always return to it.

Reading and changing the switch needs **platform admin**. Every endpoint is under `/api/control-plane/perm/cedar-grants`; a caller who is not a platform admin gets `403`. There is no UI for the switch yet — it is operated over the API. It composes with [the PDP policy source](./pdp-policy-source.md): that switch chooses where the compiled policy comes from, this one chooses where the per-request grants come from. Both now default to **shadow** (observe), so an installation serves exactly the pre-switch decisions while comparing the new paths — the soak — out of the box.

## The three states

The switch is a single installation-wide value, re-read by the PDP on **every reload**. egret **seeds** the switch to `shadow` on install/upgrade (without overwriting a value you have already set), so a fresh installation boots in observe. An absent or unreadable value still falls back to `legacy` in code — the **fail-safe floor** — so a broken switch can never deny or widen access.

| State | What the PDP reads grants from |
|---|---|
| **legacy** | `access_grants` — the pre-switch behaviour, byte-for-byte. The fail-safe floor for an absent/unreadable switch. |
| **shadow** | `access_grants` (serves exactly the legacy decisions), **and** runs the equivalence report against `perm.cedar_grants` on every reload, logging any divergence. Decisions do not change; shadow only observes. **This is the shipped default.** |
| **unified** | `perm.cedar_grants`, the one grant store's mirror. A trigger keeps it in lock-step with every `access_grants` write, so the read is never stale and decisions are identical to `legacy` — proved by the report before the move. |

If a read against `perm.cedar_grants` ever fails while in `unified`, the PDP falls back to `access_grants` for that decision and raises an alarm, so a storage hiccup can never deny or widen access.

Because the shipped default is `shadow`, **every** reload (on each `RolesChanged`) runs the equivalence report — a full-table comparison of `access_grants` against `perm.cedar_grants`. This is the intended soak cost; on a very large `access_grants` it adds reload latency and database load. Move to `legacy` if you need to switch it off, or to `unified` once the soak is clean.

## The mirror and the trigger

`perm.cedar_grants` holds the decision-relevant columns of `access_grants`. A trigger on `access_grants` mirrors every insert, update and delete into it, so the two stay equal for every write the application makes. **`fold`** backfills the rows that existed before the mirror was created. Because the mirror is a maintained replica, moving to `unified` changes only where the PDP *reads*; grants are still *written* to `access_grants`, and `undo` returns the read to it instantly.

## The equivalence report

Before moving to `unified`, egret compares the two tables row for row, over every decision-relevant column, in both directions:

| Field | Meaning |
|---|---|
| **kind** | `only_legacy` — a grant in `access_grants` but not the mirror; or `only_unified` — a grant in the mirror but not `access_grants`. |
| **id** | The grant row the divergence is about. |
| **detail** | A sentence naming the difference. |

An **empty** report means the mirror is a faithful replica and `unified` is safe. A non-empty report is what the move gate refuses on.

## Operating the switch

The lifecycle is **observe (the default), prove, move** — and undo at any point. The install migration already folded existing grants into the mirror and left the switch in `shadow`, so a fresh installation is already observing; `fold` below is only needed to re-sync after a trigger-bypassing operation.

1. **Check the current state.**

   ```
   GET /api/control-plane/perm/cedar-grants
   ```

   Returns `source` (`legacy`/`shadow`/`unified`), and `switched_at` and `switched_by` for the last change.

2. **Fold the existing grants into the mirror.**

   ```
   POST /api/control-plane/perm/cedar-grants/fold
   ```

   Backfills `perm.cedar_grants` from `access_grants`. The state is unchanged (`shadow` by default); the trigger keeps the mirror current from here on. To re-enter observe after an `undo` to `legacy`, use `POST /api/control-plane/perm/cedar-grants/shadow`.

3. **Read the report.**

   ```
   POST /api/control-plane/perm/cedar-grants/report
   ```

   Returns the current list of divergences (empty ⇒ the mirror is faithful). Use it to confirm the mirror matches before moving.

4. **Move to unified.**

   ```
   POST /api/control-plane/perm/cedar-grants/switch
   ```

   This is **gated**: it refuses with `409 Conflict` unless a fresh report is empty, naming the divergence count when it is not. On success the PDP reads grants from the mirror from the next reload, with the fail-safe described above.

Every state change publishes an internal `RolesChanged` event, so the PDP reloads and re-reads the switch immediately; you do not restart anything.

## Rollback

```
POST /api/control-plane/perm/cedar-grants/undo
```

Undo steps the state **back by one level**, not straight to the start: `unified → shadow → legacy` (and `legacy → legacy` is a no-op). A single undo from `unified` returns the grant read to `access_grants` at once while keeping the observe comparison on, so you can see what diverged; a second undo turns observe off. Because `access_grants` is never stopped being written, each step is immediate and lossless. The switch never makes anything irreversible; removing the `access_grants` read path for good is a separate, later **finalize** step, taken only after a long clean soak on `unified`, and is not part of operating this switch.

## Operational cautions

- The mirror's fidelity while `unified` rests entirely on the trigger. **Do not bypass it while in `unified`:** do not `TRUNCATE access_grants`, disable the mirror trigger, or apply changes with row triggers suppressed (for example a restore run under `session_replication_role = 'replica'`, as some logical-replication and restore tools do). Any of these can leave the mirror stale while it is being served. If such an operation is unavoidable, `undo` back to `legacy` first (two steps from `unified`, since `undo` moves one level at a time), perform it, then `fold` and re-run the report before moving back to `unified`.
- The report and the move gate are point-in-time. They prove fidelity at the moment of the switch; continuous fidelity afterwards is the trigger's job, which is why the caution above matters.

## Known limits

- The switch moves the grant **read** only. It adds no permission and changes no grant semantics; grants are still defined by roles and written to `access_grants`.
- The switch is **installation-wide**: there is no per-workspace or per-object grant source.
- There is no UI yet; operate it over the API.

## Further reading

- [The PDP policy source](./pdp-policy-source.md)
- [Migrate policies](./migrate.md)
