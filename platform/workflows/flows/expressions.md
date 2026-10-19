---
sidebar_position: 5
---

# Expressions and templating

Almost every string in a flow can hold an expression: the text between `{{` and `}}`. Egret renders expressions with a port of Kestra's Pebble template language, so most Kestra expressions work unchanged. This page lists what is available, with the results seen when each was run on the demo instance, and what is not supported yet.

## Write an expression

```yaml
tasks:
  - id: say_hello
    type: io.kestra.plugin.core.log.Log
    message: "{{ vars.greeting }}, {{ inputs.customer | upper }}! Today is {{ now() | date('yyyy-MM-dd') }}."
```

An expression has a value, optionally followed by filters (`| upper`) and function calls (`now()`). A value can be a name from the context, a literal or a calculation.

| You write | You get |
|---|---|
| `{{ 1 + 2 * 3 }}` | `7` |
| `{{ 10 / 4 }}` | `2.5` |
| `{{ 7 % 3 }}` | `1` |
| `{{ 'a' ~ 'b' }}` | `ab` (join text) |
| `{{ true and not false }}` | `true` |
| `{{ 'x' in ['x', 'y'] }}` and `{{ 'x' isIn ['x', 'y'] }}` | `true` |
| `{{ vars.n > 2 ? 'big' : 'small' }}` | `big` (ternary) |
| `{{ vars.missing ?? 'fallback' }}` | `fallback` (when the value is missing or null) |
| `{{ vars.missing ??? 'undef' }}` | `undef` (only when the attribute is missing) |

Text and numbers keep their type: `{{ inputs.orders + 1 }}` adds when `orders` is an `INT` input. Use double quotes around the YAML string and single quotes inside the expression, as above, so the YAML stays valid.

### Statements

`{% %}` blocks work for control structures and loops:

```yaml
- id: list_items
  type: io.kestra.plugin.core.log.Log
  message: |
    {% for i in inputs.items %}[{{ i }}]{% endfor %}
```

With `items` set to `["a", "b", "c"]` this prints `[a][b][c]`.

## What a task can read

These names are available when a task renders. All of them were confirmed in a run.

| Name | What it is | Example |
|---|---|---|
| `inputs` | The flow's input values. | `{{ inputs.customer }}` |
| `vars` | The flow's `variables:`, plus any set by `SetVariables`. | `{{ vars.env }}` |
| `outputs` | Outputs of tasks that have finished. | `{{ outputs.summary.value }}` |
| `labels` | The execution's labels. | `{{ labels.team }}` |
| `flow` | The flow: `id`, `namespace`. | `{{ flow.id }}` |
| `execution` | The execution: `id`, `startDate`, `state`. | `{{ execution.id }}` |
| `task` | The current task: `id`, `type`. | `{{ task.type }}` |
| `taskrun` | The current task run: `id`, and `value` inside a loop. | `{{ taskrun.id }}` |
| `item` | In a `Loop`: `value`, `index`, and `key` for a map. | `{{ item.value }}` |
| `parent`, `parents` | The enclosing task run or runs, inside nested tasks. | |
| `kv('key')` | A value from the namespace's KV store. | `{{ kv('support_email') }}` |

A name that does not exist stops the task with an *undefined value* error unless you give a fallback with `??`. Two reasons you might hit it: the task you read has not finished yet, or the name is not provided. These are **not** provided today: `trigger` (so `{{ trigger.date }}` fails in a scheduled run), `envs`, `globals`, `execution.originalId` and `flow.revision`.

An id with a dash needs brackets: `{{ outputs['first-task'].value }}`. The editor refuses the dotted form.

## Filters

Apply a filter with `|`. These are registered:

| Group | Filters |
|---|---|
| Text | `capitalize`, `title`, `upper`, `lower`, `trim`, `replace`, `escape`, `escapeChar`, `slugify`, `startsWith`, `endsWith`, `split`, `substringBefore`, `substringBeforeLast`, `substringAfter`, `substringAfterLast`, `indent`, `nindent`, `urldecode` |
| Regular expressions | `regexExtract`, `regexMatch`, `regexReplace` |
| Numbers | `abs`, `number`, `format` |
| Lists and maps | `first`, `last`, `join`, `length`, `reverse`, `sort`, `slice`, `distinct`, `flatten`, `chunk`, `keys`, `values` |
| Dates and time | `date`, `dateAdd`, `timestamp`, `timestampMilli`, `timestampMicro`, `timestampNano` |
| Formats and hashes | `toJson`, `toIon`, `yaml`, `jq`, `md5`, `sha1`, `sha512` |
| Other | `default`, `string`, `className` |

Verified examples:

| Expression | Result |
|---|---|
| `{{ inputs.name \| upper }}` | `EGRET WORKFLOWS` |
| `{{ inputs.name \| title }}` | `Egret Workflows` |
| `{{ 'egret workflows' \| slugify }}` | `egret-workflows` |
| `{{ inputs.nothing \| default('fallback') }}` | `fallback` |
| `{{ inputs.items \| join('-') }}` | `a-b-c` |
| `{{ '2026-10-19T08:30:00Z' \| date('yyyy/MM/dd HH:mm') }}` | `2026/10/19 08:30` |
| `{{ '2026-10-19' \| date('EEEE') }}` | `Monday` |
| `{{ 'order-1042' \| regexExtract('[0-9]+') }}` | `1042` |
| `{{ 'a1b2' \| regexReplace('[0-9]', '#') }}` | `a#b#` |
| `{{ '%05d' \| format(42) }}` | `00042` |
| `{{ inputs.items \| toJson }}` | `["a","b","c"]` |
| `{{ '{"a":1}' \| jq('.a') \| first }}` | `1` |

Date patterns follow Java's `DateTimeFormatter`, so `yyyy-MM-dd HH:mm:ss` and `EEEE` behave as in Kestra. The filters `urlencode`, `base64encode` and `base64decode` are not available yet. The `number` filter accepts only text input.

## Functions

| Group | Functions |
|---|---|
| Time | `now()`, `dayOfMonth`, `dayOfWeek`, `hourOfDay`, `monthOfYear`, `isWeekend`, `isDayWeekInMonth`, `isLastWorkingDay`, `isPublicHoliday` (needs a country code) |
| Identifiers and numbers | `uuid()`, `id()`, `ksuid()`, `nanoId()`, `randomInt(lower, upper)`, `randomPort()`, `range(from, to)` (inclusive) |
| Parsing | `fromJson`, `fromIon`, `yaml` |
| Execution | `tasksWithState('SUCCESS')`, `loopOutputs`, `fetchContext`, `printContext` |
| Storage and files | `read`, `fileSize`, `fileExists`, `isFileEmpty`, `fileURI` (these read execution files) |
| Store | `kv('key')` |

The time, identifier, parsing and `kv` functions were run on the demo instance. `fileExists` and its siblings answer for files an execution wrote, and refuse other URIs. Not supported yet: `max`, `min`, `currentEachOutput`, `render` and `errorLogs` (each answers *not implemented yet* and fails the task). `http()` is refused on purpose, because an expression renders inside the control plane and a request from there would leave from the server's own network. `secret()` is refused everywhere except on Kestra plugin tasks; the editor reports `secret_outside_plugin_task` and a flow that calls it also needs the `workflow:use_secrets` permission to be saved.

## How rendering behaves

- **Rendering repeats.** A value that renders to text that itself contains an expression is rendered again, up to 100 times.
- **Strict variables.** A missing name is an error, not an empty string. Use `??` for optional values.
- **Raw text.** Wrap text in `{% raw %}` … `{% endraw %}` to print braces literally.
- **Output limits.** A rendered value has a size cap, and a task fails with a message naming the cap when it is crossed.
- **Errors.** A failing expression fails its task with a message such as `undefined value (in <string>:1)`, shown in the **Logs** tab.

:::tip
Test an expression before you build on it: put it in a `Log` task with `allowFailure: true`, run the flow, and read the line in the **Logs** tab.
:::

## Limits and known issues

- `trigger.*` is not available in task expressions, so a scheduled or webhook flow cannot read the trigger's date or body. The execution's **Overview** tab shows the trigger's variables.
- `YAML` inputs are text in expressions.
- `errorLogs()`, `render()`, `max()` and `min()` fail. See [Retries, errors and timeouts](./error-handling.md) for how to react to a failure without `errorLogs()`.

## Further reading

- [Inputs and outputs](./inputs-and-outputs.md)
- [Flow YAML reference](./yaml-reference.md)
- [Kestra's documentation](https://kestra.io/docs), for the language itself
