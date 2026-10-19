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
| KI-015 | Governance | Missing | S2 | **Data Lineage** is in the sidebar but is a placeholder page with no functionality. |
| KI-016 | Control Plane | Defect | S3 | `/control-plane/config` renders a completely blank page inside the shell. |
| KI-017 | Audit log | UX | S2 | Every page view writes `*:read allow` rows, so the audit log is dominated by routine reads and hides grant changes. Offer a default filter or separate reads from changes. |
| KI-018 | Access overview | UX | S3 | *Recent changes* identifies the actor by an id prefix (`by 6d60b4c4`) instead of a name. |
| KI-019 | Roles | Consistency | S3 | Control Plane → Roles lists four workspace roles (including `data_api_invoker`); Workspace settings → Roles & permissions lists three. Verify whether the fourth is hidden on purpose. |
| KI-020 | People & groups | UX | S3 | Every user shows *No username yet*, even users who signed in through SSO. |
| KI-021 | Control Plane | Defect? | S3 | verify: a group (`platform-admins`) mapped from the identity provider gives its member no platform role (Users shows no role for `admin-sso`). Check whether group-to-role mapping is expected to be configured separately. |
| KI-022 | Engines | Limitation | S2 | Engine provisioning (**Add engine**) needs Kubernetes. On a Docker-only setup the only way to attach an engine is **Register external engine**, and the UI does not say so. |

