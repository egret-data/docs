---
sidebar_position: 7
---

# The PDP policy source

egret's permission decision point (PDP) decides every access request from an in-memory policy set it rebuilds on each reload. That set can be built two ways: the **legacy** builder, which assembles it from SQL as egret always has, and the **compiled** builder, which compiles it from the permission model's intermediate representation. The two are meant to produce the same decisions; the **policy source** switch lets an operator prove that on live data and move from one to the other safely, and back.

The switch is **reversible by design**. The shipped default is now **shadow** (observe): egret builds and compares both sets while still serving the proven legacy decisions, so the soak begins on every installation. `legacy` remains the fail-safe floor. Nothing a switch does is irreversible — there is no step in this runbook you cannot undo.

Reading and changing the switch needs **platform admin**. Every endpoint is under `/api/control-plane/perm/pdp-source`; a caller who is not a platform admin gets `403`. There is no UI for the switch yet — it is operated over the API.

## The three states

The switch is a single installation-wide value, re-read by the PDP on **every reload**. egret **seeds** the switch to `shadow` on install/upgrade (without overwriting a value you have already set), so a fresh installation boots in observe. An absent or unreadable value still falls back to `legacy` — the **fail-safe floor** — so a broken switch behaves exactly as egret always has.

| State | What the PDP builds | What it serves |
|---|---|---|
| **legacy** | The legacy (SQL) set only. | The legacy set — byte-for-byte the pre-switch behaviour, and the fail-safe floor for an absent/unreadable switch. |
| **shadow** | Both the legacy set and the compiled set, every reload. It compares them and logs any divergence. | The **legacy** set. Decisions do not change; shadow only observes. **This is the shipped default.** |
| **compiled** | The compiled set. | The compiled set, with a fail-safe: if the compiled build errors, the PDP serves the legacy set instead and raises an alarm. |

Because the shipped default is `shadow`, **every** reload (on each `RolesChanged`) builds the compiled set alongside the legacy set and diffs them. This is the intended soak cost; on a large permission model it adds reload latency and CPU. Move to `legacy` to switch the comparison off, or to `compiled` once the soak is clean.

In no state does the PDP serve the compiled set without the switch explicitly reading `compiled`. `legacy` and `shadow` both enforce exactly the legacy decisions.

## The divergence report

In `shadow`, and on demand through the report endpoint, egret builds both sets and compares them for **set-equality on the policy text and on the role-name mapping**. A match means the two builders would enforce the same thing. A mismatch is a **divergence**:

| Field | Meaning |
|---|---|
| **kind** | `Policy` — a policy present in one set and not the other, or whose text differs; or `RoleName` — a role id whose name differs between the two builders. |
| **id** | The policy id or role id the divergence is about. |
| **detail** | A sentence naming what differs. |

An **empty** report means the compiled set is identical to the legacy set on the installation's live data — the signal that it is safe to switch.

## Operating the switch

The intended lifecycle is **observe, prove, flip** — and undo at any point.

1. **Check the current state.**

   ```
   GET /api/control-plane/perm/pdp-source
   ```

   Returns `source` (`legacy`/`shadow`/`compiled`), and `switched_at` and `switched_by` for the last change.

2. **Turn on shadow.**

   ```
   POST /api/control-plane/perm/pdp-source/shadow
   ```

   The PDP keeps serving legacy decisions, but now builds the compiled set alongside on every reload and logs divergences. Leave it in shadow long enough to cover a representative period of policy changes (a **soak**), watching the logs.

3. **Read the report on live data at any time.**

   ```
   POST /api/control-plane/perm/pdp-source/report
   ```

   Returns the current list of divergences (empty ⇒ the two builders agree right now). Use it to confirm the soak is clean before flipping.

4. **Flip to compiled.**

   ```
   POST /api/control-plane/perm/pdp-source/switch
   ```

   This is **gated**. It refuses with `409 Conflict` unless **both** hold:

   - the current state is `shadow` (you cannot jump straight from `legacy` to `compiled`), and
   - a fresh report taken at that moment is **empty**.

   When it refuses it says why — that the state is not shadow, or how many divergences remain. On success the PDP serves the compiled set from the next reload, with the fail-safe described above.

Every state change publishes an internal `RolesChanged` event, so the PDP reloads and re-reads the switch immediately; you do not restart anything.

## Rollback

```
POST /api/control-plane/perm/pdp-source/undo
```

Undo steps the state **back by one level**, not straight to the start:

- `compiled` → `shadow` (stop serving compiled; resume serving legacy while still comparing)
- `shadow` → `legacy` (stop building the compiled set)
- `legacy` → `legacy` (already at the floor; no-op)

Because `legacy` and `shadow` both serve the legacy decisions, a single undo from `compiled` returns enforcement to the known-good legacy set at once, while keeping shadow comparison on so you can see what diverged. A second undo turns shadow off.

The switch never makes anything irreversible. Making the compiled builder the permanent one — and removing the legacy builder — is a separate, later **finalize** step, taken only after a long clean soak on `compiled`; it is not part of operating this switch.

## Known limits

- The compiled builder introduces **no new decisions** and changes **no grant source**. It is a second way to build the same policy set, not a new policy model. If it diverges from legacy, that is a bug to investigate, not a decision to accept — leave the switch in `shadow` or `legacy` and report it.
- The switch is **installation-wide**: there is no per-engine or per-workspace policy source.
- There is no UI yet; operate it over the API.

## Further reading

- [Migrate policies](./migrate.md)
- [Policies and overlaps](./policies-and-overlaps.md)
