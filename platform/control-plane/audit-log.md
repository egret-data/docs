---
sidebar_position: 7
---

# Audit log

Every authorization decision and grant change, newest first. Platform-admin only.

![Audit log](/img/platform/control-plane-audit-log.png)

Filter by **Kind**, **Decision**, **Action** (for example `secret:read`) and a **From**/**To** time range. Each row shows the time, the actor, the action, the resource, the decision (*allow* or *deny*) and a detail.
