# Documentation style guide

The reference for how Egret docs are written. The model is the [Metabase docs](https://www.metabase.com/docs/latest/):
one page per feature, task-oriented, every setting named exactly as it appears in the product.

## Principles

1. **One page per feature.** A page covers one thing a person can do or configure (a chart type, a dashboard
   feature, an admin screen). If a page needs more than ~3 000 words or two unrelated tasks, split it.
2. **The product is the source of truth.** Every label, option, default and limit you write must come from the running
   app or from the source code. Never guess. If you cannot verify something, say so in the page or leave it out, and add
   it to your backlog file.
3. **Write for the person doing the task.** Start with what it is and why they would use it, then how.
4. **Name UI elements exactly**, in **bold**: **Run**, **Workspace settings**, **+ Chart**. Use the same capitalisation
   as the UI. Navigation paths use arrows: **Manage → Workspace settings → Engines**.
5. **Show, don't just tell.** Use screenshots from the seeded demo instance and small, runnable examples (SQL, YAML, curl).
6. **Be honest about limits.** Unfinished, Kubernetes-only, or unverified behaviour is stated plainly in a
   `:::note` / `:::warning`, never papered over.

## Page template

```markdown
---
sidebar_position: 3
---

# Page title (the feature, as a noun or "Verb the thing")

One or two sentences: what this is and when you would use it.

![Alt text that describes the screenshot](/img/platform/<area>/<id>.png)

## How to <do the main task>

1. Go to **Explore → Charts** and press **+ Chart**.
2. Choose a dataset…
3. …

## <Settings group, one H2 per tab or panel section, in UI order>

### <Setting name exactly as in the UI>

What it does, the options (as a table when there are 3+), the default, and any limit.

## <Related task or concept>

:::tip
A short, useful tip.
:::

## Limits and known issues

Only what is true and verified. Link a known-issue ID if one exists, e.g. KI-013.

## Further reading

- [Related page](./other-page)
```

Rules for the template:

- **Settings pages mirror the panel.** If the editor has tabs *Data / Display / Axes*, use those as H2s and list every
  setting under them in the order the UI shows them. Do not skip settings; if you are unsure what one does, test it.
- **Tables** for option lists with 3+ items (`Option | What it does | Default`).
- **Numbered steps** for procedures, bulleted lists for options. One action per step.
- **Admonitions**: `:::tip`, `:::note`, `:::warning`, `:::caution` (Docusaurus syntax). Do not use more than two per page.
- **Code blocks** always have a language (`sql`, `yaml`, `bash`, `json`, `text`).
- Voice: second person ("you"), present tense, plain words. No marketing language, no "simply", no "just".
- Sentence case for headings. No trailing punctuation in headings.

## Screenshots

- Taken from the seeded demo instance only. **Never** capture real emails, tokens, or secrets. The demo accounts
  (`admin@egret.local`, `*-sso@egret.local`) are fine.
- 1440×900 viewport, light theme. Crop to the relevant region (`clip`) when the full page adds noise.
- File location: `static/img/platform/<area>/<id>.png`; reference as `/img/platform/<area>/<id>.png`.
- Every screenshot is produced by an entry in `scripts/shots/<area>.mjs` so it can be re-captured. Do not hand-edit images.
- Alt text describes what the image shows ("The bar chart editor with the Data tab open").
- Review each image after capture: it must show the state the text describes (data loaded, dialog open, no spinners).

## Linking

- Use relative links to `.md`-less routes as in existing pages, e.g. `[Dashboards](../explore/dashboards)`.
- The build fails on broken links. Link only to pages that already exist on `main` or that you create.
- **Do not rename or delete an existing page path.** You may rewrite a page and add sub-pages next to it.

## Known issues

Defects, rough UX and gaps you find while documenting go in your area's backlog file (`.backlog/<area>.md`, one row per
finding: `Area | Type | Severity | Description | Evidence`). They are **recorded, not fixed**. Severity: S1 blocks a task,
S2 wrong or misleading with a workaround, S3 polish. The lead merges backlog files into `platform/known-issues.md`.

## Vietnamese

English is canonical. Vietnamese pages (`i18n/vi/...`) follow once the English page is stable.
