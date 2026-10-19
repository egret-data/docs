---
sidebar_position: 8
---

# Query errors

SQL Lab shows the error text that the engine gives. It does not translate, shorten or hide it. This page shows where errors appear, how to read them, and what the common ones mean.

![A failed query: the error banner shows the engine's message](/img/platform/sql-datasets/sqllab-error.png)

## Where errors appear

There are two kinds, depending on when the problem is found.

**The query ran and failed.** The run goes through *Queued* and *Running* to *Failed*. You see:

- The red badge *Failed in 125 ms* in the toolbar and in the Results tab bar.
- In **Results**, a red banner **Query failed** with a **Copy** button, then the message in a monospaced box. **Copy** puts the whole message on the clipboard and a toast says *Error copied*.
- A *Failed* entry in [History](./history-saved-snippets#history).

**The query was refused before it started.** Examples are a missing database, a bad [parameter](./parameters#errors), or a permission problem. An error toast appears in the corner of the page, the run is not recorded as a failed query, and the previous result stays where it was. The toast shows the server's reply as it came, so it can look like `Error: {"error":"invalid input: …"}`.

## How the message is built

A failed query's message starts with a short prefix that tells you who said it.

| Prefix or text | Who said it | What it means |
|---|---|---|
| `engine: …` | The database engine | The engine received the query and rejected it: a syntax error, an unknown table or column, an unsupported statement, a type mismatch. The rest of the text is the engine's own message. |
| `connect: …` | Egret | Egret could not reach the engine (host unreachable, port closed, TLS failure). Check the connection under [Databases](../../workspace-settings/databases). |
| `timeout` | Egret | The query ran longer than the server's `engine.query_timeout_secs` (60 seconds by default). |
| `engine authentication failed` | Egret | The engine refused the identity Egret presented. With per-user delegation this usually means your engine token could not be verified. |
| `forbidden` | Egret or the engine | You are not allowed to run this. On a delegated connection, a user without an SSO session gets it. |

(The `connect:`, `timeout` and authentication texts come from the server code; only the `engine:` family was reproduced on the demo instance.)

## Read the position in the message

Trino reports where the problem is as `line L:C`. In SQL Lab the numbers can differ from your editor:

- Egret wraps a single `SELECT` or `WITH` statement in `SELECT * FROM ( … ) AS _egret_lim LIMIT n`, which pushes everything one line down. A typo on line 1 of the editor is reported on **line 2**. The column is correct.
- With **Run selection**, the numbers count from the first character of the selected text, not from the top of the editor.
- A statement that is not wrapped (for example `SHOW TABLES`) keeps its own line numbers.

## Common errors

These were produced on the demo Trino with the `tpch` catalog.

| Message | Cause and fix |
|---|---|
| `engine: line 2:35: Table 'tpch.tiny.ordres' does not exist` | A misspelt table. Open the table in the [Explorer](./schema-browser) or use autocomplete to insert the name. |
| `engine: line 2:8: Column 'x' cannot be resolved` | The column is not in the tables in `FROM`. Expand the table in the Explorer to see its columns. |
| `engine: line 1:9: mismatched input ';'. Expecting: …` | Two statements in one run. Select one statement and use **Run selection**. |
| `engine: Division by zero` | A runtime error in a row. Guard the divisor, for example with `NULLIF(x, 0)`. |
| `engine: Cannot cast 'abc' to INT` | A value cannot be converted. Use `TRY_CAST` on Trino to get `NULL` instead of an error. |
| `engine: line 2:8: Function 'nosuchfn' not registered` | The function name is wrong or belongs to another engine. Trino and StarRocks have different functions. |
| `engine: line 2:15: Catalog 'nosuchcatalog' not found` | A catalog that does not exist on this connection. Check the first level of the [Explorer](./schema-browser). |
| `engine: This connector does not support dropping tables` | The statement reached the engine and the connector refused it. SQL Lab does not block statements; the engine and its access policies decide. |

## When a query fails

1. Read the first line of the message. The engine usually names the problem and its position.
2. Press **Copy** in the banner if you need to send the message to someone. It copies the whole text.
3. Check the SQL against the schema: expand the table in the [Explorer](./schema-browser) and compare names and types.
4. Run smaller pieces with **Run selection** until you find the part that fails.
5. Open [History](./history-saved-snippets#history) to compare with a version that worked, and use **Re-run** or load its SQL back into the editor.
6. If the same query fails with *forbidden* or a permission message only for you, the cause is access, not syntax: see [Permissions and availability](./permissions).

## Errors that are not SQL errors

| What you see | Cause |
|---|---|
| The page *403 — Forbidden* | The **SQL Lab** module is switched off for this workspace. See [Permissions and availability](./permissions). |
| The toast *Pick a database* | The tab has no database chosen. Choose one in the Explorer. |
| *Couldn’t load — no access or engine error.* in the Explorer | The browse request failed; see [The schema browser](./schema-browser#states-you-can-meet). |
| A toast containing `forbidden` after pressing **Run** | Your role does not include `query:run`. |

## Limits and known issues

- Parameter and permission errors appear as toasts with raw JSON text.
- Line numbers in engine errors are shifted by one line for wrapped queries.
- The *engine:* prefix is sometimes doubled (`engine: engine: …`), for example when a dataset is created from a query the engine rejects.

## Further reading

- [The query editor](./editor)
- [Query parameters](./parameters)
- [Permissions and availability](./permissions)
