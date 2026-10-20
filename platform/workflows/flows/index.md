---
sidebar_position: 1
---

# Flows

A flow is a YAML document that describes a job: its inputs, the tasks to run and what starts it. The **Flows** page lists every flow in the workspace, and each flow has its own page with an editor, a version history, its executions and its triggers.

![The Flows page listing flows grouped by namespace](/img/platform/workflows/flows-list.png)

## Find a flow

Go to **Workflows → Flows**. Flows are grouped in a tree by namespace: `docs.demo` appears as `docs` and then `demo`, with the flow count in brackets. A count includes the namespaces below: on the demo stack `demo (23)` holds the 21 flows of `docs.demo` and the 2 of `docs.demo.sales`.

| Control | What it does |
|---|---|
| **Search flows** | Matches the flow id or the namespace. |
| **Namespace** | Shows one namespace, or **All**. |
| **State** | **Active**, **Disabled**, or **All**. |
| Summary line | Counts the flows that match, split into active and disabled. |

A table row shows the flow's **State**, its latest **Version** (a dash while no version exists), when it was last **Updated** and who it was **Created by**. Press a flow's name to open it.

## Create a flow

1. Go to **Workflows → Flows** and press **New flow**.
2. The editor opens with a starter flow. Replace it with your own YAML.
3. Press **Save** (or **Ctrl/Cmd+S**).

![The new flow page with the starter flow](/img/platform/workflows/flow-new.png)

```yaml
id: hello
namespace: company.team
tasks:
  - id: hello
    type: io.kestra.plugin.core.log.Log
    message: Hello from egret
```

The flow's namespace and id come from the `namespace:` and `id:` keys in the text. There is no separate name field. If a flow with the same namespace and id already exists in the workspace, **Save** is refused and your text stays in the editor.

You can save a flow that has problems. The editor reports them in the **Problems** tab (see [The flow editor](./editor.md)), and **Run** and **Create version** stay disabled until they are fixed.

## A flow's page

Open a flow to see four tabs and a set of actions.

![A flow's page with the code editor and the Docs panel](/img/platform/workflows/flow-editor.png)

The header shows the flow id, a state chip (**Active**, or **Disabled** when the flow or its YAML says `disabled: true`), its latest version (with a **Changes since v1** badge when the saved draft differs from it) and its namespace. The actions are:

| Action | What it does | Needs |
|---|---|---|
| **Save** | Stores the editor text as the flow's draft. Disabled while there is nothing new to save. | `workflow:manage` |
| **Create version** | Opens a dialog with an optional **Note** and freezes the saved draft as the next version. Disabled until the draft is saved and has no errors. | `workflow:manage` |
| **Run** | Starts an execution of the saved draft. Disabled while there are unsaved changes, while the flow has errors, and when the flow is disabled. | `workflow:manage` |
| **Delete** | Removes the flow from the list after a confirmation. Executions already started are not stopped. | `workflow:manage` |

Next to a disabled action the page prints the reason, for example *Run: Save first: Run uses the saved draft*. A person who only has `workflow:read` sees the editor read-only, with no actions.

| Tab | What it shows |
|---|---|
| **Edit** | The multi-panel editor. See [The flow editor](./editor.md). |
| **Revisions** | The versions of this flow. See below. |
| **Executions** | The runs of this flow only, with the same filters as the [Executions](../executions/index.md) page. |
| **Triggers** | This flow's triggers and their switches. See [Triggers](../triggers/index.md). |

![The Executions tab of a flow, with its runs only](/img/platform/workflows/flow-executions.png)

## Run a flow

1. Open the flow and make sure it is saved.
2. Press **Run**.
3. If the flow declares `inputs:`, a form opens: a small dialog for up to three single-value inputs, a side drawer for more. Without inputs, a confirmation opens instead.
4. Fill in the form and press **Run**.

![The run drawer for a flow with four inputs](/img/platform/workflows/flow-run-dialog.png)

The form says *Starts an execution of the saved draft.* Each control matches the input's `type`, starts from the input's `prefill:` or `defaults:` value, and is labelled with its `displayName:` (or its id). The form refuses a missing required value or a value of the wrong shape (for example *Enter a whole number.*) before it sends anything. The page then opens the new execution.

The form cannot enter `ION`, `FORM` or `REUSABLE_INPUTS` inputs. If the flow declares one, the form lists it and the flow cannot be run from the page. See [Inputs and outputs](./inputs-and-outputs.md) for every input type.

:::note
**Run** always uses the saved draft, not the last version. The same is true for the schedule and webhook triggers: a flow does not need a version to run or to fire.
:::

## Versions and revisions

A version is a snapshot of the saved draft that you create on purpose. Versions are for comparing and restoring; they do not change what **Run** or a trigger uses.

1. Save the draft.
2. Press **Create version**.
3. Optionally type a **Note**, such as *What changed in this version*, and confirm. A toast says *Created v2*.

The **Revisions** tab lists versions with their **Version** number, **Author** and **Created** time. The newest has a **Latest** badge, and a version that equals the current draft has a **Matches draft** badge. Select a version and use **Compare with** (**Nothing**, **Current draft** or another version) to see a side-by-side diff. The selected version and the comparison are kept in the address (`?v=1&compare=draft`). **Restore to draft** copies the selected version's text into the editor's draft after a confirmation; unsaved edits in the editor are discarded.

![The Revisions tab comparing v1 with the current draft](/img/platform/workflows/flow-revisions.png)

A flow that has never had a version shows *No versions yet*.

## Disable or delete a flow

Add `disabled: true` at the top level of the YAML and save. A disabled flow shows the **Disabled** chip, cannot be run or replayed, and its triggers do not fire. Remove the line to enable it again. **Delete** removes the flow from the list.

## Limits and known issues

- A flow's page says **Active** for every flow that is not disabled, including a draft that has never had a version.
- The `concurrency:`, `checks:`, `sla:` and `quotas:` keys are accepted but not enforced yet, and flow-level `finally:` and `afterExecution:` are accepted but do not run. See the [YAML reference](./yaml-reference.md).
- Two people editing the same flow: if the draft changed on the server since you opened it, **Save** shows a dialog and asks you to reload before saving.

## Further reading

- [Flow YAML reference](./yaml-reference.md)
- [The flow editor](./editor.md)
- [Task catalogue](./task-catalogue.md)
- [Executions](../executions/index.md)
