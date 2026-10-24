---
sidebar_position: 6
---

# History, saved queries and snippets

Three tabs next to **Results** help you reuse SQL: **History** lists what you ran, **Saved** holds named queries that the whole workspace can open, and **Snippets** holds pieces of SQL that you paste into any query.

![The History tab listing recent runs](/img/platform/sql-datasets/sqllab-history.png)

## History

**History** lists your most recent runs, newest first, up to the last 50. It is private to you: other members do not see your history, and it is kept per workspace on the server, so it follows you to another browser.

Each entry shows:

- A status badge: *Queued*, *Running*, *Finished*, *Failed* or *Cancelled*.
- The database name, how long ago the query was submitted (hover for the exact time) and, for finished queries, the number of rows (*1 row*, *25 rows*).
- The SQL on one line, cut off if it is long (hover to see it all).

Everything you submit is recorded, including `EXPLAIN` runs and table previews. A query that used [parameters](./parameters) is recorded with the values already substituted.

### Reuse an entry

- **Click an entry** to load its SQL into the editor of the current tab, replacing the text. It does not run and does not change the tab's database.
- **Copy SQL** (the copy icon that appears when you hover) copies the text to the clipboard.
- **Re-run** (the play icon) switches the tab to the entry's database, replaces the editor text with its SQL and runs it at once.

### Search history

Type in **Search history…** to keep only entries whose SQL or database name contains the text (case-insensitive). With no match the tab says *No history matches “text”.* A user with no runs yet sees *No queries run yet.*

### Clear history

**Clear history**, next to the search box, empties your History list in this workspace, for example to get rid of test runs.

1. Open the **History** tab and press **Clear history**.
2. The dialog *Clear your query history?* says *Your queries in this workspace leave the History list. Saved queries and other people's history are not affected.* Press **Clear history** to confirm, or **Cancel**.
3. A toast says *History cleared* and the tab shows *No queries run yet.* until you run something again.

Clearing hides your entries from the list; it does not delete the runs. A result you can still reach by its id (for example a CSV download link) keeps working. Only your own entries are cleared, in this workspace only: there is no way to clear another member's history, and the history you have in other workspaces stays. The list still shows at most your 50 most recent runs; clearing makes room for new ones. The button is not shown while the list is empty.

## Saved queries

A saved query is a named SQL text with an optional description and the database it was written for. Saved queries belong to the workspace, not to one person: every member who can read saved queries sees the list.

![The Saved tab, hovering over a query](/img/platform/sql-datasets/sqllab-saved.png)

### Save a query

1. Write the query in the editor and choose its database.
2. Press **Save** in the toolbar (or **Save query…** in the command palette).
3. In **Save query**, type a **Name** (required, for example *Monthly revenue*) and an optional **Description**.
4. Press **Save**. A toast says *Saved* and the query appears at the top of the **Saved** tab.

![The Save query dialog](/img/platform/sql-datasets/sqllab-save-dialog.png)

**Save** always creates a new saved query. It stores the editor text exactly as it is, placeholders included, together with the tab's database. Two saved queries can have the same name.

### Open a saved query

Click a row in **Saved**. The query opens in a **new tab** named after the saved query, with its database selected and the same row limit as the tab you were in.

Each row shows the name, the database, *updated n minutes ago* and the description (or, when there is no description, the start of the SQL).

### Edit, delete, organise and share

Hover over a row to reveal its actions.

| Action | What it does |
|---|---|
| **Edit** (pencil) | Opens **Edit query** to change the **Name** and **Description**. The SQL cannot be changed from here. |
| **Delete** (bin) | Asks *Delete saved query?* and removes it for good. |
| **Actions** (**…**) → **Move to "folder"** | Puts the query in an existing folder. **Remove from folder** takes it out. |
| **Actions** → **Move to new folder…** | Asks for a name, creates the folder and moves the query into it. |
| **Actions** → **Share…** | Opens the sharing dialog to give a user or a group access to this one query. See [Shared objects](../../workspace-settings/shared-objects). |

A header line at the top of the tab counts the saved queries (*12 saved queries*) and holds **New folder**. Press it, type a name in **New folder** and press **Create**: an empty folder appears in the list (a toast says *Folder created*), ready for queries to be dragged or moved into it. A row's **Move to new folder…** does the same and moves that query in at once.

Once the workspace has at least one folder for saved queries, the tab groups the list under folder headings with the number of queries in each, plus **Uncategorized**. Click a heading to collapse it. A folder's **…** menu offers **Share…**, **Rename** and **Delete** (deleting a folder does not delete its queries). You can also drag a row onto a folder heading to move it.

:::note Changing a saved query's SQL
There is no way to overwrite the SQL of an existing saved query. To change it, open it, edit the SQL, press **Save** to store the new version, and delete the old one.
:::

## Snippets

A snippet is a reusable fragment of SQL such as a date filter, an expression or a join. Snippets are stored in the workspace and everyone with access to saved queries sees them.

![The Snippets tab](/img/platform/sql-datasets/sqllab-snippets.png)

### Create a snippet

1. Open the **Snippets** tab and press **+ New snippet**.
2. In **New snippet**, type a **Name** and check the **SQL body**. The body starts with the current editor text; replace it with the fragment you want.
3. Add an optional **Description**.
4. Press **Save**. The button stays disabled until both the name and the body are filled in.

### Use a snippet

Click a snippet. Its body is added to the end of the current editor text on a new line, or becomes the whole text if the editor is empty. A snippet is plain text: it is not a template and takes no arguments. Write `{{name}}` placeholders in it if you want [parameters](./parameters).

For example, the snippet *Orders in 1997* holds:

```sql
o.orderdate >= DATE '1997-01-01' AND o.orderdate < DATE '1998-01-01'
```

### Edit and delete

Hover over a snippet and press the pencil (**Edit**) to change its name, body or description, or the bin (**Delete**) to remove it. **Delete** asks first: the dialog *Delete snippet?* says that the snippet will be permanently deleted for everyone in this workspace. Press **Delete** to confirm; a toast says *Snippet deleted*.

## Limits and known issues

- History shows your last 50 runs. **Clear history** hides them all at once; a single entry cannot be removed.
- A saved query's SQL cannot be edited in place.

## Further reading

- [The query editor](./editor)
- [Save a query as a dataset](./save-as-dataset)
- [Permissions and availability](./permissions)
