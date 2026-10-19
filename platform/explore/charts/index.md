---
sidebar_position: 1
---

# Charts

A chart is a saved question about a [dataset](../datasets-and-metrics.md): which dimensions to group by, which metrics to measure, how to draw the result. Charts are the building blocks of [dashboards](../dashboards.md), and they can be sent on a schedule by a subscription.

![The Charts list with its toolbar, search box, type filter and the chart rows](/img/platform/charts/list.png)

Egret has 19 chart types. This section documents the **Charts** page, the editor you build charts in, and one page per chart type with every setting in the order the editor shows it.

## The Charts list

Go to **Explore → Charts**. The list shows one row per chart with its **Name**, **Type** and when it was **Updated**. A star in front of the name marks a bookmark. A summary line above the table counts the charts (and folders) that match the current filters.

| Control | What it does |
|---|---|
| **Search charts…** | Matches the chart name or its type name, as you type. |
| **Type** | Filters to one chart type. The menu lists only the types you have at least one chart of. |
| **Name**, **Type**, **Updated** headers | Click to sort. The default is **Updated**, newest first. Click again to reverse. |
| Star toolbar button (**Bookmarks**) | Shows only bookmarked charts. |
| Checklist toolbar button (**Bulk select**) | Adds a checkbox to every row. Select charts, then move them to a folder or **Move N to Trash**. It appears once at least one chart exists. |
| Trash toolbar button (**Trash**) | Switches the page to the Trash view (see [Trash](#trash)). |
| Folder toolbar button (**New folder**) | Creates a folder. Folder names are free text. |
| **+ Chart** | Starts a new chart. |

The star beside a chart name toggles its bookmark. Bookmarks belong to you, not to the workspace.

### Row actions

The **⋯** menu at the end of a row offers:

- **Open**: the same as clicking the name.
- **Duplicate**: creates a copy named *name* **(copy)** in the same workspace, and shows a **Duplicated** toast.
- **Move to "*folder*"**: one item per folder, disabled for the folder the chart is already in. **Remove from folder** appears for a chart that is in a folder.
- **Move to new folder…**: asks for a name, creates the folder and moves the chart into it.
- **Share…**: opens the sharing dialog for the chart.
- **Subscribe…**: opens a new **Alerts & Reports** report with this chart already chosen as its target.
- **Move to Trash**.

### Folders

Press the folder toolbar button (**New folder**) to create a folder; the dialog asks for a name. Once you have a folder, the list is grouped into collapsible sections: the folders in alphabetical order, then **Uncategorized**. Each header shows the number of charts in the section and a **⋯** menu to share, rename or delete the folder. Drag a row onto a folder header, or use the row menu, to move a chart. Deleting a folder does not delete its charts: they move to **Uncategorized**.

![The Charts list grouped by folder: the Q4 reporting folder with one bookmarked chart, then Uncategorized](/img/platform/charts/list-folders.png)

While a search, type filter or bookmark filter is active, the sections stay, but folders with no matching chart are hidden.

### Bulk select

The checklist toolbar button turns on a checkbox column. Tick charts (the header checkbox selects every visible row), then use **Move *n* to folder…** or **Move *n* to Trash** next to the **Type** filter. Collapsed folders are not included in **select all**.

![Bulk select with one chart selected](/img/platform/charts/list-bulk.png)

### Trash

**Move to Trash** is reversible. The trash toolbar button switches the page to the **Trash** view, with its own search box. Each trashed chart has **Restore** and **Delete permanently** in its menu. The Trash view has no folders, bookmarks or bulk select.

![The Trash view](/img/platform/charts/list-trash.png)

**Delete permanently** cannot be undone, and asks you to type `delete` before the **Delete** button turns on.

![The Delete permanently confirmation](/img/platform/charts/list-delete-confirm.png)

## Create a chart

1. Go to **Explore → Charts** and press **+ Chart**. On an empty workspace the button is **Create your first chart**.
2. On **Choose a visualization**, pick a chart type. Use **Search chart types…** to filter by name or description.
3. In the editor, open the **Data** tab and pick a **Dataset**.
4. Fill in the fields the preview asks for. The preview shows **Set up your *type*** with a hint such as **Add: X-axis, a metric** until the required fields are set.
5. Press **Save**, enter a **Name** and an optional **Description**, and press **Save** again.

![A new bar chart before any field is set: the preview asks for the missing fields](/img/platform/charts/new-empty.png)

After saving, Egret opens the chart at its own address and the button on the toolbar changes from **Save** to **Update**.

You can also start from a dataset: the dataset's detail page has a **Create chart** button. See [The chart editor](./the-chart-editor.md) for the editor layout, running queries, exporting and drilling.

![The chart type gallery](/img/platform/charts/type-gallery.png)

## Choose a chart type

Every card in the gallery shows a name and a one-line description. Pick the one that fits the question.

| You want to | Use |
|---|---|
| Compare a metric across categories | [Bar](./bar.md) or [Row](./row.md) (many categories, sorted) |
| Show a trend over time | [Line](./line.md) or [Area](./area.md) |
| Mix a count and an amount on one chart | [Combo](./combo.md) |
| See how two metrics relate, optionally sized by a third | [Scatter](./scatter.md) |
| Show each category's share of a total | [Pie](./pie.md) |
| Show one headline number | [Big number](./number.md) |
| Show one number against a target | [Progress](./progress.md) or [Gauge](./gauge.md) |
| Show the latest value and its change | [Trend](./trend.md) |
| Show drop-off between stages | [Funnel](./funnel.md) |
| Show how increases and decreases add up | [Waterfall](./waterfall.md) |
| Show the spread of a value per category | [Box plot](./box-plot.md) |
| Show flows from one category to another | [Sankey](./sankey.md) |
| Shade regions or pin coordinates on a map | [Map](./map.md) |
| List rows, or aggregate and sort them | [Table](./table.md) |
| Cross-tabulate rows against columns with totals | [Pivot Table](./pivot-table.md) |
| Read one record field by field | [Object detail](./object-detail.md) |

The rest of the section covers the settings that several types share:

- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings.md)
- [Column formatting and number formats](./column-formatting.md)
- [Conditional formatting](./conditional-formatting.md)

## Save and update

The **Save** (or **Update**) button on the editor toolbar opens a dialog with **Name** and **Description**. Saving a new chart creates it and moves you to its page. Saving an existing chart overwrites it in place: there is no version history for charts.

![The Update chart dialog with the name and description](/img/platform/charts/editor-save-dialog.png)

Saving fails with a message in these cases:

| Message | Cause |
|---|---|
| **Pick a dataset** | No dataset is selected. |
| **Name required** | The **Name** field is empty or blank. |
| **This chart needs …** | A required field for the type is missing, for example **This chart needs X-axis and a metric**. |

If you change anything and try to close or reload the tab without saving, the browser shows its own "leave site?" prompt. Moving to another page inside Egret does not prompt.

:::note
Charts do not have a separate filter builder. Filters come from drilling into a chart: clicking a value and choosing **Filter by …** adds a filter chip above the chart, and the chip is saved with the chart. See [The chart editor](./the-chart-editor.md#drill-through).
:::

## Limits and known issues

- A chart returns at most **10,000** rows. Larger **Row limit** values are clamped.
- A chart runs a single query against one dataset.
- Chart types and settings that Egret does not have, compared to other BI tools, are listed on each type's page under **Limits and known issues**.

## Further reading

- [The chart editor](./the-chart-editor.md)
- [Datasets & metrics](../datasets-and-metrics.md)
- [Dashboards](../dashboards.md)
- [Alerts & reports](../alerts-and-reports.md)
