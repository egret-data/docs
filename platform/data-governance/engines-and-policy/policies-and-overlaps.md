---
sidebar_position: 2
---

# Policies and overlaps

The **Policies** tab of an engine (or of an unbound profile) shows every policy in the profile the engine downloads, whatever its source. The **Overlaps** tab reports mask and row-filter rules that could decide the same request two ways. Together they are the place to check what egret actually put in front of the engine.

![The Policies tab of docs-trino: five policies compiled by egret](/img/platform/admin/gov-engine-policies.png)

## The Policies tab

The summary line counts policies by source, for example *5 policies: 5 egret-compiled · 0 egret-seeded · 0 hand-written*. An empty profile says *This profile has no policy.*

**Search policies** matches a name, resource or principal. Two filters narrow the list:

| Filter | Options |
|---|---|
| **Source** | **Every source**, then one entry per source present: egret-compiled, egret-seeded or hand-written |
| **Type** | **Every type**, **Access**, **Masking**, **Row filter** |

An empty result reads *No policy matches these filters.*

| Column | Meaning |
|---|---|
| **Name** | The Ranger policy name. Compiled policies are named after their source, for example `perm-grant-8c01…` or `perm-rule-ae87…`. |
| **Source** | **egret-compiled** (*Compiled by egret; change its source*), **egret-seeded** (*Managed by egret (engine delegation, admin access or query limits)*) or **hand-written** (*Not managed by egret*). |
| **Type** | **Access**, **Masking**, **Masking (by tag)** or **Row filter**. |
| **Resource** | The catalog, schema, table and column, for example `demo_catalog.analytics.sessions.session_id`, or `tag: Personal data (PII)` for a tag policy. |
| **Principals** | Who the policy names. Egret writes usernames; compiled masks and row filters show `public`. |
| **Enabled** | Whether the engine uses it. |

A compiled policy has an **Open source** link: *Grant · Open source* or *Rule · Open source* opens the grant or rule that produced it. You change a compiled policy by changing its source, not here.

A hand-written policy can be switched on or off (*Policy enabled.* / *Policy disabled.*), edited and deleted (*The hand-written policy is removed from the profile; the engine drops it at its next plugin download.*). Those controls need **policy:update**, **policy:delete** and appear only on hand-written policies. See [Hand-written policies](./policy-editor.md).

## The Overlaps tab

A mask or row filter selects a column or table. When two of them select the same one at the same priority, the engine cannot tell which should win, so the result depends on evaluation order. Egret calls such a pair an **overlap**.

The tab's badge counts the pairs. An empty tab says *No overlapping rules on this profile.* Each pair is listed as, for example, **Mask** on `demo_catalog.analytics.sessions.user_id`, with links to the two **rule** or **policy** members and, when known, which one the engine serves today. A sentence explains why they collide.

**How to fix** says: delete one of the two, or narrow one so they no longer select a common resource. If either rule selects by classification tag, unassigning the tag from the column where they meet also breaks the pair. An edit that narrows a member but still meets the other is refused as a new overlap. For a hand-written member, a **Switch off policy** link takes you to its editor, where the **Enabled** switch turns it off.

### How overlaps are prevented

- A write that would create an overlap is refused with a conflict (409) naming the pair.
- Pairs that already existed before this check are only reported here, never refused retroactively.
- The Governance overview raises a **rule overlaps** finding, and **Open** takes you to the pair.

:::tip
Two tag rules are the usual cause: a mask by tag and a path mask on the same tagged column. Prefer one tag rule and exempt the principals who need the original value.
:::

## Limits and known issues

- Hand-written policies are outside egret's model: egret does not recompile them and does not check them against grants.
- The Overlaps tab is empty for an engine without a profile (*This engine downloads no policy profile, so no rule overlaps.*).

## Further reading

- [Masks and row filters](../data/masks-and-filters.md)
- [Hand-written policies](./policy-editor.md)
- [Governance overview](../overview.md)
