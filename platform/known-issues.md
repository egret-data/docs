---
sidebar_position: 11
---

# Known issues and roadmap

A running list, collected while writing these docs against a running instance, of defects, rough UX
and missing pieces. Entries are **recorded, not fixed**; they feed the product roadmap.

*Severity:* **S1** blocks a task · **S2** wrong or misleading, has a workaround · **S3** polish.
*Status:* **open** unless stated. **verify** means observed once and not yet reproduced.

| ID | Area | Type | Sev | Description |
|---|---|---|---|---|
| KI-001 | Databases | UX | S2 | Registering a dataset against a Trino without `http-server.process-forwarded=true` fails with a generic *502 Bad Gateway*. Egret always sends `X-Forwarded-Proto` and Trino answers HTTP 406. The UI should say what is wrong. |
| KI-002 | Auth | UX | S3 | Local sign-in is limited to 5 attempts per 5 minutes and rejected (429) attempts keep the window open. There is no message telling the user when they can retry. |
| KI-003 | Dashboards | UX | S2 | A chart that is not fully configured (no X-axis) renders as an **empty card** on a dashboard, with no hint, while the chart editor says *Set up your Bar*. |
| KI-004 | SQL Lab | UX | S3 | Floating-point results are shown with representation noise (`63339475.32000001`). Provide display rounding or a number format in results. |
| KI-005 | Workspace settings | UX | S3 | The Workspace settings page shows two **Collapse** buttons (the app sidebar and the settings sidebar). |
| KI-006 | SQL Lab | Defect? | S2 | verify: typing a long statement quickly into the editor via browser automation produced scrambled characters (autocomplete interference). Inserting the text at once works. Needs a manual check with a real keyboard. |
| KI-007 | Naming | Consistency | S3 | The UI calls them *Engines* (Workspace settings → Engines), the API and parts of the code call them *databases*, and the Control Plane has its own *Engines*. Pick one vocabulary. |
| KI-008 | Charts | UX | S3 | Saving an existing chart takes two steps: **Update** opens a dialog and a second **Update** confirms. |
| KI-009 | Charts API | Docs | S3 | Creating a chart through the API requires `params.version = 2` and a `settings` object; the axis mapping lives in `settings`, not in `spec.dimensions`. Charts created with only `spec` load with the X-axis empty. Document the payload. |
| KI-010 | Dashboards | Docs | S3 | The dashboard grid is 24 columns wide; this is not stated anywhere in the UI or API reference. |
| KI-011 | Databases | UX | S3 | A newly created connection shows status *Unknown* until **Test** is pressed, even though creation already validated reachability. |
| KI-012 | Workspace settings | UX | S3 | The Notifications page does not follow the layout of the other settings tabs: the heading is offset, and Encryption is an unstyled native select. |
| KI-013 | Workflows | UX | S1 | With the default config the workflow worker is **off**. *Run* succeeds and the execution sits in *Running* indefinitely (one waited 53 s until the worker was enabled). Only the Triggers page warns; Run, Flow and Executions give no hint. |
| KI-014 | Workflows | UX | S3 | A new flow shows *Version —* in its header, and *Run* says it runs "the saved draft"; it is unclear what a version is until **Create version** is pressed. |
