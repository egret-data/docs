---
sidebar_position: 7
---

# Notifications

**Workspace settings → Notifications** configures how alerts and reports leave the platform. Each workspace has its own identity, so two teams never share a sending address or reputation.

![Notification settings](/img/platform/settings-notifications.png)

## Email (SMTP)

| Field | Meaning |
|---|---|
| **SMTP host**, **Port** | The mail relay. |
| **Encryption** | Chosen explicitly (for example *STARTTLS, usually port 587*) rather than guessed from the port, because guessing wrong can send credentials in the clear. |
| **Username**, **Password** | Relay credentials. |
| **From address**, **From name** | The sender shown on messages. |

Press **Save**, then **Send test message**. A test message is the only way to tell *configured* from *configured correctly* before an alert needs to fire.

## Slack

One bot app per workspace. Enter the **Bot token** and a **Default channel**. A schedule's Slack destination names a channel; the credential lives here.
