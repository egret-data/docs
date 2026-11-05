---
sidebar_position: 6
---

# Trino on OPA (preview)

A policy profile can be answered by Egret directly instead of through the Ranger plugin. On **OPA**, Trino 483's OPA access-control plugin asks Egret about every decision, and Egret answers from the same policies the Ranger download is compiled from. There is no OPA server to run: Egret serves the OPA API itself.

:::warning
This is a preview. It is **off by default**, it covers Trino only, and this page documents the API and configuration. The console steps, screenshots and timing figures arrive with the next package (2b-2).
:::

You switch a profile, not an engine. Every engine bound to the profile follows it. Switching back to Ranger always works, and every profile keeps its Ranger artifact whatever its mechanism, so a switch back needs no recompile.

## Enable the feature

The feature is gated by one key, off by default:

| Key | Environment variable | Default |
|---|---|---|
| `[governance.opa] enabled` | `EGRET_GOVERNANCE__OPA__ENABLED` | `false` |

```bash
EGRET_GOVERNANCE__OPA__ENABLED=true
EGRET_RANGER__ENABLED=true
```

It also needs `ranger.enabled = true`, because the OPA routes check the engine credentials of the Ranger surface (see [Engines and Ranger setup](../../deploy-operate/engines-and-ranger.md)). With the Ranger surface off, OPA does not run and a switch to OPA is refused with the same message as a disabled gate.

With the gate off:

- the OPA routes are not mounted (they answer 404), and no snapshot refresher runs;
- a switch to OPA is refused: *OPA is not enabled on this installation ([governance.opa] enabled)*.

:::caution
Turning the gate off while profiles are on OPA makes their engines fail every query, because the routes unmount. Switch those profiles back to Ranger first. Explain keeps showing OPA verdicts for them.
:::

## What can switch

A profile can switch to OPA when all of these hold:

- it is a Trino profile (the database allows OPA for Trino only);
- it is a generated profile, not a manual one;
- every bound **provisioned** engine runs `trinodb/trino:483`, the one image Egret has measured to ship `plugin/opa` (a pinned digest must be the known one);
- the profile has no `all - …` default policies and no hand-written policies, in the profile or in its tag service, because OPA would ignore them;
- the profile has no stored mask and row-filter pairs whose winner the artifact does not express (see `GET /api/control-plane/perm/overlaps` and [Policies and overlaps](./policies-and-overlaps.md)).

Egret cannot see the image of an **external** engine, so it does not check it. An external engine needs Trino 483 or later with `plugin/opa`.

A bind, re-image or create that would leave a provisioned engine without the plugin under an OPA profile is refused with *engine \<name\> runs \<image\>, which does not ship the Trino OPA plugin, and its profile is on OPA; use trinodb/trino:483 or switch the profile to Ranger*.

An OPA profile is lowered from the generated policies only. Rows an operator wrote by hand, `all - …` rows and stored overlaps would be ignored by the evaluator, so the switch is refused while they exist and a profile that acquires one afterwards is denied everything (see [Fail-closed behaviour](#fail-closed-behaviour)).

## Switch a profile

```bash
curl -X PATCH "$EGRET/api/control-plane/policies/services/docs-trino" \
  -H "Content-Type: application/json" \
  -d '{"mechanism": "opa"}'
```

The body is `{"mechanism": "ranger"}` or `{"mechanism": "opa"}`. It needs the `policy:update` permission. The profile list and detail (`ProfileDto`) carry the current value as `mechanism`.

| Status | Meaning |
|---|---|
| 200 | The switch is committed. The body is `{name, mechanism, engines_reconfigured, external_engines_unchanged}`. |
| 404 | No such policy profile. |
| 409 | The switch to OPA is refused. Nothing is written. |
| 502 | The switch is committed, but some bound engines were not reconfigured. |

### 409: refused

The body is `{error, code: "mechanism_refused", refusals}`. `refusals` names every condition that holds, and `error` is the first. The messages are:

| Condition | Message |
|---|---|
| Gate off | *OPA is not enabled on this installation ([governance.opa] enabled)* |
| Not Trino | *only a Trino profile can use OPA; this profile is of type \<type\>* |
| Not generated | *only a generated profile can use OPA: hand-written policies are Ranger JSON that OPA cannot evaluate* |
| Engine image | *engine \<name\> runs \<image\>, which does not ship the Trino OPA plugin; supported: trinodb/trino:483* |
| `all - …` defaults | *the profile holds the `all - …` default policies (\<n\>); delete them first* |
| Hand-written policies | *\<service\> holds \<n\> hand-written policies, which OPA would ignore; delete them first* |
| Stored overlaps | *the profile serves \<n\> mask/row-filter pairs whose winner the artifact does not express (see GET /perm/overlaps); resolve them first: …* |

### What a switch does

- Egret recompiles the profile's Ranger artifact, bumps the policy version and records a `profile:mechanism` audit entry. Sending the mechanism the profile already has writes nothing.
- The coordinator of every bound **provisioned** engine restarts to load the new access control, and **queries running on it fail**. Plan the switch for a quiet period. The engines are listed in `engines_reconfigured`.
- **External engines are not reconfigured.** They are listed in `external_engines_unchanged`, and their operator has to act (next section).

### 502: retry

The body is `{error, engines_reconfigured, engines_failed: [{engine, error}]}`. The profile is already on the new mechanism; only the named engines were not re-applied. Send the same PATCH again to retry: Egret re-applies the bound engines every time, even when nothing changed, and tries every engine rather than stopping at the first failure.

A switch back to Ranger is not atomic across engines. Until a provisioned engine has been re-applied, Egret keeps answering OPA for it, so it does not fail while its coordinator still runs the OPA plugin.

## External engines

Egret does not touch an external engine.

**Ranger to OPA.** The engine keeps enforcing the Ranger artifact until its operator installs the OPA files:

1. Read the files with `GET /api/control-plane/engines/{id}/opa-plugin-config`. It works for an external engine bound to a profile that is on OPA, and answers 409 for a provisioned engine, for an engine bound to no profile, and for a profile on Ranger (use `ranger-plugin-config` there). Nothing is minted.
2. The answer is `{files, warnings, adminMustSupply}`. `files` holds `access-control.properties` and `egret-opa-context.properties`, with the engine id filled in and a placeholder where the secret goes.
3. Install both files on the coordinator, set `egret.secret` to the engine's Ranger plugin credential, and restart the coordinator. The credential was shown once, at registration or rotation; to see a new one, rotate it with `POST /api/control-plane/engines/{id}/rotate-ranger-credential`.
4. Make sure the coordinator runs Trino 483 or later with `plugin/opa`. Egret cannot check this.

`GET /api/control-plane/policies/services/{service}/trino-config` returns the same pair of files for a profile on OPA, with the engine id and the secret as placeholders.

**OPA to Ranger.** An external engine that still runs the OPA plugin **fails every query** until its operator reinstalls the Ranger plugin files (see [Ranger plugin](./ranger-plugin.md)), because its profile is no longer on OPA and Egret refuses the plugin's requests.

The 200 answer lists the external engines in `external_engines_unchanged` and says nothing else about them. Read that list after every switch.

## Credentials

The engine's Ranger plugin credential is the OPA secret. The plugin sends it in every request, inside the body, from `egret-opa-context.properties`.

- Never enable `opa.log-requests` or `opa.log-responses`. The generated files set both to `false`, and the plugin config warns: *Do not enable opa.log-requests: every request carries egret.secret in input.context.properties, and the coordinator log would hold it.*
- Use TLS between the engine and Egret where the link is not trusted, because the secret travels in the body.
- Egret caches a credential check for 5 s, in both directions. After a rotation, the retired secret can stay valid for up to 5 s, and a secret that was refused just before the rotation made it valid can stay refused for up to 5 s.

## Network exposure

The OPA routes live on Egret's main listener, under `/opa/v1/data/egret/trino/`: `allow`, `batch`, `row_filters`, `batch_column_masks` and `column_mask`. They have no CSRF protection and no OpenAPI entry.

Egret reads a body of up to 4 MiB **before** it authenticates the caller. Restrict `/opa/` to the engines' network, for example with an ingress rule or a NetworkPolicy, so that only coordinators reach it.

## Explain for an OPA profile

`POST /api/control-plane/perm/explain` answers an OPA profile from the same evaluator and the same snapshot the engines are asked. The answer carries `mechanism` (`ranger` or `opa`), `ir_reason` on each access, and, for a read, the rendered column mask and the AND of the applying row filters under `opa` (`column_mask`, `column_mask_type`, `row_filter`). A column mask is rendered with `varchar` where the engine substitutes the column's own type.

Explain follows the **profile's** mechanism, not each engine's. During the window after a switch while engines are being re-applied, it can differ from an engine still running its previously applied mechanism. It also cannot see a snapshot that the refresher has dropped, so it can be wrong for about one refresh period.

## How OPA decisions differ from Ranger

Egret compared OPA with a real Ranger 2.8.0 plugin on 2032 generated cases. Every difference is recorded with its reason, and the check refuses any explanation in which OPA allows, shows or unmasks what Ranger refuses. **OPA is never looser than Ranger.** The recorded differences:

| Difference | In plain words |
|---|---|
| Reach | Ranger lets any access type make an object reachable, even past a deny of that type on the object itself. OPA is stricter: a listing shows an object only when the user may reach it. |
| Metadata tables | Ranger lets a reader reach metadata tables such as `t$files`. OPA withholds them under Egret's own `$` rule. |
| `MASK_NONE` | Ranger answers `MASK_NONE` for an exempt user and OPA answers no mask. The engine does the same with both; the column is not masked. |
| `egret-lineage` reads | On a JWT-mode engine Ranger lets the `egret-lineage` principal read unmasked. OPA has no such transform, so it is stricter. |
| `egret-lineage` writes | OPA refuses `egret-lineage` every write and admin operation that the lineage transform denies, on every engine. Ranger does so only on JWT-mode engines. |

What readers notice on an OPA engine:

- **Listings are stricter.** `SHOW COLUMNS` and `information_schema.columns` hide the columns a user may not read; on Ranger they list them. `SHOW TABLES` agrees with Ranger in the live check.
- **Lineage capture through EXPLAIN does not work.** `egret-lineage` is refused writes on OPA, and a lineage `EXPLAIN` on an OPA engine fails closed.
- **`information_schema`.** On both mechanisms, a user needs a read on `<catalog>.information_schema` for `SHOW TABLES` and `SHOW COLUMNS`. A mask on a whole catalog does not reach that catalog's `information_schema`.
- `count(*)` is a read of the table, as on Ranger.

## Limits

- **One batch per schema.** The Trino plugin sends one unchunked batch for a listing. A schema of 10,000 tables is about 730 KB, which is under the 4 MiB body limit. A schema of very roughly 28,000 to 57,000 tables (it depends on name length) exceeds it, and `SHOW TABLES` and `information_schema` reads on that schema fail. They fail closed.
- **Parse capacity.** Egret parses 16 request bodies at a time. A request that cannot get a permit within 1 s is answered 503 (`{"error": "busy"}`), and the plugin fails the query.
- **Rebuild delay.** Snapshots are rebuilt within about 1 s of a policy change.
- **Other preview gaps.** An external Trino 483 engine on its own compiled profile cannot run any query: it gets no infrastructure rows. The mask `{col}` placeholder is substituted unquoted, as with Ranger. StarRocks has no OPA mechanism.

## Fail-closed behaviour

Every failure path denies or fails the query. None of them allows.

| Situation | What the engine sees |
|---|---|
| Refused request (no credential, credential refused, engine bound to no profile on OPA, profile not on OPA) | `allow` answers `false`, `batch` answers `[]`, and `row_filters`, `batch_column_masks` and `column_mask` answer 403 `{"error": …}`. |
| No snapshot yet, or the build failed | The same refusal (*no snapshot: building*, *no snapshot: build failed*). |
| Evaluator error (for example two masks on one column) | 500, and the plugin fails the query. |
| Too many bodies being parsed | 503. |
| Profile holds a row OPA would ignore (hand-written, `all - …`, stored overlap) | The snapshot is not built and the profile denies everything. |
| A model that does not lower | The engine is served the previous data with fresh infrastructure, and explain says so. |
| Database unreadable | The held snapshot is kept for up to 30 refreshes, then dropped, and the profile denies. |

Where you see it:

- **Log.** Target `egret::opa`: one `opa: denied` line per refusal (and one per batch), carrying a `reason`; `opa: …` error lines for 500s. Refresher problems log *OPA snapshot build failed; the profile is not built* and *OPA snapshot refused: stored state*.
- **Counters.** `egret_opa_allow_total`, `egret_opa_deny_total` and `egret_opa_error_total`, each labelled by `route`.
- **Compile runs.** A build failure is recorded in the profile's compile runs as `OPA snapshot: …`, the same place a failed Ranger compile appears in Governance. The entry can linger after the profile has recovered.
- With several Egret replicas, each runs its own refresher.

## Further reading

- [Ranger plugin](./ranger-plugin.md)
- [Policies and overlaps](./policies-and-overlaps.md)
- [Engines and Ranger setup](../../deploy-operate/engines-and-ranger.md)
- [Configuration keys](../../reference/configuration-keys.md)
