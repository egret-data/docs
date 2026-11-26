---
sidebar_position: 5
---

# HTTP trigger

`io.kestra.plugin.core.http.Trigger` is a **polling** trigger: on a fixed interval egret makes an HTTP request, checks the response against a condition, and starts the flow when the condition holds. Use it to start a flow when an external endpoint reports that something is ready.

```yaml
triggers:
  - id: poll_status
    type: io.kestra.plugin.core.http.Trigger
    interval: PT1M
    uri: https://api.example.com/jobs/latest
    method: GET
    responseCondition: "{{ response.statusCode == 200 and response.body contains 'READY' }}"
    labels:
      source: poller
```

## How it fires

1. Every `interval`, egret sends the request (`uri`/`method`/`body`/`params`/`headers`/`contentType`) through the platform's outbound-HTTP guard.
2. It renders `responseCondition` against the response and fires the flow only when the condition is truthy. A non-matching poll does nothing; the next poll is one interval later.
3. When it fires, the response is bound as `{{ trigger.* }}` — `trigger.code`, `trigger.body`, `trigger.headers`, `trigger.uri` — so the flow's tasks can read what the poll returned.

A failed HTTP **status** (4xx/5xx) is delivered to `responseCondition` as `response.statusCode`; it is not an error. Only a **transport** failure (the host cannot be reached, or the allowlist blocks it) is a trigger error — see `failOnTriggerError` below.

## Properties

| Property | Meaning | Default |
|---|---|---|
| `uri` | The URL to poll. | required |
| `method` | HTTP method. | `GET` |
| `interval` | ISO-8601 duration between polls. | `PT1M` |
| `responseCondition` | An expression over `response.statusCode`, `response.body`, `response.headers`; the flow fires when it is truthy. | `{{ response.statusCode < 400 }}` |
| `body`, `params`, `headers`, `contentType` | The request body, query parameters, headers and content type. | none / `application/json` |
| `when` | A further condition (over the response and `trigger.*`) that must also be truthy to fire. | none |
| `labels` | Labels added to the fired execution (rendered). | none |
| `stopAfter` | End states that switch the trigger off after a fired execution reaches one of them. | none |
| `allowConcurrent` | `false` holds the next poll while the previous execution is still running. | `false` |
| `failOnTriggerError` | `true` starts a failed execution when a poll raises a transport error; otherwise the error is only logged. | `false` |

## The outbound-HTTP allowlist

An HTTP trigger reaches the network, so its `uri` host must be on the platform's outbound allowlist (`workflow.http.allow_hosts`, the same guard the `io.kestra.plugin.core.http.Request` task uses). A host that is not allowed — or a private/loopback address — is blocked, the poll does not fire, and the reason is recorded on the trigger. Secrets resolve in the request fields with `{{ secret('NAME') }}` and are masked in logs and errors.

## Not supported

`options` (the HTTP configuration block), `encryptBody` and `formData` are not modelled. A trigger that declares one of them draws a publish warning and does not poll until you remove it.

## Divergences from Kestra

- egret polls from its single scheduler (claim → commit → poll outside the lock → fire), not a separate worker; the interval is best-effort around the scheduler's cadence.
- The outbound allowlist gates the poll (an egret security control).
- A `secret()` embedded in the `uri` appears, resolved, in the bound `trigger.uri` output — the same behaviour as the `http.Request` task's output.

## Further reading

- [Triggers](./index.md)
- [Schedule triggers](./schedule.md)
