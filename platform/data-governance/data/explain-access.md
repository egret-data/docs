---
sidebar_position: 3
---

# Explain access

**Explain access** answers the question "what does this person get when they read this?" using the policies each engine actually downloads, not the policies you think you wrote. It says, in one sentence per person and engine, whether they can read the object, which value they see in a column (the real value, hashed, NULL, …), which rows they see, and which rule, grant, clearance or group decided it. Use it to check that a rule does what you meant, for example "mask `email` for everyone except the group `data-team`".

![The Who can read dialog: select is Allowed for member-sso on docs-trino, with the grant that decided it](/img/platform/admin/gov-who-can-read.png)

Explain needs the **policy:read** permission. There are two entry points:

- **Who can read?** on the Data page, for the object you have open (or **Who can read this column?** in the column panel). The action is always **read**.
- The **Check access** tab on a person's page, which lets you pick the action and the target. See [Check access](../people-and-groups/check-access.md).

## Ask who can read an object

1. Open the object in **Governance → Data**. To check a mask, open the column: masks are answered for a column read only.
2. Press **Who can read?** (or **Who can read this column?**). The dialog shows the object's path.
3. Under **Subject**, choose **User**, **Group** or **Role**.
4. For a user, type a name or username and pick the match. For a group or role, search by name. If the list cannot be loaded you can type the name.
5. Press **Explain**. *Explain needs a user.* appears while no subject is chosen.

## Read the answer for a user

The answer is given **per policy profile**, so an object served by two engines with two profiles gets two answers. Each profile card shows the profile name, its type (**Trino** or **StarRocks**) and *service id*, then the answer as one or two sentences:

- for a column read, what the person reads in the column;
- for a read of a table or a column, which rows they see (row filters work on whole tables, so a column reader sees the table's rows);
- for a table read, whether they **can read** the table or are **refused**.

In each sentence the outcome is in bold, a rule or a classification's clearance is a link to its page, and a group or user is a link to its People page.

### What the person reads in a column

| Situation | Example sentence |
|---|---|
| No mask applies | member-sso reads `email` as **the real value** |
| A rule masks the column | member-sso reads `email` as **hashed** (rule *Hash personal data*) |
| The person is exempt through a group | member-sso reads `email` as **the real value** (exempt from rule *Hash personal data* via group data-team) |
| The person is exempt by name | … as **the real value** (exempt from rule *Hash personal data* directly) |
| The person is named and is in an exempt group | … (exempt from rule *Hash personal data* directly and via group data-team) |
| Several exempt groups | … (exempt from rule *X* via group data-team, group ops and 2 more): up to three are named |
| A hand-written policy masks the column | member-sso reads `email` as **redacted** (manual policy *pii-mask*) |
| Refused by a clearance (Trino) | member-sso is **refused** `email` (clearance *PII*) |
| Refused for another reason | member-sso is **refused** `email` (a grant denies it), (manual policy *P*) or (no policy allows it) |

The mask word comes from the mask type: Redact reads **redacted**, Partial mask: show last 4 reads **partly shown (last 4)**, show first 4 reads **partly shown (first 4)**, Hash reads **hashed**, Nullify reads **NULL**, Unmasked reads **the real value**, Date: show only year reads **year only**, and Custom reads **a custom expression** followed by the expression.

**Why someone sees the real value.** When a rule leaves a person's value as it is, the sentence says why: the rule and the user or group that exempts them. A rule exempts users and groups only. If the rule's compiled policy names the person but the current rule does not, the sentence says so: *(exempt from rule X; the current rule does not name them, so its compiled policy is older than the rule)*. A rule whose own mask is **Unmasked** (or a row filter with an empty expression) transforms nothing for anyone, so it is not reported as an exemption.

### Clearance on StarRocks

Where the classification is on a column, StarRocks does not refuse an uncleared reader of the column: it returns NULL. A cleared reader gets the rule's mask instead. The sentence names the rule and the clearance:

| Situation | Example sentence |
|---|---|
| Not cleared | member-sso reads `email` as **NULL** (clearance *PII*) |
| Cleared, and a rule masks the column | member-sso reads `email` as **hashed** by rule *Hash personal data* (cleared for *PII*) |
| Cleared, and exempt from the rule | … as **the real value** (exempt from rule *X* via group data-team; cleared for *PII*) |
| Cleared, and no rule masks the column | … as **the real value** (cleared for *PII*) |
| Cleared for several classifications on the column | … (cleared for *PII* and *Finance*) |
| The served clearance mask is older than the rule | … (cleared for *PII*; the served clearance mask is older than the rule masks) |

The mask word is always the one the engine applies (the served clearance mask), and the rule is credited only while the two agree. *Cleared for* names every classification with a clearance on the column, whether it is on the column or on the whole table.

**A classification on the whole table.** StarRocks refuses an uncleared reader every direct read of the table, and a view over it reads NULL in every column (see [Clearance](../classifications/clearance.md#on-columns-or-on-a-whole-table)). The sentences say so:

| Situation | Example sentence |
|---|---|
| Not cleared, a column read | member-sso is **refused** `email` (clearance *PII*, on the whole table); through a view it reads NULL |
| Not cleared, a table read | member-sso is **refused** `sales.orders` (clearance *PII*, on the whole table) |
| No NULL mask, because the table is not in the catalog | member-sso is **refused** `email` (clearance *PII*, on the whole table). No NULL mask for clearance *PII* is served here: egret found no table `sales.orders` in the catalog, so a view over it shows the values |
| No NULL mask, because the column is newer than the compile | … No NULL mask for clearance *PII* is served here: the profile has not been recompiled since this column appeared, so a view over it shows the values |

The last two lines name a gap that closes by itself: the masks are written when the table is created (KI-307) or when the profile is next recompiled (KI-305).

**A reader with no grant.** StarRocks masks an uncleared reader's column to NULL without checking access on it, but the query still needs SELECT on the other columns it reads. When the person has no read on the table, the sentence says they are refused, not that they read NULL:

```text
member-sso is refused email (no policy allows it): StarRocks masks it to NULL, and the query still needs SELECT on the other columns it reads
```

Explain does not know which other columns a query reads, so it uses the person's access to the table as a stand-in.

### Which rows the person sees

| Situation | Example sentence |
|---|---|
| No row filter | member-sso sees **every row** |
| A rule filters rows | member-sso sees **rows where** `region = 'us'` (rule *US rows only*) |
| The person is exempt | member-sso sees **every row** (exempt from rule *US rows only* via group data-team) |

A refused read has no rows sentence.

### Ties and undecided answers

When two rules that agree apply at the same priority, the sentence counts them: member-sso reads `email` as **hashed** (2 rules agree: *A*, *B*). When they disagree, the engine applies one of them and which one cannot be known in advance:

```text
member-sso: undecided — rules A (Hash) and B (Redact) apply at the same priority; the engine applies one of them, and which one cannot be predicted here
```

Other **undecided** answers name the reason, for example *(classification rules at different priorities decide this, which egret does not model)*, *(egret could not resolve this column's classifications: …)* or *(egret does not model this policy set (super_users_unknown))*.

### Not enforced

When no engine with a policy profile serves the catalog, the answer is a **Not enforced** badge with one sentence instead of profile cards:

- *Not enforced: demo_warehouse has no engine.*: attach an engine to the catalog.
- *Not enforced: demo_warehouse's engines have no policy profile.*: give the attached engine a policy profile.

This is not a refusal: nothing checks access to the catalog at all.

### Which policies decided this

Under the sentences, the closed section **Which policies decided this** holds the evidence they were built from, *Evaluated over the policy set this profile's plugin downloads.*:

- The action asked, for example **select**, and a verdict (see the table below).
- The policy that decided: **View grant** links to the egret grant, **View rule** names the rule, and the Ranger policy name and id are shown, for example `perm-grant-8c01… , id 3`. A policy that egret did not write is labelled *Outside the permission model*, and one egret seeded *Seeded admin policy*.
- **Mask on select**, for a column read: for example *masked to MASK_HASH by Ranger policy …*, *returns NULL (MASK_NULL, …)* or *no mask applies*.
- **Row filter on select**: *no row filter applies*, or *rows where … , by Ranger policy …*.
- On StarRocks, what happens to materialized views when the profile holds a classified column.
- **Tags that could decide here**: the tags egret resolved for this target, rolled up the hierarchy the way the engine's own enricher does.

### Verdicts

| Verdict | Meaning |
|---|---|
| **Allowed** | The policy set this engine downloads allows this access. |
| **Refused by a deny item** | A deny item in the downloaded policy set matches this subject and resource. Somebody forbade it. |
| **Refused by deny-all-else** | The deciding policy refuses everything it does not explicitly allow, and nothing in it allowed this. |
| **No policy matched** | Nobody granted it. This is not the same as someone forbidding it; Ranger's own audit shows "-" for this case, and there is no policy to open. |
| **Undecidable** | Something stands between the evaluator and a defensible answer, for example an unknown super-user list. The reason is named below the verdict. |

## Read the answer for a group or role

A group's or role's access is its members' access, and members can differ, so there is no single verdict. Egret evaluates each member and counts:

- **Members allowed by every profile**
- **Members refused by at least one**
- **Members undecidable on at least one**
- **Members whose read is masked on at least one**

The members table has a row per member: the **Member** (name and username) and, under **Verdicts**, each profile's name with that member's first sentence for it, for example *member-sso reads `email` as **hashed** (rule Hash personal data)*. The arrow at the end of a row (*Show the full answer for …*) opens the member's whole answer, with the rows sentence and **Which policies decided this**. A **Refused only** filter narrows the table to members who are refused.

- Explain asks at most **200** members. A bigger group reads, for example, *Evaluated 200 of 350 members; 150 more were not asked (over the limit of 200).*
- Members with no username yet are listed under **Not asked**: *No username yet, so no engine knows this user.*
- A group with no members shows *This group has no members, so nobody was asked.*, and a role nobody holds shows *No user holds this role, so nobody was asked.*

:::note
On StarRocks a read of a `MASK_NULL` column is not access-checked: it returns NULL, and the query is still refused unless the member may read another selected column. Such a member is counted as masked, not allowed.
:::

## Engine gaps the answer states

One kind of rule compiles to nothing on Trino. Until a later release compiles it, the answer says so where you read it, rather than reporting a protection that is not there:

| Engine | Rule | What the answer says |
|---|---|---|
| Trino | A row filter by classification, where the classification is on a column of the table, not on the table | member-sso sees **every row**: rule *US rows only* does not filter on Trino here, because PII is on a column, not on the table (KI-287) |

The rule dialog warns about this gap before you create such a rule, see [Masks and row filters](./masks-and-filters.md#row-filters-by-classification-on-trino). Since platform #755 StarRocks enforces both a clearance and a row filter for a classification on a whole table, so the answer no longer states a StarRocks gap.

## What explain does not tell you

The dialog keeps one limit visible under every result, *A manual policy that names a role or a group other than public matches nobody, here or on the engines.*, and folds the rest under **How this answer was worked out**:

- **Groups and roles in hand-written policies match nobody.** Egret serves no roles download and runs no usersync, so explain sends neither. Egret's own compiler names members by username, so only a hand-written policy can still name a group or role. The group `public` is the exception and does decide.
- **You cannot assert hypotheticals.** There is no field for a role, group or workspace the subject does not hold, so explain says why the subject is allowed or refused as they are, not what would happen if they held something else.
- **Engine errors are not predicted.** Masks are reported on Trino and on StarRocks, and row filters per table, but explain cannot predict an error from a mask the engine cannot apply, such as a custom expression or a mask on a column type it does not fit.
- **Tags attach downward.** A tag on a column does not appear when you ask about its table, because the engine's enricher reaches up the hierarchy and never down. Ask about the column to see a tag stored on it. Tags populate only when the target names both a schema and a table.
- **Plugins poll.** Each plugin polls for its policy set on an interval, so an engine can still enforce a slightly older download than the one evaluated here.

Explain works only for engines whose plugin version egret models: Trino with plugin 2.8.0 and StarRocks with 2.8.0 or 2.9.0. For another version it refuses.

## In the API

`POST /api/control-plane/perm/explain` (one user) and `POST /api/control-plane/perm/explain/principal` (a group's or role's members) return the same answer. Each profile carries `effect_lines`, the sentences as structured parts (`subject`, `strong`, `code`, `rule`, `clearance`, `principal`, `policy`, `catalog`, `text`) with the joined `text`. It also carries `row_filter` (the table's row-filter decision), `other_columns_access` (on StarRocks, when the column is not access-checked), `clearance_masks_missing` (on StarRocks, each clearance on the column or its table whose NULL mask is not served for the column, with `tag_id`, `tag_name` and a `reason` of `table_not_in_catalog` or `not_compiled`) and `row_filter_not_applied` (the Trino gap). Platform #755 removed `clearance_not_enforced`. A rule attribution carries the rule's `name`, and a tie's cause lists each tied policy's `outcomes`. With no profile, the response carries `effect_line`, the **Not enforced** sentence. All of these fields are optional additions; see the [REST API reference](../../reference/rest-api/perm.md).

## Troubleshooting

| You see | What it means |
|---|---|
| *Explaining access needs the policy:read permission.* | Your account lacks **policy:read**. |
| *Access could not be explained. Try again.* | The explain call failed; the message from the server is shown when there is one. |
| *No answer line was sent for this profile.* in the members table | The server returned no sentence for that profile. Open the member's full answer. |

## Further reading

- [Grants](./grants.md)
- [Masks and row filters](./masks-and-filters.md)
- [Clearance](../classifications/clearance.md)
- [Check access](../people-and-groups/check-access.md)
- [Ranger plugin](../engines-and-policy/ranger-plugin.md)
