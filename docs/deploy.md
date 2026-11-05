# Cloud Deployment Guide for Domain-Driven Trading Engine on Render & Managed Cloud Services

This document outlines the architecture, service mapping, and step-by-step roadmap for migrating the infrastructure of the **Domain-Driven Trading Engine (`domain-driven-trading` / `ddd-trading`)** from a local development environment (**Docker Compose**) to **Managed Cloud Services (Serverless / SaaS) & Render Compute**, maximizing cloud service leverage with zero-maintenance, high-availability, and serverless scale-to-zero operations.

---

## 1. Cloud Deployment Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Client Layer (Edge CDN Hosting)"]
        WebUI["Trading Terminal Web UI<br/>(React 18 + Vite + Tailwind CSS)<br/><b>Cloudflare Pages / Vercel / Render Static Site</b>"]
    end

    subgraph RenderCompute ["2. Application Compute Layer (Render PaaS)"]
        direction TB
        Gateway["DDT API Gateway & Matcher (:10000)<br/>REST API & WebSocket (/ws/market)<br/>In-Memory Book + RecoverBook()<br/><b>Render Web Service</b>"]
        Settlement["DDT Settlement Worker<br/>Async Event Consumer (Watermill)<br/>pgx.Batch Idempotent Settlement<br/><b>Render Background Worker</b>"]
    end

    subgraph ManagedData ["3. Managed Cloud Data & Infra Services (Replaces Local Docker)"]
        direction LR
        Supabase[("Supabase PostgreSQL 16<br/>System of Record, Ledger & RLS<br/>Tokyo PgBouncer (:6543)<br/><i>(Replaces ddt-postgres)</i>")]
        UpstashRedis[("Upstash Redis 7<br/>Pre-Trade Idempotency (SETNX)<br/>Serverless rediss://<br/><i>(Replaces ddt-redis)</i>")]
        UpstashKafka{{"Upstash Kafka / Redpanda<br/>Topics: orders.placement, orders.events<br/>SASL/PLAIN + TLS (:9092)<br/><i>(Replaces ddt-redpanda)</i>"}}
    end

    subgraph SecurityObservability ["4. Managed Auth & Observability"]
        direction LR
        SupabaseAuth["Supabase Auth (GoTrue)<br/>RS256 JWT Verification via JWKS<br/><i>(Claims: account_id)</i>"]
        BetterStack["Better Stack (Logtail) / Render<br/>Structured slog JSON Observability<br/><i>(Live Tail & Invariant Alerts)</i>"]
    end

    WebUI -->|"HTTPS (REST) & WSS"| Gateway
    Gateway -->|"Verify Bearer JWT"| SupabaseAuth
    Gateway -->|"Query & Reserve Funds"| Supabase
    Gateway -->|"Deduplicate ClientOrderID"| UpstashRedis
    Gateway -->|"Publish Trade & Depth Events"| UpstashKafka
    UpstashKafka -->|"Consume orders.events"| Settlement
    Settlement -->|"Batch Audit Persistence"| Supabase
    Gateway -.->|"Recover Book on Startup"| Supabase
    Gateway & Settlement -.->|"Structured slog JSON"| BetterStack
```

---

## 2. Service Mapping: Local Docker ➔ Managed Cloud Services

This architecture maximizes serverless SaaS providers to eliminate database/broker administration overhead and reduce idle operational costs to zero.

| Local Docker Service | Container Name | Recommended Cloud Replacement | Free Tier Availability | Key Highlights & Architectural Value |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 16** | `ddt-postgres` | **Supabase PostgreSQL 16** ([supabase.com](https://supabase.com)) <br/>*(Active in `.env`: project `dxbbbhwqokvfsedoiths`)* | **500 MB Storage**, unlimited API calls, free auto-backups | • **Already integrated**: `.env` is pre-configured with Tokyo AWS pooler (`aws-0-ap-northeast-1.pooler.supabase.com:6543`).<br/>• **Transaction Pooling**: Native PgBouncer integration compatible with `pgx.QueryExecModeSimpleProtocol` in `cmd/gateway/store.go`.<br/>• **Row-Level Security (RLS)**: Pre-configured service-role bypass via `002_supabase_init.sql`.<br/>• **Direct URL**: Port 5432 direct connection for instant DDL migrations (`003_persistence_recovery.sql`). |
| **Redis 7** | `ddt-redis` | **Upstash Redis** ([upstash.com](https://upstash.com)) <br/>*(or Render Managed Redis)* | **10,000 commands/day free forever** (auto scale-to-zero) | • Sub-millisecond pre-trade request deduplication (`SETNX idem:{account}:{key}`).<br/>• Standard `rediss://` TLS endpoint supporting `go-redis/v9`.<br/>• Zero server maintenance or patching; automatic replication across availability zones.<br/>• Fallback support: `IDEMPOTENCY=memory` available for local/staging runs. |
| **Redpanda / Kafka** | `ddt-redpanda` | **Upstash Kafka** ([upstash.com](https://upstash.com)) <br/>*(or Redpanda Cloud Serverless)* | **10,000 messages/day free** | • Serverless message streaming for topics `orders.placement`, `orders.events`, and `market.depth`.<br/>• Full native support for SASL/PLAIN + TLS (`KAFKA_SASL_USER`, `KAFKA_SASL_PASSWORD`, `KAFKA_TLS=true`).<br/>• Eliminates ZooKeeper/KRaft cluster maintenance.<br/>• Consumer groups fully supported for `settlement` worker. |
| **Authentication & Identity** | *(Config / In-Memory)* | **Supabase Auth / GoTrue** ([supabase.com/auth](https://supabase.com/auth)) | **50,000 Monthly Active Users (MAU) free** | • Pre-wired in `.env`: `SUPABASE_JWKS_URL=https://dxbbbhwqokvfsedoiths.supabase.co/auth/v1/.well-known/jwks.json`.<br/>• Automatic RS256 token signing and public key rotation.<br/>• Direct mapping of custom trading account claims (`AUTH_ACCOUNT_CLAIM=account_id`). |
| **Observability & Logging** | *(Local stdout)* | **Better Stack (Logtail)** ([betterstack.com](https://betterstack.com)) <br/>*(or Render Log Streams)* | **1 GB/mo free log ingestion**, 3-day retention | • Seamless structured JSON log forwarding from Go `log/slog` output.<br/>• Real-time live log search with SQL queries for transaction audits and dead-letter queue (DLQ) alerts.<br/>• Uptime monitoring for `/health` endpoint with email/webhook alerting. |
| **Static Web Hosting** | `web/` (Local Vite) | **Cloudflare Pages** ([pages.cloudflare.com](https://pages.cloudflare.com)) <br/>*or Vercel / Render Static Site* | **Unlimited bandwidth**, 500 builds/mo free | • Global Anycast CDN with sub-50ms edge delivery.<br/>• Instant preview deployments for every Git branch.<br/>• Automated Single Page Application (SPA) rewrites for client-side routing. |

---

## 3. Application Compute Hosting Options on Render

Application compute services remain hosted on **Render** (container/Go native execution), communicating securely with the managed cloud data layer:

| Component | Codebase Entrypoint | Render Service Type | Build & Run Configuration | Key Operational Role |
| :--- | :--- | :--- | :--- | :--- |
| **DDT API Gateway** | `cmd/gateway/main.go` | **Web Service** (Go runtime or Docker) | **Build:** `go build -trimpath -o bin/gateway ./cmd/gateway`<br/>**Start:** `./bin/gateway`<br/>**Port:** `$PORT` (`10000`) | Exposes public REST endpoints and `/ws/market` WebSocket stream. Hosts in-memory matching engine and recovers book state from Supabase on boot via `RecoverBook()`. |
| **DDT Settlement Worker** | `cmd/settlement/main.go` | **Background Worker** (Go runtime) | **Build:** `go build -trimpath -o bin/settlement ./cmd/settlement`<br/>**Start:** `./bin/settlement` | Headless consumer subscribed to `orders.events`. Persists executed trades and double-entry ledger vouchers to Supabase via `pgx.Batch`. |
| **Web Trading Terminal** | `web/` | **Static Site** *(or Cloudflare Pages)* | **Build:** `pnpm install && pnpm build`<br/>**Publish:** `dist` | React 18 + Vite + Tailwind CSS interactive terminal, Level 2 order book visualizer, and trade tape. |
| **Matching Engine (Legacy)** | `cmd/engine/main.go` | *Deprecated* | *N/A* | Deprecated in codebase; matching engine is integrated directly into `cmd/gateway` as the authoritative core. |

---

## 4. Render Blueprint Specification (`render.yaml`)

With databases, cache, and message brokers managed externally on **Supabase** and **Upstash**, the Render deployment is lightweight and compute-only:

```yaml
version: "1"

services:
  # ==============================================================================
  # 1. API GATEWAY & WEBSOCKET MATCHING ENGINE (Web Service)
  # ==============================================================================
  - type: web
    name: ddt-gateway
    runtime: go
    plan: starter
    region: singapore # Close to Tokyo Supabase pooler for minimal latency
    buildCommand: go build -trimpath -o bin/gateway ./cmd/gateway
    startCommand: ./bin/gateway
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: PORT
        value: 10000
      - key: LOG_LEVEL
        value: info
      # --- Supabase Database Configuration ---
      - key: STORE
        value: postgres
      - key: DATABASE_URL
        sync: false # Set to Supabase Transaction Pooler (Port 6543)
      # --- Upstash Redis Idempotency ---
      - key: IDEMPOTENCY
        value: redis
      - key: REDIS_ADDR
        sync: false # e.g. sample-endpoint.upstash.io:6379
      - key: REDIS_PASSWORD
        sync: false
      # --- Upstash Kafka Broker ---
      - key: BUS
        value: kafka
      - key: KAFKA_BROKERS
        sync: false # e.g. sample-kafka.upstash.io:9092
      - key: KAFKA_SASL_USER
        sync: false
      - key: KAFKA_SASL_PASSWORD
        sync: false
      - key: KAFKA_TLS
        value: "true"
      # --- Supabase Auth & JWT ---
      - key: AUTH_MODE
        value: jwt
      - key: JWKS_URL
        value: https://dxbbbhwqokvfsedoiths.supabase.co/auth/v1/.well-known/jwks.json
      - key: JWT_ISSUER
        value: https://dxbbbhwqokvfsedoiths.supabase.co/auth/v1
      - key: JWT_AUDIENCE
        value: authenticated
      - key: AUTH_ACCOUNT_CLAIM
        value: account_id
      # --- Reverse Proxy & Security Hardening ---
      - key: TRUSTED_PROXY
        value: "true" # Enables X-Forwarded-For parsing behind Render proxy
      - key: CORS_ALLOWED_ORIGINS
        sync: false # e.g. https://ddt-web.onrender.com or https://ddt-terminal.pages.dev
      - key: RATE_LIMIT_RPS
        value: "200"
      - key: RATE_LIMIT_WRITE_RPS
        value: "100"
      - key: WS_MAX_CLIENTS
        value: "1000"

  # ==============================================================================
  # 2. SETTLEMENT WORKER (Background Worker)
  # ==============================================================================
  - type: worker
    name: ddt-settlement
    runtime: go
    plan: starter
    region: singapore
    buildCommand: go build -trimpath -o bin/settlement ./cmd/settlement
    startCommand: ./bin/settlement
    autoDeploy: true
    envVars:
      - key: LOG_LEVEL
        value: info
      - key: DATABASE_URL
        sync: false # Connects to Supabase Transaction Pooler
      - key: BUS
        value: kafka
      - key: KAFKA_BROKERS
        sync: false
      - key: KAFKA_SASL_USER
        sync: false
      - key: KAFKA_SASL_PASSWORD
        sync: false
      - key: KAFKA_TLS
        value: "true"

  # ==============================================================================
  # 3. TRADING TERMINAL WEB FRONTEND (Static Site)
  # ==============================================================================
  - type: static
    name: ddt-web
    rootDir: web
    buildCommand: pnpm install && pnpm build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_GATEWAY_URL
        sync: false # e.g. https://ddt-gateway.onrender.com
```

---

## 5. Production Environment Template (`.env.production`)

```ini
# ==============================================================================
# DOMAIN-DRIVEN TRADING ENGINE - PRODUCTION CLOUD ENVIRONMENT TEMPLATE
# ==============================================================================

# --- 1. SERVER & RUNTIME ---
PORT=10000
LOG_LEVEL=info
TRUSTED_PROXY=true
CORS_ALLOWED_ORIGINS=https://ddt-web.onrender.com,https://ddt-terminal.pages.dev
RATE_LIMIT_RPS=200
RATE_LIMIT_WRITE_RPS=100
WS_MAX_CLIENTS=1000

# --- 2. SUPABASE POSTGRESQL 16 (Replaces ddt-postgres) ---
# Active project: dxbbbhwqokvfsedoiths (Tokyo AWS pooler)
# Transaction Pooler (PgBouncer IPv4 Port 6543) - Used by Gateway & Settlement
STORE=postgres
DATABASE_URL=postgres://postgres.dxbbbhwqokvfsedoiths:YOUR_DB_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require

# Direct Connection (Port 5432) - Used strictly for migrations & DDL
DIRECT_URL=postgres://postgres:YOUR_DB_PASSWORD@db.dxbbbhwqokvfsedoiths.supabase.co:5432/postgres?sslmode=require

# --- 3. UPSTASH REDIS 7 (Replaces ddt-redis) ---
# Standard host:port endpoint from Upstash Console
IDEMPOTENCY=redis
REDIS_ADDR=sample-endpoint.upstash.io:6379
REDIS_PASSWORD=YOUR_UPSTASH_REDIS_TOKEN

# --- 4. UPSTASH KAFKA (Replaces ddt-redpanda) ---
# Serverless Kafka broker with SASL/PLAIN & TLS
BUS=kafka
KAFKA_BROKERS=sample-kafka.upstash.io:9092
KAFKA_SASL_USER=YOUR_UPSTASH_KAFKA_USER
KAFKA_SASL_PASSWORD=YOUR_UPSTASH_KAFKA_PASSWORD
KAFKA_TLS=true

# --- 5. SUPABASE AUTH & SECURITY (Replaces In-Memory Auth) ---
# Automatic RS256 token verification via JWKS
AUTH_MODE=jwt
JWKS_URL=https://dxbbbhwqokvfsedoiths.supabase.co/auth/v1/.well-known/jwks.json
JWT_ISSUER=https://dxbbbhwqokvfsedoiths.supabase.co/auth/v1
JWT_AUDIENCE=authenticated
AUTH_ACCOUNT_CLAIM=account_id

# --- 6. ACCOUNT SEEDING ---
# Ensure institutional balances on cold start (does not overwrite existing records)
SEED_ACCOUNTS=ACC_APX_001:500000000:APX=10000,HPG=5000;ACC_APX_002:300000000:APX=8000;ACC_INST_MM:20000000000:APX=100000,HPG=100000,FPT=50000
```

---

## 6. Migration & Deployment Runbook

### Step 1: Provision & Verify Cloud Services

1. **Supabase PostgreSQL:**
   - Already provisioned under project `dxbbbhwqokvfsedoiths`.
   - Verify network access from Render (allowed by default on Supabase pooler).
2. **Upstash Redis:**
   - Create a Serverless Redis database in region `ap-northeast-1` (Tokyo) or `ap-southeast-1` (Singapore).
   - Note the connection address `REDIS_ADDR` and token password.
3. **Upstash Kafka:**
   - Create a Serverless Kafka cluster.
   - Create required topics with single/multi-partition:
     - `orders.placement`
     - `orders.events`
     - `market.depth`
   - Copy SASL/PLAIN username and password.

### Step 2: Execute Database Migrations to Supabase

Run the automated migration script or apply DDL directly using the direct connection URL:

```powershell
# Option A: Run automated Supabase migration script
$env:SUPABASE_DB_PASSWORD="YOUR_SUPABASE_PASSWORD"
python scripts/migrate_to_supabase.py

# Option B: Run via psql directly against DIRECT_URL (Port 5432)
psql "$env:DIRECT_URL" -f internal/infrastructure/persistence/migrations/002_supabase_init.sql
psql "$env:DIRECT_URL" -f internal/infrastructure/persistence/migrations/003_persistence_recovery.sql
```

> [!IMPORTANT]
> `002_supabase_init.sql` establishes tables with Row Level Security (RLS) policies allowing `service_role` full access. `003_persistence_recovery.sql` creates the sequential order priority index (`idx_orders_open_seq`) and reservation columns necessary for `RecoverBook()`.

### Step 3: Deploy Application Compute Services on Render

1. **Connect Repository to Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com) ➔ **New** ➔ **Blueprint**.
   - Point to your repository containing `render.yaml`.
2. **Configure Environment Secrets:**
   - Set `DATABASE_URL` to your Supabase Transaction Pooler URL (Port 6543).
   - Input Upstash Redis (`REDIS_ADDR`, `REDIS_PASSWORD`) and Upstash Kafka (`KAFKA_BROKERS`, `KAFKA_SASL_PASSWORD`).
   - Set `CORS_ALLOWED_ORIGINS` to the URL of your static site.
3. **Deploy:**
   - Click **Apply** to trigger simultaneous compilation and deployment of `ddt-gateway`, `ddt-settlement`, and `ddt-web`.

### Step 4: Verify Deployment & Health Checks

1. **Gateway Health & Status Check:**
   ```bash
   curl -i https://ddt-gateway.onrender.com/health
   ```
   *Expected:* `HTTP/1.1 200 OK` `{"status":"ok"}`.

2. **Market Depth Inspection:**
   ```bash
   curl -i "https://ddt-gateway.onrender.com/v1/orderbook?symbol=APX&levels=5"
   ```
   *Expected:* `HTTP/1.1 200 OK` returning seeded maker bid/ask queues.

3. **Live WebSocket Stream Subscription:**
   ```bash
   wscat -c wss://ddt-gateway.onrender.com/ws/market
   ```
   *Expected:* Instant JSON snapshot of Level 2 market depth followed by heartbeats.

4. **Verify Settlement Worker Logs:**
   In Render console logs for `ddt-settlement`:
   ```text
   {"level":"INFO","msg":"settlement worker connected to PostgreSQL"}
   {"level":"INFO","msg":"event bus ready","bus":"kafka"}
   {"level":"INFO","msg":"settlement consumer subscribed to orders.events"}
   ```

---

## 7. Operational Resilience & Invariant Guarantees

### 1. In-Memory Book Recovery & Zero Drift
The continuous matching engine executes in-memory for sub-microsecond matching. On cold boots or auto-deploys, `command.RecoverBook()` executes against Supabase:
- Replays all active orders from `orders` where `status IN ('NEW', 'PARTIALLY_FILLED')` ordered by `seq ASC`.
- Rebuilds in-memory locked balances (`locked_cash` and `locked_quantity`).
- Reconstructs identical bid/ask queues without duplicating orders.

### 2. Double-Entry Accounting Invariant
All executions processed by `ddt-settlement` record atomic debit/credit journal vouchers satisfying:
$$\sum \text{Stock Debits} = \sum \text{Stock Credits}$$
$$\sum \text{Cash Debits} = \sum \text{Cash Credits}$$
Exchange transaction fees are credited to `FEE_COLLECTOR` with zero balance leakage.

### 3. Pre-Trade Idempotency via Upstash Redis
Every incoming order request on `/v1/orders` checks `SETNX` against Upstash Redis using key `idem:{account}:{client_order_id}`. Replays return the cached outcome with status 200, preventing double reservations or order duplication.
