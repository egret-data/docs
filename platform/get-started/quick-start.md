---
sidebar_position: 3
---

# Quick start

This runs the platform locally with a Trino query engine and the demo data used throughout these docs.

## Prerequisites

Rust (see `rust-toolchain.toml`), Node.js, Docker and [`just`](https://github.com/casey/just).

## Start the platform

```bash
git clone https://github.com/egret-data/platform.git
cd platform
cp .env.example .env   # the secret key in this file is a public dev default - never reuse it
just up                # start local dependencies (Postgres, object storage, Trino, ...)
just serve             # run the platform
```

:::warning Trino and forwarded headers
Egret sends `X-Forwarded-Proto` to Trino. A stock Trino rejects that header with HTTP 406 unless
`http-server.process-forwarded=true` is set, and Egret then reports a generic *502 Bad Gateway*.
The Trino bundled with `just up` already has this enabled. If you bring your own Trino, add it.
:::

## Sign in

When single sign-on is configured the sign-in page offers **Sign in with SSO** and an **Admin sign-in (break-glass)** link for the local administrator. Without SSO it shows an email and password form.

![The sign-in page](/img/platform/login.png)

:::caution Sign-in rate limit
Local sign-in allows 5 attempts per 5 minutes per address and email. Repeated failed or scripted
attempts return *429 Too Many Requests* until the window passes.
:::

Next: [take a tour of the UI](./first-login-tour).
