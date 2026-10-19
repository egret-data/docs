---
sidebar_position: 7
---

# Certification

Certification is a trust mark. A steward who has checked a dataset (or one of its metrics) can mark it **Certified**, so people choosing what to build on can tell the official, vetted definitions from the experiments. It does not change what the dataset does; it only records that someone accountable vouched for it, who, and why.

![The Certify dataset dialog](/img/platform/sql-datasets/ds-certify.png)

## Who can certify

Certification is a **platform** permission, `dataset:certify`, not a workspace one. It is held by platform administrators and by the platform role `data_steward`. Having `dataset:manage` in the workspace, which lets someone edit a dataset, does not let them certify it. This is deliberate: if everyone who can edit a dataset could also mark it trusted, the mark would only say that its author liked it.

People who cannot certify still **see** the badges. They do not see the certification button on the dataset page and the **Certified** switch on the Metrics tab shows **—** instead of a switch.

## Certify a dataset

1. Open the dataset.
2. Press the **Certify dataset** button (a check-mark in a circle) in the header, next to the pencil. For a dataset that is already certified the button is called **Certification**.
3. In **Certify dataset** turn on **Certified**. The text reads *Mark this as a trusted, official dataset so people know it's vetted.*
4. Optionally type **Details**, the reason it is trusted. For example *Reviewed by the data team; matches the finance revenue report.*
5. Press **Save**. A toast says *Dataset certified*.

The header now shows a green **Certified** badge, and the dataset has a check icon next to its name in the Datasets list. Hover over the badge to read *Certified by admin@egret.local — Reviewed by the data team…*.

To withdraw certification, open the same dialog, turn **Certified** off and press **Save**. The toast says *Certification removed*, and the recorded certifier is cleared.

### Who is recorded

The certifier is taken from your **session**: your email address. Nothing in the dialog lets you name someone else, and a request that tries to send another name is ignored. If two stewards certify and withdraw in turn, the badge always shows the most recent certifier.

## Certify a metric

A metric carries its own mark, because a metric is the thing a chart shows.

1. Open the dataset's **Metrics** tab.
2. Use the switch in the **Certified** column of the metric. It saves at once.

The metric then shows a check icon before its name, and hovering over it shows who certified it and any details. The details field has no input on the Metrics tab; a metric keeps the details it already has (none for a new certification).

## What certification does and does not do

- It is **information**. A certified dataset is not locked: anyone with `dataset:manage` can still edit its SQL, columns and metrics, and the certification stays on after the change.
- It does not expire and is not tied to a version. If an editor changes a certified metric's expression, the metric stays certified. Withdraw and renew the certification after a change you want to re-review.
- It applies to one dataset or metric, not to charts built on it.
- Certified datasets get no special placement in the list; the badge and the check icon are the only difference.

## A suggested review routine

Egret does not enforce a review process, but a steward who certifies a dataset usually checks these things first:

1. **The source.** For a virtual dataset, read the SQL on the dataset page. Is it the right join, the right filters, the right time zone?
2. **The columns.** Do names and display names mean what a reader would expect? Are the roles and formats right?
3. **The metrics.** Compare each metric's expression and result with a number you already trust. For example, check that `revenue` on the dataset matches the finance report for the same period.
4. **The usage.** Look at the [Usage](./usage-and-preview#usage) tab for charts that rely on it.
5. **The details.** Write down what you checked in **Details**, so the next reader does not have to ask.

Certify the dataset first, then each metric you vouch for. A dataset can be certified while some of its metrics are not, and the reverse.

## Using the REST API

The two endpoints below are what the dialog and the switch call. Both need a signed-in session with the `dataset:certify` permission and the CSRF header; see the [REST API reference](../../reference/rest-api).

```bash
# Certify a dataset
curl -X PUT "$BASE/api/ws/default/datasets/$DATASET_ID/certification" \
  -H "X-Egret-CSRF: $CSRF" -H "content-type: application/json" \
  -d '{"certified": true, "details": "Matches the finance revenue report."}'

# Certify one metric of the dataset
curl -X PUT "$BASE/api/ws/default/datasets/$DATASET_ID/metrics/$METRIC_ID/certification" \
  -H "X-Egret-CSRF: $CSRF" -H "content-type: application/json" \
  -d '{"certified": true, "details": "Official revenue definition."}'
```

The response is the dataset, with `certified`, `certified_by` and `certification_details` filled in. A caller without the permission gets `403`. The body cannot name the certifier.

## Limits and known issues

- There is no history of certifications and no review request flow; the page shows only the current state.
- A change to a certified dataset does not revoke the mark.
- Metric certification details cannot be typed in the interface.

## Further reading

- [Metrics](./metrics)
- [Permissions](./permissions)
- [Roles and permissions](../../workspace-settings/roles-and-permissions)
