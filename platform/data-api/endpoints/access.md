---
sidebar_position: 7
---

# Access

Nobody can call an endpoint until you say so. The **Access** tab lists the workspace's service accounts and lets you grant each one permission to **invoke** this endpoint. Grants are per endpoint, so a consumer you give the sales endpoint cannot call the finance one.

![The Access tab of Orders by status: finance-dashboard and orders-reporting-bot granted on this endpoint, partner-sandbox not granted](/img/platform/data-api/endpoint-access.png)

## Grant a service account access to an endpoint

1. Create the service account and, if the consumer does not have one, an OAuth2 client. See [Clients](../clients).
2. Open the endpoint and go to the **Access** tab.
3. Find the service account in the table and press **Grant invoke**.

A message confirms *Granted invoke*. The change takes effect on the very next call: a grant is read on every request. To remove access press **Revoke**; the message is *Revoked invoke*, and the next call from that account is refused with `403 not_granted`.

A grant belongs to the **endpoint**, not to a version, so it survives republishing. Publishing a new version never needs the consumer to be granted again.

## The Access table

| Column | What it shows |
|---|---|
| **Service account** | The account's name and email address. |
| **Invoke** | Whether the account can call this endpoint, and why. |
| Actions | **Try it**, and **Grant invoke** or **Revoke**. |

The status under **Invoke** is one of:

| Badge | Meaning |
|---|---|
| **Granted on this endpoint** | A grant exists for this endpoint. |
| **Inherited from the workspace** | There is no grant on this endpoint, but the account reaches invoke through its workspace role, which applies to every endpoint in the workspace. There is nothing to revoke here; change it in [workspace membership](../../workspace-settings/members). |
| **Not granted** | The account cannot call this endpoint. |
| **No grant on this endpoint** | Egret could not check whether the account inherits invoke, usually because the endpoint is not live yet. |

Two notes appear on a row when they matter:

- **Revoking will not remove access**, meant for a granted account that also reaches invoke through the workspace: revoking removes the grant but not the access. On the demo stack this note is shown on **every** granted service account, including ones with no workspace role, and is wrong for them: revoking `finance-dashboard` on **Orders by status** made its next call answer `403 not_granted`. Trust the result of **Try it** after a revoke, not the note.
- **Revoking may not remove access**, shown when Egret cannot check the inherited access, for example while the endpoint is not live.

The check for inherited access runs the account's own OpenAPI document and looks for this endpoint in it, so it only works on a live endpoint. A draft or disabled endpoint says so above the table: *This endpoint is not live, so nothing is being served yet and egret cannot check workspace-inherited invoke rights against it. Grants recorded here are real and take effect when it is published.*

### The Try it action

The **Try it** link on a row opens the [Try it tab](./try-it) with that account preselected. It is the quickest way to learn whether the account can really read the data, not only invoke the endpoint.

## Invoke is not data access

Granting invoke lets the account call the endpoint. It does **not** let the account read the tables behind it. A call runs as the service account against the workspace's database connection, under whatever the engine enforces, so an administrator must also grant that account the underlying data in the engine, for example in Ranger. The two are separate permissions and only the first is on this page.

Egret cannot ask the engine whether the account may read the tables, so it does not show a column for it. The tab's note says: *Run Try it on a row to find out for real.* A missing data permission shows up as `403 data_access_denied`, a different code from `403 not_granted`, because the fix is in a different system.

| Code | Who refused | Fix |
|---|---|---|
| `not_granted` | Egret: no invoke grant | **Grant invoke** here. |
| `data_access_denied` | The engine: no data permission, or a bad engine credential | Grant the account on the tables in the engine. |

## Who can manage grants

Reading and changing grants needs the `data_api_endpoint:manage` permission, which the built-in **ws_admin** role holds. Listing the grants requires it too, because the list names every consumer of the endpoint.

## When the endpoint is not live

| State | What the tab allows |
|---|---|
| **Draft** | You can grant and revoke. Grants take effect when you publish. |
| **Disabled** | Grants are kept and apply again when you enable it. |
| **In the trash** | Granting and revoking are blocked. Restore the endpoint first. Existing grants still apply, and **Try it** still runs. |

## Limits and known issues

- A service account can be granted per endpoint only. There is no "all endpoints" grant on this page; the workspace-role route is **Inherited from the workspace**.
- A grant removed from an account that was deleted still appears, labelled *no longer a service account in this workspace*, so it can be revoked.

## Further reading

- [Clients](../clients)
- [Try it](./try-it)
- [Error reference](../errors)
