---
sidebar_position: 1
---

# Local (Docker Compose)

`just up` starts the development dependencies from `deploy/docker-compose.dev.yml`: PostgreSQL, an S3-compatible object store (RustFS), Valkey, Trino, StarRocks and Keycloak.

```bash
cp .env.example .env
just up
just serve
```

`just serve` runs migrations and starts the platform on port 8080; the frontend dev server (`npm run dev` in `frontend/`) proxies `/api` to it.

:::tip Isolated instance
To try things without touching an existing dev database, use a separate PostgreSQL database and storage bucket
(`EGRET_DATABASE__URL`, and `bucket` under `[storage]` in `egret.toml`), and a separate port.
:::

Demo data: `just seed-demo` provisions a demo Iceberg catalog with tables, roles and clients against a running server.
