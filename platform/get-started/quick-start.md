---
sidebar_position: 3
---

# Run locally

Prerequisites: Rust (see `rust-toolchain.toml`), Node.js, Docker and [`just`](https://github.com/casey/just).

```bash
git clone https://github.com/egret-data/platform.git
cd platform
cp .env.example .env   # the secret key in this file is a public dev default - never reuse it
just up                # start local dependencies
just serve             # run the platform
```

Run `just --list` for the other recipes (tests, kind deployment, demo data).

*Draft - screenshots and the first-login walkthrough are coming.*
