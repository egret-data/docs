---
sidebar_position: 4
---

# First login tour

How people sign in to Egret, what the single sign-on and break-glass logins are for, and where things are in the app.

## Sign in

The sign-in page changes with the server configuration.

| Configuration | What the page shows |
|---|---|
| Single sign-on off (`oidc.enabled = false`, the default) | An email and password form. |
| Single sign-on on | **Sign in with SSO**, and a small **Admin sign-in (break-glass)** link below it. |

![The sign-in page with single sign-on enabled](/img/platform/ops/get-started/sign-in.png)

### Sign in with SSO

1. Press **Sign in with SSO**. The browser goes to your identity provider.
2. Sign in there. In the development stack the provider is Keycloak and the realm `egret` has three users:

   | User | Password | Group claim |
   |---|---|---|
   | `admin-sso` | `Admin12345!` | `platform-admins` |
   | `member-sso` | `Member12345!` | `data-team` |
   | `tester` | `pw` | `data-team` |

   ![The Keycloak sign-in form for the egret realm](/img/platform/ops/get-started/sso-keycloak.png)

3. The provider sends the browser back to Egret. Egret creates your account the first time it sees your identity (matched
   by the token's `sub`), updates your name and email on every sign-in, and joins you to the groups named in the token's
   `groups` claim.

:::note A new SSO user starts with no access
Egret creates the account as a plain member. What a person can do comes from roles granted to their **groups**, and those
grants are made by an administrator: assign a platform role to the group under **Control Plane → Groups**, or add the group
to a workspace under **Manage → Workspace settings → Members**. From a terminal, `egret workspace add-group --workspace
<slug> --group <idp-group> --role ws_editor` does the second one. Until a grant exists, the person can sign in and see
nothing useful.
:::

### Break-glass administrator

The local administrator account created by `egret init` keeps working when single sign-on is on. It is the way in when the
identity provider is down or misconfigured.

1. Press **Admin sign-in (break-glass)**. The email and password form appears under the SSO button.

   ![The sign-in page with the break-glass form open](/img/platform/ops/get-started/sign-in-break-glass.png)

2. Enter the administrator's email (`admin@egret.local` unless you set `EGRET_ADMIN_EMAIL`) and password, then press
   **Sign in**.

Treat this account like a root password: use it to set up single sign-on and to recover, and give day-to-day
administrators a platform role through their IdP group. The [security checklist](../deploy-operate/security-hardening)
covers securing it.

### Errors on the page

| Message | Meaning |
|---|---|
| *Invalid email or password* | The email and password do not match a local account. |
| *Too many attempts. Please wait a few minutes and try again.* | The local sign-in limit (5 attempts per 5 minutes) was exceeded. Successful attempts count too. |

For SSO errors see [SSO errors](../deploy-operate/troubleshooting/sso-errors).

## The layout

After signing in you land in **SQL Lab** of your default workspace.

![SQL Lab, the first page after signing in](/img/platform/ops/get-started/explorer-home.png)

### The top bar

| Control | What it does |
|---|---|
| Workspace picker (top left) | Switches between the workspaces you belong to. |
| **Explorer** | Everyday work inside the current workspace. |
| **Governance** | Data access policy and classification. |
| **Control Plane** | Platform administration. Visible with platform permissions. |
| Theme toggle | Light and dark theme. |
| Account menu (your initials) | Shows who you are signed in as, and **Log out**. |

### The Explorer sidebar

| Section | Pages |
|---|---|
| **Explore** | [SQL Lab](../explore/sql-lab), [Datasets](../explore/datasets-and-metrics), [Charts](../explore/charts), [Dashboards](../explore/dashboards), [Apps](../explore/apps), [Alerts & Reports](../explore/alerts-and-reports) |
| **Data API** | [Endpoints](../data-api/endpoints), [Clients](../data-api/clients), [Activity](../data-api/activity) |
| **Workflows** | [Flows](../workflows/flows), [Executions](../workflows/executions), [Namespaces](../workflows/namespaces), [Triggers](../workflows/triggers) |
| **Manage** | [Workspace settings](../workspace-settings/general) |

Use <kbd>⌘</kbd>+<kbd>K</kbd> for the command palette, and **Collapse** at the bottom to shrink the sidebar.

:::tip Where do I register a database?
Under **Manage → Workspace settings → Engines**, not under Explore. See [Databases](../workspace-settings/databases), or
follow the first step of [Your first dashboard](./first-dashboard).
:::

## Next

- [Your first dashboard](./first-dashboard)
