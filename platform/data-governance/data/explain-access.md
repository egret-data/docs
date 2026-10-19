---
sidebar_position: 3
---

# Explain access

**Explain access** answers the question "can this person read this?" using the policies the engine actually downloads, not the policies you think you wrote. It is the quickest way to find out why a user is allowed or refused, and which grant decided it.

![The Who can read dialog: an Allowed verdict for member-sso with the grant that decided it](/img/platform/admin/gov-who-can-read.png)

Explain needs the **policy:read** permission. There are two entry points:

- **Who can read?** on the Data page, for the object you have open (or **Who can read this column?** in the column panel). The action is always **read**.
- The **Check access** tab on a person's page, which lets you pick the action and the target. See [Check access](../people-and-groups/check-access.md).

## Ask who can read an object

1. Open the object in **Governance → Data**.
2. Press **Who can read?**. The dialog shows the object's path.
3. Under **Subject**, choose **User**, **Group** or **Role**.
4. For a user, type a name or username and pick the match. For a group or role, search by name. If the list cannot be loaded you can type the name.
5. Press **Explain**. *Explain needs a user.* appears while no subject is chosen.

## Read the result for a user

The answer is given **per policy profile**, so an object served by two engines with two profiles gets two answers. Each profile card shows:

- The profile name, its type (Trino or StarRocks) and *service id*.
- The action asked, for example **select**, and a verdict.
- The policy that decided: **View grant** links to the egret grant, and the Ranger policy name and id are shown, for example `perm-grant-8c01… , id 3`. A policy that egret did not write is labelled *Outside the permission model*, and one egret seeded *Seeded admin policy*.
- **Tags that could decide here**: the tags egret resolved for this target, rolled up the hierarchy the way the engine's own enricher does.

### Verdicts

| Verdict | Meaning |
|---|---|
| **Allowed** | The policy set this engine downloads allows this access. |
| **Refused by a deny item** | A deny item in the downloaded policy set matches this subject and resource. Somebody forbade it. |
| **Refused by deny-all-else** | The deciding policy refuses everything it does not explicitly allow, and nothing in it allowed this. |
| **No policy matched** | Nobody granted it. This is not the same as someone forbidding it; Ranger's own audit shows "-" for this case, and there is no policy to open. |
| **Undecidable** | Something stands between the evaluator and a defensible answer, for example an unknown super-user list. The reason is named below the verdict. |

On a StarRocks profile, a read of a column also shows the mask the engine applies to it.

## Read the result for a group or role

A group's or role's access is its members' access, and members can differ, so there is no single verdict. Egret evaluates each member and counts:

- **Members allowed by every profile**
- **Members refused by at least one**
- **Members undecidable on at least one**
- **Members whose read is masked on at least one**

A **Refused only** filter narrows the list to members who are refused. A group with no members shows *This group has no members, so nobody was asked*, and a role nobody holds shows *No user holds this role, so nobody was asked*.

:::note
On StarRocks a read of a `MASK_NULL` column is not access-checked: it returns NULL, and the query is still refused unless the member may read another selected column. Such a member is counted as masked, not allowed.
:::

## What explain does not tell you

The dialog repeats these limits under every result, because they decide whether you can rely on a verdict:

- **Groups and roles in hand-written policies match nobody.** Egret serves no roles download and runs no usersync, so explain sends neither. Egret's own compiler names members by username, so only a hand-written policy can still name a group or role. The group `public` is the exception and does decide.
- **You cannot assert hypotheticals.** There is no field for a role, group or workspace the subject does not hold, so explain says why the subject is allowed or refused as they are, not what would happen if they held something else.
- **Masks and filters are mostly not reported.** Apart from a StarRocks column mask, explain answers about access only. Row filters, and masks on Trino, are not reported, so an **Allowed** target can still return masked values, filtered rows, or an error from a mask the engine cannot apply.
- **Tags attach downward.** A tag on a column does not appear when you ask about its table, because the engine's enricher reaches up the hierarchy and never down. Ask about the column to see a tag stored on it. Tags populate only when the target names both a schema and a table.
- **Plugins poll.** Each plugin polls for its policy set on an interval, so an engine can still enforce a slightly older download than the one evaluated here.

Explain works only for engines whose plugin version egret models: Trino with plugin 2.5.0 or 2.8.0 and StarRocks with 2.8.0 or 2.9.0. For another version it refuses.

## Troubleshooting

| You see | What it means |
|---|---|
| *Explaining access needs the policy:read permission.* | Your account lacks **policy:read**. |
| *Access could not be explained. Try again.* | The explain call failed; the message from the server is shown when there is one. |

## Further reading

- [Grants](./grants.md)
- [Check access](../people-and-groups/check-access.md)
- [Ranger plugin](../engines-and-policy/ranger-plugin.md)
