---
sidebar_position: 4
---

# Dashboard filters

A dashboard filter lets a viewer narrow every connected card at once, for example to one order status or one date range. You add the filter in edit mode, choose its type, and connect it to a column on each card it should affect. This page covers the setup; [Use filters and URL parameters](./using-filters) covers what viewers do with them.

![The filter settings panel for a category filter, with connection menus on every card](/img/platform/dashboards/edit-filter-settings.png)

## Add a filter

1. Open the dashboard and press **Edit**.
2. Press the funnel icon in the edit toolbar (or press `f`). A filter named **Filter**, of type **Text**, is added after the existing ones and its settings open in the side panel.
3. Change the name and type, then connect it to cards, as described below.
4. Press **Save**.

In edit mode the filters appear as chips above the grid. Click a chip to select that filter and see its settings; drag the grip at the left of a chip to reorder the filters. The order is the order viewers see.

### Name and URL name

The **Name** is the label viewers see on the filter. Each filter also has a **URL name** (the *slug* in the API), a short identifier made of lower-case letters, digits and underscores. It is the filter's name in links (`?order_status=…`, see [Use filters and URL parameters](./using-filters#url-parameters)) and in text cards (`{{order_status}}`). The text card settings list the URL names that exist.

How the URL name is set:

- **A new filter follows its name** until the dashboard is saved. A filter added as **Filter** gets `filter` (then `filter_2`, `filter_3`, … when that is taken), and renaming it to *Order status* before you save changes the URL name to `order_status`.
- **A saved filter keeps its URL name** when you rename it, so links already shared keep working.
- **You can edit it** in the **URL name** box. The new text takes effect when you leave the box or press **Enter**. Egret makes it URL-safe (lower case, every run of other characters becomes `_`) and unique on the dashboard (`region` becomes `region_2` when another filter has `region`). An empty box goes back to the current URL name.

When the URL name changes, every `{{old_name}}` on the same dashboard's cards (text and heading cards, link URLs and labels, **Custom URL** templates) is rewritten to the new name in the draft; `{{old_name_2}}` and other names are left alone. Press **Save** to keep it.

:::caution Links already shared
A link that carries the old name (`?old_name=…`) no longer sets the filter once the URL name is changed and saved: Egret ignores the unknown parameter and the filter takes its default. The help text under **URL name** says so. Share the dashboard again after renaming a URL name. Links on other dashboards or pages that point to this one are not rewritten.
:::

Filters created through the API can set their own slug.

## Filter settings

The panel is titled **Filter settings** and is built like the card settings panel: each field has its label above a full-width picker or box, a choice between a few options is a set of radio buttons, and an on/off setting is a switch. It shows only the controls that make sense for the type you selected, in this order: **Name**, **URL name**, **Type**, **Operator**, **How should people filter on this?**, **Where do values come from?**, **People can pick**, **Default value**, **Required**, **Limit this filter's choices**, **Where this filter appears** and **Delete filter**.

### Name

The label on the filter in the filter bar.

### URL name

See [Name and URL name](#name-and-url-name) above. The help text under the box reads *In links as `?name=…` and in text cards as `{{name}}`. Changing it updates the cards on this dashboard; links already shared stop setting this filter.*

### Type

The kind of value the filter holds. The select shows a label for each type; the API and the rest of this page use the stored key, shown in the second column.

| Type (label) | Key | Use it for | Operators |
|---|---|---|---|
| **Text** | `text` | Free text on a text column | `is`, `is-not`, `contains`, `does-not-contain`, `starts-with`, `ends-with` |
| **Number** | `number` | Numeric columns | `=`, `!=`, `between`, `>=`, `<=` |
| **Date** | `date` | Date and time columns | `range`, `relative`, `single`, `month-year`, `quarter-year`, `all-options` |
| **ID** | `id` | Key columns | `is` |
| **Category** | `category` | A column with a short list of values | `is` |
| **True / False** | `boolean` | True or false columns | `is` |
| **Location** | `location` | Place names | `is`, `is-not` |
| **Time grouping** | `temporal_unit` | The time grouping of date charts (day, month, quarter…) | `is` |

Changing the type resets the operator to the first one in its row.

### Operator

Shown for `text`, `number` and `date` filters. It decides how the value becomes a condition on the connected column. The select shows a label for each operator; the dashboard stores the key, which the API and the **Type** table above use.

| Type | Operator (label) | Key | Condition on the connected column |
|---|---|---|---|
| `text` | **Is** / **Is not** | `is` / `is-not` | equals / does not equal the value |
| `text` | **Contains** / **Does not contain** | `contains` / `does-not-contain` | matches `%value%` / does not match it |
| `text` | **Starts with** / **Ends with** | `starts-with` / `ends-with` | matches `value%` / `%value` |
| `number` | **Equal to**, **Not equal to**, **Greater than or equal to**, **Less than or equal to** | `=`, `!=`, `>=`, `<=` | the comparison with the number |
| `number` | **Between** | `between` | at least the first number and at most the second; either end can stay empty |
| `date` | **Date range** | `range` | between two dates, both inclusive |
| `date` | **Single date** | `single` | equals one date |
| `date` | **Relative date** | `relative` | the last 7, 30, 90 or 365 days up to today |
| `date` | **Month and year** | `month-year` | the whole chosen month |
| `date` | **Quarter and year** | `quarter-year` | the whole chosen quarter of a year |
| `date` | **All options** | `all-options` | a relative window (past, next or current n days, weeks, months, quarters, years) or a specific date (on, before, after, between). |

Dates are compared as calendar dates in UTC.

`id` and `category` filters match any of the chosen values (`in`); an `id` filter with one value matches that value exactly. A `boolean` filter offers **Any**, **True** and **False**. A `location` filter with `is-not` excludes the chosen values.

A `temporal_unit` filter does not filter rows. It changes how a date column on the connected card is grouped, for example from month to quarter. It works only on charts whose date column is already grouped by a time unit.

### How should people filter on this?

Shown for `category`, `id`, `location` and `text` filters.

| Option | Widget |
|---|---|
| **Dropdown** | A list of every value with checkboxes (or radio dots for a single value) and a **Search…** box that narrows the list. Default for the list types. |
| **Search box** | A **Search the values…** box and no list until the viewer types: it says *Type to search the values*, then lists only the values that contain the text. Values already picked stay on show so they can be unticked. Use it for a column with too many values to read as a list. |
| **Input box** | A plain text box where the viewer types the value. |

### Where do values come from?

Shown for `category`, `id` and `location` filters. It decides the list a viewer picks from.

| Option | Source |
|---|---|
| **From the data (distinct)** | The distinct values of the column the filter is connected to, read from the dataset. Default. |
| **Custom list** | A list you type, one value per line. Blank lines are dropped. |
| **From a card column** | Pick one of the chart cards on the dashboard, then one of its columns. The values come from that column's dataset. |

For **From the data**, the values are read from the first card the filter is connected to. A filter that is not connected to any card has no list.

### People can pick

Shown for `category`, `location` and `id` filters, except when the widget is **Input box**.

| Option | Result |
|---|---|
| **Multiple values** | Viewers can tick several values. Default for `category` and `location`. |
| **A single value** | Viewers choose one value. Default for `id`. |

### Default value

The value the filter has when a viewer opens the dashboard without a value in the link. Set it with the same widget viewers use; **Clear** removes the default.

A viewer can clear a filter that has a default with the **✕** on its chip; the filter then stays empty after a reload and in a shared link. A **required** filter cannot be emptied: its **✕** returns it to the default. **Reset all filters** puts every filter back to its default ([Use filters and URL parameters](./using-filters#reset-all-filters)).

### Required

When switched on, a viewer must set a value before any card loads. Until then every card shows "Set the required filters to load this card" and the filter bar names the missing filters ("Set the required filter(s): …"). A required filter's chip carries an asterisk. Give a required filter a default value so the dashboard is not blank on first load.

### Limit this filter's choices

Shown at all times, with one of four texts:

- With at least one other usable filter, a list of those filters with a switch each. If you switch a filter on, the choices in **this** filter's dropdown are limited by the other filter's current value. Example: switch on **Status** on **Priority**, and when a viewer picks status P the priority list shows only priorities that occur with status P.
- "If you have another dashboard filter, you can limit the choices…": there is no other filter yet. `temporal_unit` filters are not offered as limits.
- "If the filter has values that are from another question or model, or a custom list, then this filter can't be limited": the values source is **Custom list** or **From a card column**.
- "This filter can't be limited by another dashboard filter because its widget type is an input box."

The limit works through a card that the limited filter and the limiting filter are both connected to.

### Where this filter appears

Choose **Top of page** (default) or one of the heading and chart cards. On a dashboard with tabs, the cards are grouped under their tab's name. A filter placed on a card is drawn in that card's header instead of the filter bar. See [Place a filter on a card](#place-a-filter-on-a-card).

### Delete filter

Removes the filter and, with it, its connections. The side panel goes back to **Add a chart**.

## Connect a filter to cards

A filter does nothing until you connect it to a column on each card it should affect.

1. Select the filter's chip. Every card shows an overlay.
2. On each card that should react, open **Column to filter on** and choose a column. For a `temporal_unit` filter the select is headed **Connect to** and lists the card's time-grouped date columns. Leave **Select a column…** to leave the card unaffected. To disconnect a card, choose **No column**, which the list offers once a column is chosen.
3. After you connect the first card, a toast offers "Auto-connect this filter to all questions containing “*column*”?" (with "in the current tab" when the dashboard has several tabs). Press **Auto-connect** to connect every other card on the tab that has a column with the same name and no connection yet. A second toast confirms and offers **Undo**.
4. Press **Save**.

![The Priority filter selected; each card offers a column to filter on](/img/platform/dashboards/edit-filter-mapping.png)

The overlay explains cards that cannot be connected:

| Message | Meaning |
|---|---|
| "This card doesn't have any fields that can be mapped to this filter." | The chart has no dimension or plain column (for example a single number). |
| "You can connect filters to `{{variables}}` in heading cards." | Heading and text cards read filter values through `{{slug}}` instead. |
| "Link cards can't use a filter's value." | Link cards have no query. |
| "The selected filter is on another tab." | A filter placed on a card of another tab. |

:::note
The list of columns is the chart's own dimensions and plain columns, not every column of its dataset, and it is not narrowed by the filter's type. Columns whose **Filter** switch is off in the card's dataset are left out, except the column the filter is already connected to ([Columns](../datasets-and-metrics/columns#filter)). Add the column to the chart if you need to filter on it, and choose a column of a matching kind: a date filter connected to a text column produces a condition that fails when the query runs. Metric-only charts, such as a single-number card, therefore cannot be connected in the editor.
:::

A card can be connected to several filters, and a filter to several cards. Connections are stored on the card (`paramMappings`), so replacing a card's chart clears them.

## Place a filter on a card

Moving a filter onto a card puts it next to the thing it affects, saving room in the filter bar.

1. Select the filter and open **Where this filter appears**.
2. Choose a card. Chart cards and heading cards are listed, grouped by tab when the dashboard has tabs.
3. The filter now sits in that card's header, at the right of the title. Its connections do not change: it still filters every card it was connected to.

Press **Top of page** to move it back. Removing the card removes the filters it hosts. **Duplicate** a card or a tab and the copy does not host the filters.

If the header is too narrow for the title and filters, the filters collapse into a single button.

## Limits and known issues

- Changing a saved filter's **URL name** breaks links already shared with the old name (see [Name and URL name](#name-and-url-name)).
- The `text` and `number` types accept a single value only; a "Multiple values" choice is not offered.
- Limiting a filter's choices is described from the product source. It has not been verified end to end on the demo data, where every priority occurs with every status.

## Further reading

- [Use filters and URL parameters](./using-filters)
- [Cards and card settings](./cards)
- [Interactivity](./interactivity) for filters set by clicking a chart
