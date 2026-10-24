---
sidebar_position: 1
---

# Dashboards

A dashboard puts several [charts](../charts/index.md) on one page, next to text, links and filters, so a team can read a topic at a glance. You build it once from saved charts, and everyone with access sees the same layout and the same live data.

![The Dashboards list with two folders, a certified dashboard and a starred one](/img/platform/dashboards/list.png)

This page covers the **Dashboards** list and how to create a dashboard. The other pages in this section go deeper:

| Page | What it covers |
|---|---|
| [Edit a dashboard](./editing.md) | Edit mode, the 24-column grid, tabs, sections, width |
| [Cards and card settings](./cards.md) | Chart, heading, text, link and iframe cards, and what you can set on each |
| [Dashboard filters](./filters.md) | Add filters, choose types, wire them to chart columns |
| [Use filters and URL parameters](./using-filters.md) | The filter bar, auto-apply, links that carry filter values |
| [Interactivity](./interactivity.md) | Click behaviour, cross-filtering, the drill menu |
| [Fullscreen and auto refresh](./view-options.md) | Viewing options for wall screens |
| [Info, history and certification](./info-and-history.md) | The info sidebar, revisions, the Certified mark |
| [Share a dashboard](./sharing.md) | Grants, roles and who can see or edit |
| [Organize dashboards](./organize.md) | Folders, favorites, duplicate, trash |
| [Export, reports and print](./export-and-reports.md) | Download card data, subscribe, scheduled report rendering |

## Create a dashboard

1. Go to **Explore → Dashboards** and press **+ Dashboard**.
2. Enter a **Name**. It is required; an empty name shows the message "Name required".
3. Optionally enter a **Description**. Leave it empty to store no description.
4. Press **Create** (or press Enter in the name field).

![The New dashboard dialog with a name and a description filled in](/img/platform/dashboards/new-dialog.png)

The new dashboard opens in view mode and says "No cards yet. Click **Edit** to add charts." Press **Edit** and add your first chart, as described in [Edit a dashboard](./editing.md). New dashboards use the **fixed** width (a centred canvas 1048 px wide); switch **Full width** on while editing if you want the canvas to use the whole page.

:::note
You need the workspace permission `dashboard:manage` to create or edit dashboards. People without it see the list and can open dashboards, but the **+ Dashboard** button, **Edit**, and every menu item that changes something are hidden rather than greyed out.
:::

## The Dashboards list

The page header has four toolbar buttons next to **+ Dashboard**. Hover a button to see its name.

| Button | What it does |
|---|---|
| **Bookmarks** (star) | Shows only the dashboards you starred. Press again to show all. |
| **Bulk select** (checklist) | Adds a checkbox to every row. Select rows, then use **Move n to folder…** or **Move n to Trash**. Shown only if you can manage dashboards and at least one dashboard exists. |
| **Trash** | Switches the list to trashed dashboards. See [Organize dashboards](./organize.md#trash). |
| **New folder** | Creates a folder to group dashboards. |

Below the search box, a summary line counts the dashboards on screen and the folders that exist, for example "4 dashboards · 2 folders". In the Trash view it counts only the trashed dashboards, and **+ Dashboard** is not shown there.

### Search and sort

**Search dashboards…** filters the list by name as you type. The match is case-insensitive and looks for the text anywhere in the name. Click a column header to sort by **Name**, **Cards** (the number of cards on the dashboard) or **Updated**; click again to reverse. The default is **Updated**, newest first.

### Rows

Each row shows a star, the dashboard name, the card count and when it was last updated.

- The **star** adds or removes the dashboard from your bookmarks. Bookmarks belong to you; other people do not see them.
- A green check mark after the name means the dashboard is **Certified**. See [Info, history and certification](./info-and-history.md#certification).
- The **⋯** menu on the right holds the row actions.

![The row menu for a dashboard](/img/platform/dashboards/row-menu.png)

| Menu item | What it does |
|---|---|
| **Open** | Opens the dashboard. The only item a reader without manage rights sees. |
| **Duplicate** | Copies the dashboard, then opens the copy. The copy is named "*name* (copy)". |
| **Move to "folder"**, **Move to new folder…** | Puts the dashboard in a folder, or in a new one you name. |
| **Share…** | Opens the sharing dialog. See [Share a dashboard](./sharing.md). |
| **Subscribe…** | Opens the New report form with this dashboard already chosen. See [Export, reports and print](./export-and-reports.md). |
| **Move to Trash** | Asks *Move to Trash?* ("*name*" moves to the Trash. You can restore it from there.), then moves the dashboard to the trash. |

When the workspace has at least one dashboard folder, the list groups rows under folder headings, with an **Uncategorized** group for the rest. See [Organize dashboards](./organize.md).

### Empty state

In a workspace without dashboards the page shows "No dashboards yet. Compose charts into a shareable dashboard." and a **Create your first dashboard** button.

## The dashboard page

Open a dashboard by clicking its name.

![A dashboard in view mode with two tabs, four filters and several cards](/img/platform/dashboards/view.png)

From left to right the header holds:

- the dashboard name;
- a **star** to bookmark it (shortcut `o`);
- a **clock** button for **Refresh now** and **Auto Refresh** ([Fullscreen and auto refresh](./view-options.md));
- **Fullscreen**;
- an **info** button that opens the sidebar with the description and history (shortcut `]`);
- a **⋯** menu with **Reset all filters**, folder moves, **Duplicate** and **Move to trash**;
- **Edit**, for people who can manage the dashboard (shortcut `e`).

Under the header you find, in order: the tab bar (only when the dashboard has two or more tabs), the filter bar, and the card grid.

## Limits and known issues

- The list has no pagination; it loads every dashboard in the workspace.

## Further reading

- [Charts](../charts/index.md) for building the charts you place on a dashboard
- [Edit a dashboard](./editing.md)
- [Alerts & reports](../alerts-and-reports/index.md)
