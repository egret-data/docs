---
sidebar_position: 1
---

# Flows

A flow is a set of tasks written in YAML. It runs when you start it or when a trigger fires.

![Flows](/img/platform/workflows-flows.png)

:::warning The workflow worker is off by default
The platform only queues executions until the worker is enabled with `EGRET_WORKFLOW__WORKER_ENABLED=true`
(and `EGRET_WORKFLOW__SCHEDULER_ENABLED=true` for triggers). With the worker off, **Run** succeeds but the execution waits in *Running*
until a worker starts. Only the Triggers page warns about this today.
:::

## Create a flow

Press **New flow**. The editor opens with a starter flow and a **Docs** panel generated from the flow schema.

![The flow editor](/img/platform/workflows-flow-new.png)

```yaml
id: hello
namespace: company.team
tasks:
  - id: hello
    type: io.kestra.plugin.core.log.Log
    message: Hello from egret
```

The flow's namespace and id come from its `namespace:` and `id:` keys. **Save** creates it. Saving a flow that already exists is rejected with *a flow already exists at company.team/hello in this workspace*.

## A flow's page

![A flow](/img/platform/workflows-flow-detail.png)

A flow has **Edit**, **Revisions**, **Executions** and **Triggers** tabs. **Save** stores the draft, **Create version** publishes a version and **Run** starts an execution of the saved draft. Flows with inputs ask for them before running.
