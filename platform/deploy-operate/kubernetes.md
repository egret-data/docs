---
sidebar_position: 6
---

# Kubernetes (Helm chart)

The repository ships a Helm chart in `deploy/helm/egret` that deploys the whole stack into a Kubernetes cluster. It also
lets Egret provision query engines, run workflow script tasks and start Data Apps pods inside that cluster.

To try engine provisioning and Data Apps without a cluster, use the [demo stack](../get-started/run-the-demo-stack): it runs
Trino engines as Docker containers and Data Apps as processes in the Egret container. Both are demo-only substitutes with no
isolation; script and container workflow tasks still need Kubernetes.

:::warning Development chart, and not run for these docs
The chart's own README is explicit: it is **dev only, not for production**. It bundles PostgreSQL and RustFS, ships a
default local administrator password, and exposes the frontend on a NodePort. The author of this page had no Kubernetes
cluster, so nothing here was deployed. What was verified: `helm lint` passes, and `helm template` renders the object lists
and the refusals described below. Treat the rest as documentation of the chart's source, and test it on your cluster.
:::

## What the chart deploys

With default values `helm template` renders these objects:

| Object | Purpose |
|---|---|
| `Deployment/egret` | The Egret server. Probes: startup `GET /healthz`, readiness `GET /readyz`, liveness `GET /healthz`. Requests 500m CPU and 1 GiB, limits 2 CPU and 4 GiB. `terminationGracePeriodSeconds` is 65, which must stay above the server's 55 second drain. |
| `Service/egret` | Port 8080 (8081 for Data Apps when `apps.origin` is set, and the port named `opa` while `opa.enabled` is on, which is the default). |
| `Deployment/egret-frontend`, `Service/egret-frontend` | The built web app behind nginx, as a NodePort Service (30080). |
| `Deployment/egret-renderer`, `Service/egret-renderer` | The screenshot service used by reports. |
| `Job/egret-init` | A post-install and post-upgrade hook that runs `egret init`, creating the administrator and the `default` workspace. It is idempotent. |
| `Secret/egret-secrets` | `master-key`, `secret-key`, `catalog-auth-token`, storage credentials, the admin password and the OIDC client secret. The three keys are generated at install and **reused on upgrade** (looked up from the existing Secret). |
| `ConfigMap/egret-env` | Every `EGRET_*` setting that is not a secret. |
| `ServiceAccount`, `Role` and `RoleBinding` `egret-engine-provisioner` | Lets Egret manage workloads in the engine namespace. |
| `NetworkPolicy/egret-engine-isolation` | In the engine namespace: only that namespace's own pods, Egret's pods and the StarRocks operator (front end ports 8030 and 9030) may connect to the engines (since platform #828). See [Engine network policy](#engine-network-policy). |
| `NetworkPolicy/egret-ingress` | In the release namespace, selecting Egret's backend pods (`app: egret`): 8080 open to every peer, 8081 open when `apps.origin` is set, and the OPA port only from `engineNamespace` and `opa.extraFrom`. Rendered when `engineNetworkPolicy.enabled`. See [Engine network policy](#engine-network-policy). |
| `Deployment/postgres`, `PersistentVolumeClaim/postgres-data` (1 GiB), `Service/postgres` | Bundled PostgreSQL 16 (`deps.enabled`). |
| `Deployment/rustfs`, `PersistentVolumeClaim/rustfs-data`, `Service/rustfs`, `Job/egret-rustfs-bucket` | Bundled RustFS and a job that creates the bucket. |
| `Pod/mailpit`, `Service/mailpit` | A mail catcher so you can read report emails. Never for real use. |

Optional objects appear with these values:

| When | Extra objects |
|---|---|
| `oidc.enabled=true` and `oidc.devRealm=true` | `Deployment/keycloak`, `Service/keycloak`, `ConfigMap/keycloak-realm` (the realm file). |
| `ingress.enabled=true` | `Ingress/egret` (routes `/auth`, `/data-api`, `/oauth`, `/ranger`, `/.well-known/*` and `/`) and `Ingress/egret-catalog`. `/ranger` (the policy API) is routed to Egret's backend so that engines outside the cluster can reach it. |
| `sharedStore.enabled=true` | `Deployment/valkey` and `Service/valkey`. |
| `workflow.containerRunner=kubernetes` | `Namespace/egret-tasks` (Pod Security `restricted`), `Role` and `RoleBinding` `egret-task-runner`, `NetworkPolicy/egret-task-isolation`. |
| `apps.pod.launcher=kubernetes` | `Namespace/egret-apps` and `NetworkPolicy/egret-app-pod-isolation`. With `apps.origin` and `ingress.enabled` also set, `Ingress/egret-apps`. |
| `deps.enabled=false` | None of the bundled PostgreSQL, RustFS, Mailpit objects; see the limitation below. |

## Install on a local kind cluster

Prerequisites: Docker, `kind`, `kubectl`, `helm`, and `just`. The recipes build the images and load them into a kind
cluster named `egret`:

```bash
just k8s-up          # kind cluster "egret" with the NodePort mapped, plus the engine namespace
just deploy-kind     # builds egret-backend, -frontend, -renderer and -apps images, loads them, helm upgrade --install
```

`just deploy-kind` runs `helm upgrade --install egret deploy/helm/egret -n egret-system --create-namespace --wait --timeout
10m` and then restarts the pods, because a rebuilt `:dev` image with an unchanged tag is otherwise ignored. The web app is
at [http://localhost:30080](http://localhost:30080); sign in as `admin@egret.local` with the password from `values.yaml` (`admin.password`).

For single sign-on and an ingress, `just deploy-kind-oidc` adds `--set oidc.enabled=true --set oidc.devRealm=true --set
ingress.enabled=true` (`just deploy-kind-governance` sets the same two OIDC values). It
needs the ingress controller and the DNS rewrite recipes (`just ingress-install`, `just coredns-rewrite`) first.

Tear down with `just kind-undeploy` (the release only) or `just k8s-down` (the cluster).

### On your own cluster

Build and push the images, then install with your own values:

```bash
helm upgrade --install egret deploy/helm/egret -n egret-system --create-namespace \
  --set backend.image.repository=registry.example.com/egret-backend --set backend.image.tag=1.0.0 \
  --set frontend.image.repository=registry.example.com/egret-frontend --set frontend.image.tag=1.0.0 \
  --set renderer.image.repository=registry.example.com/egret-renderer --set renderer.image.tag=1.0.0 \
  --set admin.password='a long random password' \
  --set ingress.enabled=true --set ingress.host=egret.example.com \
  --set ingress.tls.enabled=true --set ingress.tls.secretName=egret-tls \
  -f my-values.yaml
```

Images are `egret-backend:dev`, `egret-frontend:dev` and `egret-renderer:dev` by default, built by `just images-build` from
`deploy/docker/backend.Dockerfile`, `frontend/Dockerfile` and `renderer/`. They are published nowhere, so you build and
push them yourself.

## Values

The complete file is `deploy/helm/egret/values.yaml`. These are the values to know:

### Backend and images

| Value | Default | Meaning |
|---|---|---|
| `backend.image.repository`, `.tag`, `.pullPolicy` | `egret-backend`, `dev`, `IfNotPresent` | The server image. `frontend.image` and `renderer.image` are the same shape. |
| `backend.replicas` | `1` | Server replicas. Above 1 the chart **fails to render** unless `sharedStore.enabled` or `sharedStore.url` is set. |
| `backend.resources` | requests 500m / 1Gi, limits 2000m / 4Gi | Container resources. |
| `backend.terminationGracePeriodSeconds` | `65` | Keep above the 55 s drain. |
| `frontend.nodePort` | `30080` | NodePort of the web app. |
| `renderer.replicas` | `1` | Renderer replicas. |

### Data API shared store

| Value | Default | Meaning |
|---|---|---|
| `sharedStore.enabled` | `false` | Render and use the in-chart Valkey. |
| `sharedStore.url` | empty | Use an existing Redis or Valkey instead (`redis://valkey:6379/1`). Wins over `enabled`. |
| `sharedStore.maxmemory`, `.maxmemoryPolicy` | `256mb`, `allkeys-lru` | Eviction so a full cache sheds keys instead of failing writes. |
| `sharedStore.memoryRequest`, `.memoryLimit` | `128Mi`, `512Mi` | Container memory. |

The chart passes `backend.replicas` to the server as `EGRET_DATA_API__REPLICAS`, and the server **also** refuses to start
with more than one replica and no shared store, so the guard holds outside the chart.

### Ingress and URLs

| Value | Default | Meaning |
|---|---|---|
| `ingress.enabled` | `false` | Create the ingresses. |
| `ingress.host` | `egret.localtest.me` | The external host. It feeds the OIDC issuer and redirect URL, the machine issuer and the notification links. |
| `ingress.className` | `nginx` | Ingress class. |
| `ingress.tls.enabled` | `false` | Use `https` in every derived URL and set `EGRET_SESSION__SECURE=true`. |
| `ingress.tls.secretName` | empty | An existing TLS Secret (for example from cert-manager). Wins over inline `cert` and `key`. |
| `ingress.tls.cert`, `.key` | empty | Inline PEM; the chart creates `egret-ingress-tls`. |

### Identity

| Value | Default | Meaning |
|---|---|---|
| `admin.email`, `admin.password` | `admin@egret.local`, `Admin12345!` | The break-glass administrator `egret init` creates. **Change the password.** |
| `oidc.enabled` | `false` | Turn on SSO against the **bundled Keycloak** (`oidc.realm`, `clientId`, `clientSecret`, `keycloakImage`, `keycloakAdmin`, `keycloakAdminPassword`). The bundled Keycloak runs in development mode with default credentials. Requires `oidc.devRealm=true`. |
| `oidc.devRealm` | `false` | Confirms that you want the bundled Keycloak with the only realm the chart ships, the **development** realm (`files/egret-realm.json`: no TLS requirement, a `*` redirect URI, the password grant, users with published passwords, client secret `egret-secret`). With `oidc.enabled=true` and this left `false`, the chart refuses to render and names those settings. With it on, the install notes print a warning that anyone who reaches the Keycloak can sign in as a platform admin. Never set it on a cluster other people can reach. |

To use your own identity provider, leave `oidc.enabled=false` (so no Keycloak is deployed) and set the `EGRET_OIDC__*`
variables on the Deployment yourself, as in [Authentication setup](./authentication). The chart has no values for an
external issuer.

### Dependencies

| Value | Default | Meaning |
|---|---|---|
| `deps.enabled` | `true` | Deploy PostgreSQL, RustFS and Mailpit in the release. |
| `deps.postgres.image`, `.user`, `.password`, `.db` | `postgres:16`, `egret`, `egret`, `egret` | Bundled PostgreSQL. The data volume is a 1 GiB claim. |
| `deps.rustfs.image`, `.rootUser`, `.rootPassword`, `.bucket` | `rustfs/rustfs:1.0.1`, `egret`, `egretsecret`, `warehouse` | Bundled object store. |
| `storage.region`, `storage.pathStyle` | `us-east-1`, `true` | Passed to `EGRET_STORAGE__*`. |

:::caution External PostgreSQL and S3 need more than a values change
The README says to set `deps.enabled=false` and point the `EGRET_*` connection values at your services. The chart has no
value for either address: the ConfigMap hardcodes `postgres:5432` and `http://rustfs:9000`, and the storage credentials in
the Secret come from `deps.rustfs.rootUser` and `rootPassword`. With `deps.enabled=false` you must patch the ConfigMap and
Secret templates (or override the variables on the Deployment) yourself.
:::

### Workflow engine

| Value | Default | Meaning |
|---|---|---|
| `workflow.webhooksEnabled` | `false` | Mount the anonymous webhook routes. The key in the URL is the only credential. |
| `workflow.workerEnabled` | `false` | Run the claim loop. **Without it executions never advance.** |
| `workflow.schedulerEnabled` | `false` | Fire `cron:` triggers. Needs the worker. |
| `workflow.containerRunner` | `none` | `none` or `kubernetes`. `docker` is refused by the chart, because a Docker socket in the server is root on the node. |
| `workflow.pluginConfigurations` | empty | Allowed images, for example `'[{type="io.kestra.plugin.ee.kubernetes.runner.Kubernetes",values={allowed-images=["python:3.13-slim"]}}]'`. Empty allows no image. |
| `workflow.pluginHost.image`, `.jvmMaxHeap`, `.killGraceS` | `egret-plugin-host:dev`, `384m`, `15` | The image that runs Kestra plugin tasks. Required with `containerRunner: kubernetes`. Published nowhere; build it from `deploy/docker/plugin-host.Dockerfile`. |
| `workflow.tasks.namespace`, `.helperImage`, `.runAsUser`, `.imagePullSecrets` | `egret-tasks`, `egret-task-helper:dev`, `1000`, `[]` | Where task pods run and how. |
| `workflow.tasks.defaultResources`, `.maxResources` | `{}` | Override the defaults (request 100m / 128Mi, limit 1 / 512Mi; maximum limit 2 / 2Gi, ephemeral storage 10Gi). |
| `workflow.tasks.networkPolicy.podCidr`, `.serviceCidr`, `.apiServerCidrs` | empty (required) | The cluster's pod and service ranges and API server addresses. **The chart fails to render without them** when the runner is `kubernetes`: wrong values silently re-open PostgreSQL to task pods on some network plugins. |
| `workflow.tasks.networkPolicy.deniedCidrs`, `.deniedNamespaces` | `["169.254.169.254/32"]`, `[]` | Addresses and namespaces task pods must not reach. The default blocks the cloud metadata service. |

Running a script task also needs the workspace feature `workflow_containers` (off by default) and an image allowed by
`pluginConfigurations`; a plugin task needs `workflow_kestra_plugins`.

### Ranger, apps, engines

| Value | Default | Meaning |
|---|---|---|
| `ranger.enabled` | `false` | Sets `EGRET_RANGER__ENABLED`. The chart sets `EGRET_RANGER__AUTH_TOKEN` to empty, so stock plugins can download policies. |
| `engineNamespace` | `egret-engines` | Where Egret provisions engines. Normally pre-created by `just k8s-up`; set `createEngineNamespace=true` on a bare cluster. |
| `engineNetworkPolicy.enabled` | `true` | Render `NetworkPolicy/egret-engine-isolation` in `engineNamespace` and `NetworkPolicy/egret-ingress` in the release namespace. |
| `engineNetworkPolicy.operatorNamespaces` | `[starrocks]` | Namespaces of the StarRocks operator, let in on the front end's 8030 and 9030. |
| `engineNetworkPolicy.ingressFrom` | `[]` | NetworkPolicy peers an engine Ingress forwards from (your ingress controller), let in on 8030 (StarRocks front end) and 8080 and 8443 (Trino). **Required when an engine has an Ingress**, or the Ingress gets no traffic. |
| `engineNetworkPolicy.extraFrom` | `[]` | Other NetworkPolicy peers, let in on every port, for example a metrics scraper. |
| `opa.enabled` | `true` | Sets `EGRET_GOVERNANCE__OPA__ENABLED=true` (`false` when you turn it off; the chart renders the variable either way) and `EGRET_GOVERNANCE__OPA__LISTEN=0.0.0.0:<opa.port>`, and adds the `opa` port to the Deployment and the `Service/egret`. Profiles stay on Ranger until an operator switches them. It still needs `ranger.enabled`. Set `opa.enabled=false` to turn OPA off. See [Trino on OPA](../data-governance/engines-and-policy/trino-on-opa.md). |
| `opa.port` | `8082` | The port of Egret's OPA listener. Egret derives the URL engines use from `catalog.public_url` with this port, so no other value is needed while that URL is Egret's in-cluster address. |
| `opa.extraFrom` | `[]` | NetworkPolicy peers beyond `engineNamespace` that may reach the OPA port, for example the namespace of an external Trino on OPA. |
| `apps.origin`, `apps.egretOrigin` | empty | The Data Apps origin (a sibling subdomain such as `apps.<host>`) and Egret's own origin. Empty turns the apps iframe and its listener off. |
| `apps.pod.launcher` | `none` | `kubernetes` starts one hardened pod per author per workspace in `apps.pod.namespace` (`egret-apps`). Also `image`, `imagePullPolicy`, `resources`, `readyTimeoutSecs`, `idleSecs`, `networkPolicy.enabled` and `run.*`. |

## Engines on Kubernetes

For Egret to provision an engine, its service account needs the rights the chart's `egret-engine-provisioner` Role grants in
`engineNamespace`: deployments and stateful sets, services, config maps, secrets, pods, volume claims, jobs, and the
`StarRocksCluster` resource. StarRocks additionally needs the kube-starrocks operator installed (the manifests are vendored in
`deploy/starrocks-operator/`). Trino is provisioned as plain Deployments with no operator. See [Engines and Ranger
setup](./engines-and-ranger) and [Query engines](../control-plane/query-engines).

### Engine network policy

An engine answers anyone who can reach its ports and has a login: StarRocks also serves an HTTP SQL API on 8030 and Trino
its HTTP port, and only Egret needs either. `NetworkPolicy/egret-engine-isolation` (on by default since platform
#828) therefore admits, into `engineNamespace`:

| From | Ports |
|---|---|
| pods of `engineNamespace` itself (StarRocks front end and compute nodes, Trino coordinator and workers, the StarRocks password Job) | all |
| Egret's pods (`app: egret` in the release namespace) | all |
| `engineNetworkPolicy.operatorNamespaces` (the StarRocks operator runs SQL and HTTP calls against the front end) | 8030, 9030 |
| `engineNetworkPolicy.ingressFrom` (the ingress controller of an engine Ingress) | 8030, 8080, 8443 |
| `engineNetworkPolicy.extraFrom` | all |

Everything else is refused, including workflow task pods and app pods (they query through Egret) and Egret's other pods
(PostgreSQL, RustFS). Egress is not restricted: engines still reach Egret's policy API, the catalog and object storage.
Measured on kind 0.29 with a listener on 8030, 9030, 8080 and 9010: before the policy every client connected to every port;
after it, a task pod and a non-Egret pod of the release namespace were refused on all four, the operator's namespace got
8030 and 9030 only, and an `ingressFrom` peer got 8030 and 8080 only.

`NetworkPolicy/egret-ingress` protects Egret's own pods the other way round. It selects the backend pods (`app: egret`) and admits 8080 from every peer (the frontend, ingresses, app and task pods and the kubelet use it), 8081 when `apps.origin` is set, and the OPA port, 8082 by default, **only** from `engineNamespace` and `opa.extraFrom`. The OPA surface reads a request body before it can authenticate it, so a pod that could reach that port could hold stalled requests and exhaust the budget engines need. The policy renders whenever `engineNetworkPolicy.enabled` is set, with or without `opa.enabled`. This describes what the chart renders; it has not been run on a live cluster.

An external engine on OPA lives outside `engineNamespace`: add its namespace to `opa.extraFrom`, for example `- namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: trino-prod } }`. Any firewall between the engines and Egret must allow the OPA port too. When `catalog.public_url` is not Egret's in-cluster address, set `[governance.opa] engine_url` (see [Trino on OPA](../data-governance/engines-and-policy/trino-on-opa.md#network-exposure)).

The policy needs a network plugin that enforces NetworkPolicy (kind 0.24 and later, Calico, Cilium and most managed
clusters do). An external engine is outside it: put it behind your own firewall.

## Verify

```bash
kubectl get pods -n egret-system
kubectl get job -n egret-system egret-init          # completed once the administrator exists
kubectl logs -n egret-system deploy/egret | head
curl -s http://<host>/readyz                        # {"status":"ok","db":"up"}
```

## Troubleshooting the install

| Symptom | Cause and fix |
|---|---|
| `helm` fails with *backend.replicas is 2, but no shared store is configured* | Set `sharedStore.enabled=true`, or `backend.replicas=1`. |
| `helm` fails with *workflow.tasks.networkPolicy.podCidr and serviceCidr must be set* | Set the cluster's CIDRs; on kind they are `10.244.0.0/16` and `10.96.0.0/12`. |
| `helm` fails with *workflow.containerRunner=docker is for local development only* | Use `kubernetes`. |
| The web app is unreachable on `localhost:30080` | kind port mappings apply only when the cluster is created. Recreate the cluster, or `kubectl port-forward -n egret-system svc/egret-frontend 8090:80`. |
| *Invalid email or password* on a fresh install | The `egret-init` job has not finished; `kubectl get job -n egret-system egret-init -w`, or `kubectl exec -n egret-system deploy/egret -- egret init`. |
| The backend restarts once on first boot | Expected: it races PostgreSQL becoming ready and reconnects. |

## Further reading

- [Upgrades and migrations](./upgrade)
- [Security hardening checklist](./security-hardening)
