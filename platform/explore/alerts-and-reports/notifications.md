---
sidebar_position: 5
---

# Notifications

The **Notification** tab says who hears about an alert or report, through which channels, and what the message says. The email server and the Slack app themselves are configured once per workspace under [Workspace settings → Notifications](../../workspace-settings/notifications); this tab only chooses where each item sends.

![The Notification tab with an email, a webhook and a Slack destination](/img/platform/alerts/editor-destinations.png)

## Deliver to

Under **Deliver to**, press **Add delivery method** and choose **Email**, **Slack** or **Webhook**. You can add several destinations, including several of the same kind, and remove one with its trash icon. An item with no destination still runs and records its result, but tells nobody.

### Email

| Field | What it does |
|---|---|
| **Addresses** | Comma-separated recipients, for example `ops@example.com, data-team@example.com`. |

All addresses on one email destination receive a single message. The triggering rows are attached as a CSV file. Sending needs SMTP configured for the workspace; without it the run records the error `smtp is not configured for this workspace`.

### Slack

| Field | What it does |
|---|---|
| **Channel** | The channel to post to, for example `#data-alerts`. |

The credential lives in the workspace's Slack app, set in **Workspace settings → Notifications**. The bot needs the `chat:write` permission and an invite to the channel. Slack receives the message text only, not the rows. Without a configured app the run records `no slack bot token is configured for this destination`.

### Webhook

| Field | What it does |
|---|---|
| **URL** | The endpoint Egret sends a `POST` to. |
| **Signing secret** | Optional. When set, each request carries an `X-Egret-Signature` header with the hex HMAC-SHA256 of the request body, so the receiver can check it came from Egret. A stored secret shows as **Unchanged**; **Remove the stored secret** clears it on save. |

The request body is JSON:

```json
{
  "schedule": "Pending orders above 100",
  "schedule_id": "712ee132-5284-4d0f-9534-067005936311",
  "type": "alert",
  "state": "success",
  "value": 363.0,
  "triggered_at": "2026-10-19T16:18:48.753805Z",
  "rows": [{ "n": 363 }]
}
```

The field names are fixed. `type` names the kind of item (`alert` for an alert), `state` is the run state, `value` is the measured number, and `rows` holds the triggering rows as JSON objects. The values above are illustrative: this walk-through could not deliver to a receiver because loopback webhooks are blocked, so the payload shape comes from the source, not from a captured request.

Verify a signature by computing the HMAC-SHA256 of the raw body with your secret and comparing it, in constant time, with the header:

```bash
printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET"
```

Webhook delivery has guard rails:

- The request times out after 10 seconds, and redirects are **not** followed, because a redirect would be a second destination that bypasses the checks.
- A destination that resolves to a private, loopback or link-local address is refused before any request is sent: `webhook host resolves to a blocked address (127.0.0.1): loopback`. An operator can allow specific in-cluster hosts with the `automation.webhook_allow_hosts` setting.
- A response that is not `2xx` is recorded as `webhook returned 500`, for example.

## Message

| Setting | What it does | Default |
|---|---|---|
| **Email subject** | The subject line. Placeholders: `{{date}}`, `{{time}}`, `{{datetime}}`, `{{day}}`, `{{month}}`, `{{year}}`, `{{weekday}}`, `{{name}}`. Dates and times use the schedule's timezone. | `[egret] name triggered` |
| **Opening note** | Plain text above the result, at the top of the notification. Say why the alert exists and who to ask. | Empty |
| **Closing note** | Plain text below the result, before the link back to Egret. Say what to do about it. | Empty |

## Attachment

For an **alert**, **Also show a chart or dashboard** attaches a rendering of a chart or dashboard next to the numbers.

| Setting | What it does |
|---|---|
| **Attachment object type** | **A dashboard** or **A chart**. |
| **Attachment object** | Which one. |
| **Attachment format** | **PNG image, shown here in the message** or **PDF, as a file**. |
| **Image width (px)**, **Image height (px)** | Override the rendered size. They take effect only when both are set; leave either blank and both fall back to the default size. |

Rendering a chart or dashboard needs the rendering service; see [Reports](./reports#png-and-pdf-need-the-renderer).

## Delivery

### Don't send when there are no rows

For an alert, tick this to skip the notification when the query returned no rows. The run still happens and is recorded as **Not triggered**; only the message is skipped. Reports and Data API alerts do not read this setting.

## When delivery fails

A failed delivery does not fail the run. The alert already fired, so the run is recorded as **Success** and the grace period starts, and the delivery error is shown in the run log's **Detail** column. When an item has several destinations, only the first error is recorded. See [Run history](./run-history).

## Limits and known issues

- Webhooks to loopback and private addresses are blocked unless an operator allow-lists the host, so a local receiver cannot be used for testing without that setting.
- Slack messages do not carry the rows.

## Further reading

- [Workspace settings → Notifications](../../workspace-settings/notifications)
- [Run history](./run-history)
