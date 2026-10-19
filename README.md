# Egret documentation

Source of [egret-data.github.io/docs](https://egret-data.github.io/docs/): one site with two sections,
**Platform** ([`platform/`](platform)) and **Engine** ([`engine/`](engine)). Built with
[Docusaurus](https://docusaurus.io/); English is canonical, Vietnamese is a reference translation.

```bash
npm ci
npm start        # live preview at http://localhost:3000/docs/
npm run build    # production build; fails on broken links
```

## Layout

| Path | Content |
|---|---|
| `platform/` | Platform docs, organised by purpose: introduction, quick start, deployment, guides, administration, reference, FAQ, known issues |
| `engine/` | Engine docs |
| `i18n/vi/` | Vietnamese translations (`npm run write-translations -- --locale vi`) |

## Contributing

User-visible changes in [egret-data/platform](https://github.com/egret-data/platform) or
[egret-data/engine](https://github.com/egret-data/engine) must ship with a docs PR here. UI changes
include refreshed screenshots. Use [Conventional Commits](https://www.conventionalcommits.org/).

Licensed under the [Apache License 2.0](LICENSE).
