# Deployment Guide — Free Tier (Oracle Cloud + Neon)

## Why This Stack

### Compute: Oracle Cloud Always Free

| Option                 | TCP Support              | Free Duration                   | Code Changes | Verdict         |
| ---------------------- | ------------------------ | ------------------------------- | ------------ | --------------- |
| Render.com             | No (free tier HTTP only) | 90-day DB limit                 | N/A          | Not viable      |
| Railway.app            | Yes (private networking) | ~1-2 weeks ($5 credits)         | None         | Too short       |
| Fly.io                 | Yes (Flycast)            | Ongoing but 3 VM limit (need 5) | None         | Not enough VMs  |
| Monolith consolidation | N/A                      | Any PaaS                        | Significant  | Over-engineered |
| **Oracle Cloud Free**  | **Yes (Docker Compose)** | **Forever**                     | **None**     | **Best option** |

The microservices communicate via NestJS TCP transport, which most free PaaS platforms don't support. Oracle Cloud gives an always-free ARM VM (up to 4 OCPU / 24GB RAM) where `docker compose --profile app up` works identically to local dev — zero code changes, no vendor lock-in, no expiration.

### Database: Neon (managed PostgreSQL)

Running PostgreSQL as a Docker container on the same VM works, but has risks:

- Data lives on a single VM — if it dies, data is gone
- No automatic backups
- Consumes ~200MB RAM on the VM

**Neon** is a better choice for the database:

- **Free tier**: 0.5 GB storage, 190 compute hours/month — plenty for testing
- **Managed backups** and point-in-time recovery
- **Connection pooling** built in
- **Branching** — create database branches for testing
- Only change needed: swap `DATABASE_URL` to point to Neon instead of the local container

### Cache: Redis — Local Container vs Upstash

Redis is not yet used in application code, but the compose stack includes it for when it's needed. When the time comes:

| Option                                   | Free Tier                   | Latency               | Persistence         | Best For                  |
| ---------------------------------------- | --------------------------- | --------------------- | ------------------- | ------------------------- |
| **Docker container on VM (Recommended)** | Unlimited (runs on your VM) | ~0ms (same machine)   | AOF to local volume | Testing, low-traffic apps |
| Upstash                                  | 10K commands/day, 256MB     | ~5-20ms (network hop) | Managed, durable    | Production, multi-region  |

**Recommendation: Keep Redis on the VM** for this testing setup.

- Redis uses ~30MB RAM at idle with the 256MB maxmemory limit — trivial on a 12GB VM
- Zero latency (same Docker network) vs network round-trip to Upstash
- Already configured in `docker-compose.yml` with health checks and persistence
- No additional account or secrets to manage
- The `CACHE_URL=redis://redis:6379` env var already works

**When to switch to Upstash:**

- If you move to a multi-instance setup (multiple VMs or serverless)
- If you need Redis data to survive a full VM rebuild (Upstash is externally managed)
- If you hit the VM memory ceiling with all services + Redis running

To switch later, just change `CACHE_URL` in `.env.production`:

```bash
# Local (current)
CACHE_URL=redis://redis:6379

# Upstash (future)
CACHE_URL=rediss://default:xxx@your-instance.upstash.io:6379
```

Note: Upstash uses `rediss://` (with double s) for TLS connections.

## Architecture

```
Internet
    │
    ▼ :443
┌──────────┐
│   Caddy   │  (reverse proxy + auto SSL)
└─────┬─────┘
      │ :3000
      ▼                                         ┌─────────────────┐
┌──────────────┐                                │   Neon (cloud)   │
│  api-gateway │                                │   PostgreSQL     │
└──────┬───────┘                                └────────▲────────┘
       │ TCP (Docker internal network)                   │
       ├──────────────┬──────────────┐      DATABASE_URL │
       ▼              ▼              ▼                   │
┌──────────┐  ┌──────────┐  ┌────────────┐              │
│   auth   │  │  users   │  │  expenses  │──────────────┘
│  :3001   │  │  :3003   │  │   :3002    │
└──────────┘  └──────────┘  └────────────┘

Oracle Cloud VM (Docker Compose)        Neon (managed DB)
─ api-gateway                           ─ PostgreSQL 15
─ auth-service                          ─ auto backups
─ users-service                         ─ connection pooling
─ expenses-service
─ Redis (for future use)
─ Caddy (reverse proxy)
```

## Step-by-Step

### 1. Set Up Neon Database

1. Sign up at [neon.tech](https://neon.tech) (free, no credit card)
2. Create a new project (select the region closest to your Oracle Cloud region)
3. Copy the connection string — it looks like:
   ```
   postgresql://user:password@ep-xxx-yyy-123.us-east-2.aws.neon.tech/tracker?sslmode=require
   ```
4. Run migrations locally against Neon:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/tracker?sslmode=require" \
     pnpm --filter @tracker/database run db:migrate
   ```

### 2. Provision Oracle Cloud

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) (credit card for verification only — Always Free resources are never charged)
2. Create an Always Free Compute instance:
   - Shape: `VM.Standard.A1.Flex` (ARM)
   - 2 OCPU / 12 GB RAM (within free limits, leaves headroom)
   - OS: Ubuntu 22.04 (Canonical)
   - Boot volume: 50 GB
3. Configure VCN security list ingress rules:
   - TCP 22 (SSH)
   - TCP 80 + 443 (HTTP/HTTPS for reverse proxy)
   - Block everything else — microservices stay internal to Docker network

### 3. Server Setup

```bash
# SSH into the instance
ssh ubuntu@<public-ip>

# Install Docker and Git
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
# Log out and back in for group to take effect

# Clone the repo
git clone git@github.com:BudnikOleksii/tracker-services.git
cd tracker-services
```

### 4. Configure Environment

Create `.env.production` on the server:

```bash
cat > .env.production << 'EOF'
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api

# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/tracker?sslmode=require

# Cache (local Redis, for future use)
CACHE_URL=redis://redis:6379

# JWT (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET=<generate-a-strong-secret>
JWT_REFRESH_SECRET=<generate-a-strong-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Gateway - service discovery
AUTH_SERVICE_HOST=auth-service
AUTH_SERVICE_PORT=3001
EXPENSES_SERVICE_HOST=expenses-service
EXPENSES_SERVICE_PORT=3002
USERS_SERVICE_HOST=users-service
USERS_SERVICE_PORT=3003

# Gateway - CORS
ALLOWED_ORIGINS=https://your-subdomain.duckdns.org

# Auth
AUTH_MAX_FAILED_ATTEMPTS=5
AUTH_LOCKOUT_BASE_MINUTES=1
AUTH_SUSPICIOUS_LOGIN_ENABLED=true

# Email (configure when needed)
EMAIL_HOST=mailpit
EMAIL_PORT=1025
EMAIL_SECURE=false
EMAIL_USER=dev@tracker.dev
EMAIL_PASSWORD=dev-password
EMAIL_FROM=noreply@tracker.dev
EOF
```

Update docker-compose to use the production env file:

```bash
sed -i 's/env_file: .env.docker/env_file: .env.production/g' docker-compose.yml
```

### 5. Build and Deploy

Since PostgreSQL is now on Neon, you can skip the local Postgres container. But keeping it in compose is harmless (services will connect to Neon via `DATABASE_URL`, not the local container).

```bash
# Build and start the full stack
docker compose --profile app up -d --build

# Check that all services are running
docker compose --profile app ps
```

### 6. Verify

```bash
# API gateway should respond
curl http://localhost:3000/api

# Check service logs
docker compose --profile app logs users-service     # "Nest microservice successfully started"
docker compose --profile app logs expenses-service   # "Nest microservice successfully started"
docker compose --profile app logs auth-service       # Known DI issue (#8), fix pending
```

### 7. HTTPS with Caddy (recommended)

Get a free subdomain:

1. Go to [duckdns.org](https://www.duckdns.org), sign in, create a subdomain
2. Point it to your Oracle instance's public IP

Create `Caddyfile` in the repo root:

```
your-subdomain.duckdns.org {
  reverse_proxy api-gateway:3000
}
```

Add Caddy to `docker-compose.yml`:

```yaml
caddy:
  image: caddy:2-alpine
  restart: unless-stopped
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
  networks:
    - tracker-network
```

Add `caddy_data:` to the `volumes:` section, then:

```bash
docker compose up -d caddy
```

Your API is now available at `https://your-subdomain.duckdns.org/api`.

## Automated Deployment with GitHub Actions

### Prerequisites

1. **Generate an SSH key pair** for GitHub Actions:
   ```bash
   ssh-keygen -t ed25519 -f deploy_key -C "github-actions-deploy" -N ""
   ```
2. **Add the public key** to the Oracle VM:
   ```bash
   cat deploy_key.pub >> ~/.ssh/authorized_keys
   ```
3. **Add GitHub repository secrets** (Settings > Secrets and variables > Actions):
   - `DEPLOY_SSH_KEY` — contents of `deploy_key` (private key)
   - `DEPLOY_HOST` — Oracle VM public IP address
   - `DEPLOY_USER` — `ubuntu` (or your VM username)
   - `NEON_DATABASE_URL` — your Neon connection string (for running migrations in CI)

### Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Oracle Cloud

on:
  push:
    branches: [main]

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  init-env:
    runs-on: ubuntu-latest
    outputs:
      node_version: ${{ steps.set-env.outputs.node_version }}
      pnpm_version: ${{ steps.set-env.outputs.pnpm_version }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - id: set-env
        uses: ./.github/actions/env-versions

  test:
    needs: [init-env]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Set up environment
        uses: ./.github/actions/setup-pnpm-node-deps
        with:
          node_version: ${{ needs.init-env.outputs.node_version }}
          pnpm_version: ${{ needs.init-env.outputs.pnpm_version }}

      - name: Type check
        run: pnpm check-types

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

  migrate:
    needs: [init-env, test]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Set up environment
        uses: ./.github/actions/setup-pnpm-node-deps
        with:
          node_version: ${{ needs.init-env.outputs.node_version }}
          pnpm_version: ${{ needs.init-env.outputs.pnpm_version }}
      - name: Build database package
        run: pnpm turbo run build --filter=@tracker/database...

      - name: Run migrations
        run: pnpm --filter @tracker/database run db:migrate
        env:
          DATABASE_URL: ${{ secrets.NEON_DATABASE_URL }}

  deploy:
    needs: [migrate]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd ~/tracker-services
            git pull origin main
            docker compose --profile app up -d --build
            echo "Deploy complete"
```

### How It Works

```
Push to main
    │
    ▼
┌──────────────────┐
│  test (CI)       │  Type check + lint + tests
└────────┬─────────┘
         ▼
┌──────────────────┐
│  migrate         │  Run Drizzle migrations against Neon
└────────┬─────────┘
         ▼
┌──────────────────┐
│  deploy (SSH)    │  git pull + docker compose up --build
└──────────────────┘
```

- **Tests run first** — if they fail, no deployment happens
- **Migrations run before deploy** — database schema is ready before new code starts
- **Concurrency control** — only one deploy at a time, but doesn't cancel in-progress deploys
- **SSH-based deploy** — simple, no Docker registry needed, builds on the server

## Useful Commands

```bash
# View all logs
docker compose --profile app logs -f

# Restart a specific service
docker compose --profile app restart auth-service

# Rebuild and restart after code changes
docker compose --profile app up -d --build

# Check resource usage
docker stats

# Stop everything
docker compose --profile app down

# Run migrations manually (from local machine)
DATABASE_URL="postgresql://..." pnpm --filter @tracker/database run db:migrate
```
