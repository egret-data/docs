---
sidebar_position: 3
---

# Secrets

Global named secrets that storage and database connections across the platform can reference. **Values are never displayed.**

![Secrets](/img/platform/control-plane-secrets.png)

The table shows each secret's name and its keys (for example `password`, `username`), its **Type** (for example `kubernetes.io/basic-auth`), **Used by** (how many connections reference it) and creation date. A secret that is in use cannot be deleted. **Add secret** creates one.
