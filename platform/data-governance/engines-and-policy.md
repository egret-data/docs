---
sidebar_position: 4
---

# Engines & policy

**Governance → Engine & policy** is where policy reaches the query engines. Each engine downloads one **policy profile**; open an engine to grant engine permissions and see its policies.

![Engine and policy](/img/platform/governance-engines.png)

The header counts **engines**, **profiles without an engine** and **hand-written policies**. **New profile** creates a policy profile. Engines themselves are created in [Control Plane → Engines](../control-plane/query-engines), where a registered engine can be bound to a profile.

Egret acts as the Apache Ranger admin for the engines: the Ranger plugin on Trino or StarRocks downloads the profile and enforces it, including row filters and column masks.
