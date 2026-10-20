---
sidebar_position: 5
---

# Response shape

The **Response** tab shows what a consumer actually receives when it calls the endpoint: the frozen columns of the live version, and the settings that decide how rows become JSON. Use it to rename keys, return positional arrays, drop the envelope, or build a custom document with a script.

![The Response tab of Orders by status: frozen columns status, revenue and order_count, and the Output shape settings](/img/platform/data-api/endpoint-response.png)

## The default response

By default every call answers with a wrapped envelope. The rows are in `data`, and `meta` describes the call:

```json
{
  "status": "ok",
  "message": null,
  "data": [
    { "status": "F", "revenue": 211278198.4, "order_count": 1483 },
    { "status": "O", "revenue": 210258874.46, "order_count": 1506 },
    { "status": "P", "revenue": 12650639.01, "order_count": 76 }
  ],
  "meta": {
    "version": 2,
    "cached": false,
    "request_id": "78140630-b51e-4aa7-bcc2-79f42c988174",
    "row_count": 3,
    "columns": [
      { "name": "status", "ty": "varchar(1)", "required": true },
      { "name": "revenue", "ty": "double", "required": true },
      { "name": "order_count", "ty": "bigint", "required": true }
    ]
  }
}
```

| Field | Meaning |
|---|---|
| `status` | `"ok"` on success, `"error"` on a refusal. Mirrors the HTTP status; it never replaces it. |
| `message` | Always `null` on success. A string on a refusal. |
| `data` | The rows. An array for a one-statement endpoint; an object keyed by statement name for several. |
| `meta.version` | The published version that answered. Quote it when debugging: it identifies the exact frozen contract. |
| `meta.cached` | `true` when the [cache](./config#cache) answered. |
| `meta.request_id` | Identifies the call in [Activity](../activity). Quote it to support. |
| `meta.row_count` | The number of rows. |
| `meta.columns` | The column names and engine types of the statement. With several statements, `meta.statements` holds one entry per statement. |

## Frozen columns

The first section, **Frozen columns**, lists the columns of the **live version**, not the draft. Publishing runs the SQL against the engine to learn the columns and freezes them. At serving time Egret checks every response against them and fails closed (`503 schema_drift`) if the engine's columns have changed, so a consumer never silently receives different columns than were published.

With several statements the tab shows one table per statement, headed by its name. Before the first publish it says *This endpoint has no live version yet. Publish it to see the columns a consumer will receive.*

A column marked **May be absent** comes from a branch that only some parameter values reach: on the calls that skip it, the key is missing from the row entirely, never `null`. For example an endpoint that adds `revenue` only when `?with_revenue=true`:

```json
{ "data": [{ "status": "F" }, { "status": "P" }, { "status": "O" }] }
```

versus, with `?with_revenue=true`:

```json
{ "data": [{ "status": "O", "revenue": 1.02837633121e+9 }, { "status": "P", "revenue": 6.333947532e+7 }] }
```

Every other column is in every response.

## Response transform

### Build the response with a script

Tick **Build the response with a script** to replace the standard `data` with a document you build. This is for a shape no SQL projection can express, such as a single object that joins a total with a list. Most endpoints do not need it: **Shape** and **Naming** already cover renaming keys and objects versus arrays.

![The Response tab of Yearly revenue summary: two statements' frozen columns, the transform script (227 / 8,192 bytes) and three declared returns](/img/platform/data-api/endpoint-response-transform.png)

The script is Starlark, a deterministic Python subset with no input or output, no network, no clock and no randomness. It must define `transform(params, statements)`:

```python
def transform(params, statements):
    total = statements["total"]
    return {
        "year": params["year"],
        "orders": total[0]["orders"] if len(total) > 0 else 0,
        "breakdown": statements["by_status"],
    }
```

| Argument | What it holds |
|---|---|
| `params` | The resolved parameter values, by name. |
| `statements` | The rows of every statement, as a dictionary keyed by statement name, each a list of row objects. A one-statement endpoint is still keyed (`"main"`), so adding a second statement later does not break the script. |

The script must return a JSON object. The size of the script is shown under the editor (`227 / 8,192 bytes`) and is capped at **8,192 bytes**; publish refuses a larger one, because a transform reshapes what a statement already returned and is not where business logic belongs.

### Declared returns

A script's output cannot be inferred from the SQL: it may depend on the data. So you **declare** what `data` looks like, in the **Declared returns** table.

| Column | What it does |
|---|---|
| **Name** | The key in the object the script returns. Names must be non-blank, have no leading or trailing space, and be unique. |
| **Type** | A label for the column, for example `bigint` or `array`. It is written into the OpenAPI document. Egret checks which keys are present, not their types. |
| **Required** | When ticked, the key must be in every response. Untick it for a key that may be absent. |

Press **Add return column** to add a row. At most **64** columns can be declared, and at least one is required: *No return columns declared … Preview and Publish both refuse this.*

What Egret checks with `returns`:

- At publish, the script is run on test inputs, including a case where every statement returns no rows, and refused if its output disagrees with the declaration. A script that assumes a row exists fails at publish: `the empty-rows probe: the transform script failed while running … Index 0 is out of bound`. Guard against empty results as in the example above.
- At every request, the response is checked against `returns`, and a mismatch fails closed instead of reaching the consumer. An undeclared key, or a missing required key, is refused.

:::note
**Preview** in the Query tab does not run the script. It shows the statement's own rows and says so: *The rows below are the statement's own — the script's input, not the response a consumer receives.* Use **Try it** to see the transformed response; see [Try it](./try-it).
:::

With a transform, the **Shape** and **Naming** settings are not shown: they describe how a SQL row becomes JSON, and a transform's output never goes through that step. **Envelope** still applies. Unticking the box brings the previous **Shape** and **Naming** back.

## Output shape

### Shape

| Option | Each row is | Example |
|---|---|---|
| **Objects** (default) | A named object. | `{"order_status": "F", "order_count": 7304}` |
| **Arrays** | A positional array, smaller but dependent on column order. | `["F", 7304]` |

### Naming

How column names are written in the response.

| Option | Result for `order_count` |
|---|---|
| **As-is** (default) | `order_count` |
| **camelCase** | `orderCount` |
| **snake_case** | `order_count` |

Two columns that collapse onto one name make the endpoint refuse to serve until it is re-published: `503 output_naming_collision`. The `columns` list in `meta` still shows the engine's own column names.

### Envelope

| Option | Response |
|---|---|
| **Wrapped** (default) | `{status, message, data, meta}` around the rows. |
| **Bare — data only** | The rows alone, with no version, cache flag or request id. |

A bare response is the data alone:

```json
[{"order_status":"F","order_count":7304},{"order_status":"O","order_count":7333},{"order_status":"P","order_count":363}]
```

Refused calls still answer with the full error body either way, because an unwrapped error would be a bare `null` and say nothing.

:::caution Shape changes break consumers
Changing **Shape**, **Naming** or **Envelope** changes every row or the wrapper. Publishing reports each as a breaking change (for example *`wrapped` becomes `bare`, so the wrapper is added or removed*) and asks you to acknowledge it. See [Publishing](./publishing#breaking-changes).
:::

## OpenAPI document

At the bottom of the tab, **Download OpenAPI** downloads this endpoint's contract for a service account you choose. The line next to it shows the base URL. See [OpenAPI export](../openapi).

## Limits and known issues

- The script is capped at 8,192 bytes and 64 declared returns.
- Types in **Declared returns** are documentation: they are not enforced against the script's output.
- With **Naming** set to camelCase or snake_case, `meta.columns` keeps the engine's names.

## Further reading

- [Several statements and scripted SQL](./statements)
- [Publishing](./publishing)
- [OpenAPI export](../openapi)
