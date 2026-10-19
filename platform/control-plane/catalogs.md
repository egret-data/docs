---
sidebar_position: 5
---

# Catalogs

Every catalog the platform knows about: egret warehouses and external metastores alike. Attach a catalog to an engine to make it queryable, and assign it to a workspace to let that workspace see it.

![Catalogs](/img/platform/control-plane-catalogs.png)

The header counts catalogs, those attached to an engine and those needing attention. The table shows **Kind** (for example *egret warehouse*), the number of **Engines** it is attached to, the **Workspaces** that can see it and its **Status**. **New catalog** creates one.

An *egret warehouse* is an Iceberg REST catalog embedded in the platform and stored on one of the [storage connections](./storage).
