---
sidebar_position: 7
---

# Notifications

**Workspace settings → Workspace → Notifications** sets how the workspace sends alerts and reports: the SMTP relay and from-address for email, and one Slack bot for Slack messages. Every workspace has its own settings, so two teams never share an identity or a sending reputation.

![The Notifications page with SMTP settings for the demo mail catcher and the Slack section](/img/platform/admin/ws-notifications.png)

*Alerts and reports in this workspace send mail through this relay, as this from-address.* Reading and changing the settings needs `workspace:manage_members` in the workspace, which workspace admins hold (the API checks it on every request); the page is not listed for anyone else. Over the API, `GET /api/ws/{ws}/notifications/smtp` and `GET /api/ws/{ws}/notifications/slack` answer `200` with the stored settings, or `204` with no body while nothing is configured (before platform #748 they answered `404`). The destinations themselves (an email recipient list, a Slack channel) are chosen on each alert or report in [Alerts & Reports](../explore/alerts-and-reports).

## Email (SMTP)

### Fields

| Field | Meaning |
|---|---|
| **SMTP host** | The relay's host name, for example `smtp.example.com`. Required. |
| **Port** | The relay's port. Default `587`. |
| **Encryption** | **STARTTLS (usually port 587)** (default), **TLS (usually port 465)** or **None — trusted internal relay only**, in a drop-down list. Chosen explicitly rather than guessed from the port: guessing wrong can mean credentials sent in the clear. |
| **Username** | The login for the relay. Optional. |
| **Password** | The relay password. Never shown again: the field starts empty and shows *Unchanged* when one is stored. |
| **From address** | The sender, for example `alerts@example.com`. Required, and must contain `@`. |
| **From name** | The display name, for example *Egret Alerts*. Optional. |

### Save the settings

1. Fill **SMTP host**, **Port**, **Encryption**, **Username**, **Password**, **From address** and **From name**.
2. Press **Save**. The **Remove** button appears once settings are stored.

An untouched password field is omitted from the save so the stored password is kept; leaving it empty after clearing is how you remove it. The password is stored as a secret, not in the settings row.

When settings exist a **Remove** button deletes them (*Settings removed.*), after which alerts cannot send email.

### Send a test message

*A test message is the only way to tell "configured" from "configured correctly" before an alert needs to fire.* Press **Send test message**. Egret sends a probe to the from-address through the relay. On success: *Test message sent. Check the inbox for the from-address.* On failure the relay's own error text is shown verbatim, because "authentication failed" and "connection refused" send you to different places. The button is disabled until settings are saved.

## Slack

*One bot app for the workspace. A schedule's Slack destination names a channel; the credential lives here.*

| Field | Meaning |
|---|---|
| **Bot token** | The bot's OAuth token, for example `xoxb-…`. It needs the `chat:write` scope, and the bot must be invited to each channel. When one is stored the field shows *Unchanged* and the note *A token is stored. Leave blank to keep it.* |
| **Default channel** | Optional, for example `#data-alerts`. Shown as a hint when adding a destination. |

Press **Save Slack settings** (*Slack settings saved.*). The token field then says *A token is stored. Leave blank to keep it.* **Remove Slack app** deletes the token and channel (*Slack settings removed.*).

### Set up Slack

1. In Slack, create an app with a bot user and the `chat:write` scope, and install it to your Slack workspace.
2. Copy the **Bot User OAuth Token** (`xoxb-…`) into **Bot token**.
3. Invite the bot to the channels alerts will post to (`/invite @your-bot`).
4. Save, then create an alert whose destination is the Slack channel.

## Example: the demo mail catcher

On the Docker demo stack every mail goes to Mailpit (`http://localhost:8025` on the host). For the workspace *Docs sandbox*:

1. **SMTP host** `mailpit`, **Port** `1025`, **Encryption** **None — trusted internal relay only**, no username or password.
2. **From address** `docs-sandbox@egret.local`, **From name** *Docs sandbox alerts*. Press **Save**.
3. Press **Send test message**. The page says *Test message sent. Check the inbox for the from-address.*, and Mailpit shows the mail *egret test message* from *Docs sandbox alerts*.

The demo seed configures the `default` workspace the same way. The demo stack has no Slack: a token saved there is stored, but nothing can be delivered to Slack.

## Example: a production relay

For a finance workspace: SMTP host `smtp.corp.example`, port `587`, **STARTTLS**, username `alerts-bot`, from address `finance-alerts@corp.example`, from name *Finance Alerts*. Slack default channel `#finance-alerts`.

## Limits and known issues

- Passwords and tokens are write-only. You cannot read them back; replace them to change them.

## Further reading

- [Alerts & Reports](../explore/alerts-and-reports)
- [Members](./members.md)
