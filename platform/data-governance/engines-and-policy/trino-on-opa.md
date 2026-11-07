---
sidebar_position: 6
---

# Trino on OPA

Trino 483 ships an OPA access-control plugin (`plugin/opa`) that asks an HTTP service about every decision. Egret can be that service: it answers the plugin itself, so there is **no OPA server to run and no Rego to write**. The answers come from the same permission model, grants and rules as the Ranger download, so a policy profile can move between the Ranger plugin and the OPA plugin without changing a rule.

You switch a **policy profile**, not an engine. Every engine bound to the profile follows it. Switching back to Ranger always works, and every profile keeps compiling its Ranger artifact whatever its mechanism, so a switch back needs no recompile.

![The Advanced tab of the provisioned engine trino-opa: the Access control section, How engines are asked, with OPA selected](/img/platform/admin/gov-opa-access-control.png)

## Enable the feature

The feature is gated by one key, **off by default**:

| Key | Environment variable | Default |
|---|---|---|
| `[governance.opa] enabled` | `EGRET_GOVERNANCE__OPA__ENABLED` | `false` |

```bash
EGRET_GOVERNANCE__OPA__ENABLED=true
EGRET_RANGER__ENABLED=true
```

It also needs `ranger.enabled = true`, because the OPA routes check the engine credentials of the Ranger surface (see [Engines and Ranger setup](../../deploy-operate/engines-and-ranger.md)). With the Ranger surface off, OPA does not run and a switch to OPA is refused with the same message as a disabled gate.

With the gate off, the OPA routes are not mounted (they answer 404), no snapshot refresher runs, and a switch to OPA is refused: *OPA is not enabled on this installation ([governance.opa] enabled)*. The two other keys of `[governance.opa]` are under [Limits](#limits).

**Turning the gate off while profiles are on OPA makes their engines fail every query**, because the routes unmount. Switch those profiles back to Ranger first.

## Who can switch

A profile can switch to OPA when all of these hold:

- it is a **Trino** profile;
- Egret generates it: it holds grants or rules from the permission model, not hand-written policies only;
- the installation has `[governance.opa] enabled = true`;
- every bound engine that **Egret provisions** runs `trinodb/trino:483`, the one image Egret has measured to ship `plugin/opa` (a pinned digest must be the known one);
- it holds no `all - …` default policies;
- neither the profile nor its tag service holds hand-written policies;
- it serves no stored mask or row-filter pair whose winner the artifact does not express (`GET /api/control-plane/perm/overlaps`, see [Policies and overlaps](./policies-and-overlaps.md)).

Egret cannot see the image of an **external** engine, so it does not check it. Its operator must run Trino 483 or later with `plugin/opa`.

An OPA profile is lowered from the generated policies only. Hand-written rows, `all - …` rows and stored overlaps would be ignored by the evaluator, so the switch is refused while they exist. After the switch they stay refused:

- a hand-written policy in the profile's tag service is refused with *\<tag service\> is the tag service of a profile on OPA; OPA would ignore a hand-written policy here*;
- binding, re-imaging or creating a provisioned engine without the plugin is refused with *engine \<name\> runs \<image\>, which does not ship the Trino OPA plugin, and its profile is on OPA; use trinodb/trino:483 or switch the profile to Ranger*;
- a profile that acquires such a row anyway is denied everything (see [Fail-closed behaviour](#fail-closed-behaviour)).

### Why a switch is refused

A refused switch lists every condition that holds, one message each, and writes nothing:

| Message | What to do |
|---|---|
| *OPA is not enabled on this installation ([governance.opa] enabled)* | Set `EGRET_GOVERNANCE__OPA__ENABLED=true` (and keep `ranger.enabled`), then restart Egret. |
| *only a Trino profile can use OPA; this profile is of type \<type\>* | Nothing: StarRocks profiles stay on Ranger. |
| *only a generated profile can use OPA: hand-written policies are Ranger JSON that OPA cannot evaluate* | Express the profile's access as grants and rules (see [Migrate policies](./migrate.md)), so that Egret generates it. |
| *engine \<name\> runs \<image\>, which does not ship the Trino OPA plugin; supported: trinodb/trino:483* | Move the engine to `trinodb/trino:483` in the Control plane, or bind it to another profile. |
| *the profile holds the `all - …` default policies (\<n\>); delete them first* | Delete the `all - …` policies; the profile's **Policies** tab lists them. |
| *\<service\> holds \<n\> hand-written policies, which OPA would ignore; delete them first* | Migrate or delete the hand-written policies of that profile or tag service. |
| *the profile serves \<n\> mask/row-filter pairs whose winner the artifact does not express (see GET /perm/overlaps); resolve them first: …* | Resolve the listed pairs (see [Policies and overlaps](./policies-and-overlaps.md)). |

![A refused switch on the Advanced tab of the profile docs-opa-refused: two refusals, only a generated profile can use OPA and the profile holds the all - … default policies (13), with Ranger still selected](/img/platform/admin/gov-opa-switch-refused.png)

## Switch a profile

You need the **policy:update** permission. Without it the section is read-only and says *You need policy:update to change this.*

1. Open **Governance → Engine & policy** and select the engine (or the profile, for a profile without an engine).
2. Open the **Advanced** tab. The **Access control** section shows **How engines are asked**: **Ranger** or **OPA**. It appears for Trino profiles only.
3. Choose **OPA**. The dialog **Switch to OPA?** says *Every engine bound to this profile restarts its coordinator to load the new access control. Queries running on it fail.* When an external engine is bound, it adds *External engines are not restarted by egret. Their operator must install the new plugin files, and run Trino 483 or later with plugin/opa.*
4. Press **Switch**, or **Cancel** to keep the profile as it is.

![The Switch to OPA? dialog: every bound engine restarts its coordinator, and queries running on it fail](/img/platform/admin/gov-opa-switch-dialog.png)

On success a toast says *Switched to OPA.*, and the section lists the engines it reconfigured (*Reconfigured: …*), the external engines it did not restart (*Not restarted (external): …*) and what their operator must do. On a refusal the section lists every message (above) and keeps the previous selection. Switching back works the same way, from **Ranger** and **Switch to Ranger?**.

### Through the API

```bash
curl -X PATCH "$EGRET/api/control-plane/policies/services/docs-trino" \
  -H "Content-Type: application/json" \
  -d '{"mechanism": "opa"}'
```

The body is `{"mechanism": "ranger"}` or `{"mechanism": "opa"}`. It needs `policy:update`. The profile list and detail (`ProfileDto`) carry the current value as `mechanism`.

| Status | Meaning |
|---|---|
| 200 | The switch is committed. The body is `{name, mechanism, engines_reconfigured, external_engines_unchanged, external_engines_warning?}`. |
| 404 | No such policy profile. |
| 409 | The switch to OPA is refused, nothing is written. The body is `{error, code: "mechanism_refused", refusals}`: `refusals` holds every message of the table above that applies, and `error` is the first. |
| 502 | The switch is committed, but some bound engines were not reconfigured (below). |

## What a switch does

- **It recompiles.** Egret recompiles the profile, bumps the policy version and records a `profile:mechanism` audit entry. Sending the mechanism the profile already has writes nothing.
- **It restarts every bound coordinator that Egret provisions**, to load the new access control, and **queries running on it fail**. Plan the switch for a quiet period. These engines are listed in `engines_reconfigured`.
- **The Ranger policies keep compiling.** The profile's Ranger artifact stays current while it is on OPA, so a switch back to Ranger is immediate.
- **External engines are not touched.** They are listed in `external_engines_unchanged`, and `external_engines_warning` says what their operator must do (see [External engines](#external-engines)). The field is absent when no external engine is bound.

### When an engine could not be re-applied: 502

The answer is 502 with `{error, engines_reconfigured, engines_failed: [{engine, error}], external_engines_unchanged, external_engines_warning?}`, and `error` reads *the profile is now on \<mechanism\>; engines not reconfigured: \<names\>. Send the same PATCH again to retry.* The profile is already on the new mechanism; only the named engines were not re-applied.

Send the same request again to retry; in the console, press **Retry** in the error. Egret re-applies every bound engine each time, even when nothing changed, and tries all of them rather than stopping at the first failure. An engine whose apply landed but whose new state could not be recorded is reported the same way: *applied, but the applied mechanism (\<mechanism\>) could not be recorded: …*.

Until a provisioned engine has been re-applied, Egret keeps answering OPA for it, so an engine still running the OPA plugin does not fail. Explain names such engines (see [Explain](#explain)).

## External engines

Egret does not restart or reconfigure an external engine. Its operator installs the files.

**Ranger to OPA.** The engine keeps enforcing the Ranger policies until its operator installs the OPA plugin files.

:::warning
**An external Trino engine bound to its own compiled profile cannot run any query on OPA.** Such a profile gets no infrastructure rows (query execution, self-impersonation), so Trino's per-query checks are refused and every query fails. Egret does **not** refuse that switch: it answers 200 and lists the engine in `external_engines_unchanged`. Keep such a profile on Ranger (KI-354, see [Known issues](../../known-issues.md)).
:::


1. Get the two files. In the console, open **Control plane → Engines → \<engine\> → Plugin config**: for an engine whose profile is on OPA it shows the OPA files, their warnings and what you must supply. Through the API, `GET /api/control-plane/engines/{id}/opa-plugin-config` answers `{files, warnings, adminMustSupply}`. It answers 409 for a provisioned engine, for an engine bound to no profile, and for a profile on Ranger (use `ranger-plugin-config` there). Nothing is minted.
2. The files are `access-control.properties` and `egret-opa-context.properties`, with the engine id filled in and a placeholder where the secret goes.
3. Put the engine's Ranger plugin credential in `egret.secret`. The credential was shown once, at registration or at the last rotation; to see a new one, rotate it with **Rotate credential** in the **Ranger credential** section of the engine's **Overview**, or with `POST /api/control-plane/engines/{id}/rotate-ranger-credential`; the new credential is shown once.
4. Copy both files into `/etc/trino/` on the coordinator, and restart the coordinator.
5. Make sure the coordinator runs Trino 483 or later with `plugin/opa`. Egret cannot check this.

The engine's **Plugin** tab in **Governance → Engine & policy** has **Download Trino config**, which shows the same two files for a profile on OPA, with the engine id and the secret as placeholders (`GET /api/control-plane/policies/services/{service}/trino-config`). Its note reads *Install these two files on a Trino 483 or later coordinator with plugin/opa: egret answers its requests, and cannot check an external engine's image.*, and its warnings include *The coordinator must run Trino 483 or later with plugin/opa; egret cannot check an external engine's image.*

![The Trino config dialog of opa_e2e on OPA: the install note, the opa.log-requests warning, the Trino 483 note, and the two files with Download buttons](/img/platform/admin/gov-opa-trino-config.png)

**Keep `opa.policy.batched-uri`.** Egret's `access-control.properties` sets it, and the files carry the warning *Do not remove opa.policy.batched-uri from access-control.properties: without it Trino sends one request per object, and a listing of about a thousand tables, such as information_schema.columns, failed in testing.* Measured: without it, `information_schema.columns` over a catalog of 1 003 tables failed in 30 of 30 runs with *Failed to query OPA backend*, because the plugin's own HTTP client overflowed its queue of 1 024 requests. With it, the same query took 1 024 requests and succeeded.

**OPA to Ranger.** An external engine still running the OPA plugin **fails every query** until its operator re-installs the Ranger plugin files (see [Ranger plugin](./ranger-plugin.md)), because its profile is no longer on OPA and Egret refuses the plugin's requests. One still running the Ranger plugin is unaffected. The warning says *Any of them running the OPA plugin fails every query until its operator re-installs the Ranger plugin files from `GET /api/control-plane/engines/{id}/ranger-plugin-config`; one still running the Ranger plugin is unaffected.*

Read `external_engines_unchanged` (or the section's *Not restarted (external)* line) after every switch.

## Never enable opa.log-requests

The engine's Ranger plugin credential is the OPA secret, and the plugin sends it **inside every request body**, from `egret-opa-context.properties`. The generated files set `opa.log-requests` and `opa.log-responses` to `false`, and the files carry the warning *Do not enable opa.log-requests: every request carries egret.secret in input.context.properties, and the coordinator log would hold it.*

- Never enable either setting.
- Use TLS between the engine and Egret where the link is not trusted, because the secret travels in the body.
- Egret caches a credential check for 5 s, in both directions. After a rotation, the retired secret can stay valid for up to 5 s, and a secret that was refused just before the rotation made it valid can stay refused for up to 5 s. Wait 5 s after a rotation before you restart the coordinator with the new secret, or retry its first failed queries.

## Fail-closed behaviour

Every failure path denies or fails the query. None of them allows.

- **A refused request to the row-filter or mask endpoints answers 403**, so the plugin fails the query rather than returning unmasked or unfiltered data. `allow` answers `{"result": false}` and `batch` answers `{"result": []}`.
- **A profile whose stored state stops being expressible denies every query until it is fixed**: a hand-written or `all - …` policy, or a stored overlap. The reason is on the Governance overview as a failed compile, *The last compile of 1 profile failed; engines keep the previous compile.*, with the profile's run recorded as `OPA snapshot: …` (see [Overview](../overview.md)). On an OPA profile the engines do not keep a previous compile: no snapshot is built, so every query is denied until the cause is fixed. That entry can linger after the profile has recovered.

| Situation | What the engine sees |
|---|---|
| Refused request (no credential, credential refused, engine bound to no profile on OPA, profile not on OPA) | `allow` answers 200 `{"result": false}`, `batch` answers 200 `{"result": []}`, and `row_filters`, `batch_column_masks` and `column_mask` answer 403 `{"error": …}`. |
| No snapshot yet, or the build failed | The same refusal (*no snapshot: building*, *no snapshot: build failed*). |
| The profile holds a row OPA would ignore (hand-written, `all - …`, stored overlap) | The snapshot is not built, and the profile denies everything. |
| A model that does not lower | The engine is served the previous data with fresh infrastructure, and explain says so. |
| Database unreadable | The held snapshot is kept for up to 30 refreshes (about 30 s), then dropped, and the profile denies. |
| Evaluator error (for example two masks on one column) | 500, and the plugin fails the query. |
| Too many requests in flight or being parsed | 503 `{"error": "busy"}`, and the plugin fails the query. |
| Body larger than the route's limit | 413, and the plugin fails the query. |
| Body not received within `body_read_timeout_ms` | 408 `{"error": "request body not received in time"}`, and the connection is closed. |

Where you see it:

- **Log.** Target `egret::opa`: one `opa: denied` line per refusal (and one per batch), carrying a `reason`; `opa: request body not read` for a 408 or an unreadable body (400); `opa: …` error lines for 500s. Refresher problems log *OPA snapshot build failed; the profile is not built* and *OPA snapshot refused: stored state*.
- **Counters**, each labelled by `route`: `egret_opa_allow_total`, `egret_opa_deny_total`, `egret_opa_error_total`, and `egret_opa_unread_total` for bodies that were never read (408 and 400). A 408 or 400 is not a denial: nothing was decided.
- With several Egret replicas, each runs its own refresher.

## When Egret is unreachable

The OPA plugin asks Egret for every decision, so **while Egret is unreachable, Trino denies every query** on an OPA engine. A Ranger engine keeps enforcing its downloaded policies meanwhile.

Measured on the end-to-end stack (one Egret restarted with `docker compose restart`, a `SELECT 1` started about every 240 ms, three runs):

| | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| Egret's `/healthz` answered again after | 1.42 s | 1.31 s | 1.17 s |
| Statements that failed on the OPA engine | 1 | 0 | 1 |
| Last success to next success | 0.30 s | n/a | 0.29 s |
| Statements that failed on the Ranger engine | 0 | 0 | 0 |

So an Egret restart showed up as one refused statement, or one that stalled for about 1.2 s. The statement after the refused one took 1.1 to 1.2 s. These figures are from a small database: after a restart, each OPA profile's snapshot is built on the refresher's first tick, and every request is refused until that build finishes. In the rebuild measurement, a build took between about 60 ms and 810 ms (profiles of 902 to 11 000 statements, beside 9 other compiled profiles: 22 services in the database, tag services included; the 810 ms ran on table statistics Postgres had not yet analyzed after a bulk insert).

## Known differences from Ranger

Egret compares OPA with a real Ranger 2.8.0 plugin twice: on 2032 generated cases inside Egret, and end to end on 501 query cases with Trino 483 on each plugin (485 the same, 16 where OPA shows less). Every difference is recorded with its reason, and the checks refuse any explanation in which OPA allows, shows or unmasks what Ranger refuses. **OPA is never looser than Ranger.**

| Id | What differs | Which side is right |
|---|---|---|
| `reach-any-is-answered-by-another-access-type` | Ranger lets any access type make an object reachable, even past a deny of another type or of the same type on the object. OPA hides an object from listings and catalog access when any deny or withheld classification covers it. | Egret: OPA is stricter. |
| `a-metadata-table-is-reached-in-ranger` | Ranger lets a user list a metadata table such as `t$files` when that user is restricted on `t`. OPA withholds it under Egret's own `$` rule. | Egret: OPA is stricter. |
| `mask-none-is-no-mask` | Ranger answers `MASK_NONE` for an exempt user, OPA answers no mask. | Both: the engine does the same, the column is not masked. |
| `egret-lineage-is-served-only-by-ranger` | On a JWT-mode engine, Ranger lets the `egret-lineage` principal read unmasked for view lineage. OPA has no such rule and refuses it. | Ranger: on OPA, lineage capture is a gap (below). |
| `egret-lineage-is-refused-on-every-engine` | OPA refuses `egret-lineage` every write and admin operation the lineage rule denies, on every engine. Ranger does so on JWT-mode engines only. | Egret: OPA is stricter. |

What readers notice on an OPA engine:

- **Listings hide anything a deny covers, whatever the deny's privilege.** `SHOW SCHEMAS`, `SHOW TABLES`, `SHOW COLUMNS` and `information_schema` (and so JDBC metadata and catalog browsers) hide a schema, table or column that any deny or withheld classification covers; on Ranger they are listed. This includes a table the user can read: if a user may read `s1.t2` but a deny of **write** covers it, `SELECT` from `s1.t2` works on both mechanisms, yet on OPA `t2` is not listed (KI-352).
- **Lineage capture through EXPLAIN does not work.** A view-lineage `EXPLAIN` by `egret-lineage` on an OPA engine fails closed, so lineage capture through an OPA engine is a gap (KI-353).
- **`information_schema`.** On both mechanisms, a user needs a read on `<catalog>.information_schema` for `SHOW TABLES` and `SHOW COLUMNS`. A mask on a whole catalog does not reach that catalog's `information_schema`.
- `count(*)` is a read of the table, as on Ranger.

## Explain

On an OPA profile, [Explain access](../data/explain-access.md) answers from the same evaluator and the same snapshot the engines are asked, and shows its reason:

- The profile card carries an **OPA** badge.
- **Which policies decided this** unfolds each access. A refusal by a deny reads **Refused by egret’s rule**, with the evaluator's reason below it (*Decided by egret’s evaluator: …*).
- A read shows the column mask as applied and the row filter, for example *Column mask: MASK_HASH, applied as …* and *Row filter: …*.
- *Could not read the profile’s current state; try again.* means the snapshot could not be read at that moment.
- *This answer is from the previous snapshot: the current model did not build, so egret answers from the previous data until it does.* appears when the profile's model did not lower.
- After a switch, an engine not re-applied yet is named: *Not re-applied yet: \<engine\> still runs the previous plugin, so it may answer differently from this OPA explanation until re-applied (send the switch again).*

![Who can read? on lake.s1.t2 for bob: the profile opa_e2e with its Trino and OPA badges, and bob allowed to select s1.t2 by a grant](/img/platform/admin/gov-opa-explain.png)

Through the API, `POST /api/control-plane/perm/explain` carries `mechanism` (`ranger` or `opa`), `ir_reason` on each access, `engines_not_reapplied` when an engine still runs the other plugin, and, for a read, the rendered column mask and the AND of the applying row filters under `opa` (`column_mask`, `column_mask_type`, `row_filter`). A column mask is rendered with `varchar` where the engine substitutes the column's own type.

Explain follows the **profile's** mechanism, not each engine's. It also cannot see a snapshot the refresher has dropped, so for about one refresh period (1 s) it can show a read that the engine refuses, never the reverse.

## Network exposure

The OPA routes live on Egret's main listener, under `/opa/v1/data/egret/trino/`: `allow`, `batch`, `row_filters`, `batch_column_masks` and `column_mask`. They have no CSRF protection and no OpenAPI entry.

:::danger
**Restrict `/opa/` to the engines' network**, with an ingress rule or a NetworkPolicy, so that only Trino coordinators reach it. This is required, not advisory. Egret reads request bodies before it authenticates the caller, and a caller that opens connections and stalls them can hold most of the in-flight budget, renewing it every `body_read_timeout_ms`; the engines' queries then get 503 and fail.
:::

## Limits

Two keys of `[governance.opa]` tune the request bodies:

| Key | Environment variable | Default | Accepted |
|---|---|---|---|
| `batch_body_limit_bytes` | `EGRET_GOVERNANCE__OPA__BATCH_BODY_LIMIT_BYTES` | `25165824` (24 MiB) | 4 MiB to 64 MiB |
| `body_read_timeout_ms` | `EGRET_GOVERNANCE__OPA__BODY_READ_TIMEOUT_MS` | `5000` | 1 to 60000 |

A value outside its range stops Egret at startup, for example *governance.opa.batch_body_limit_bytes must be between 4194304 (4 MiB) and 67108864 (64 MiB), got 0*.

- **One batch per schema.** The plugin sends a listing of a whole schema as one `/batch` request, about 73 bytes per table with short names. At that size the default 24 MiB holds about 340 000 tables; with 20- to 30-character names, an estimate (not measured) is about 170 000 to 210 000. A larger body is answered 413, and `SHOW TABLES` and `information_schema` reads on that schema fail closed. Raise `batch_body_limit_bytes` for larger schemas. Every other route keeps a fixed 4 MiB.
- **Body deadline.** An admitted request must deliver its whole body within `body_read_timeout_ms`, or it gets 408. 5 s covers a 24 MiB body at about 40 Mbit/s; a 64 MiB body needs about 110 Mbit/s. Raise it on a slow link.
- **In flight and parsing.** Egret counts bodies in 4 MiB units: at most 64 units (256 MiB) in flight before authentication, and 16 units (64 MiB) being parsed at once. A request reserves its declared `Content-Length`, or its route's whole limit when it declares none. A request that cannot get its units within 1 s gets 503 `{"error": "busy"}`, and its body is never read. A larger `batch_body_limit_bytes` lets one body take more of the same budget; it does not raise the memory bound.
- **Rebuild delay.** Snapshots are rebuilt within about 1 s of a policy change.
- **Other gaps.** An external Trino 483 engine on its own compiled profile cannot run any query: it gets no infrastructure rows (KI-354). The mask `{col}` placeholder is substituted unquoted, as with Ranger. StarRocks has no OPA mechanism.

## Further reading

- [Ranger plugin](./ranger-plugin.md)
- [Policies and overlaps](./policies-and-overlaps.md)
- [Explain access](../data/explain-access.md)
- [Engines and Ranger setup](../../deploy-operate/engines-and-ranger.md)
- [Configuration keys](../../reference/configuration-keys.md)
