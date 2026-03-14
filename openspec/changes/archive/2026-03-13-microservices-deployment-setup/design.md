## Context

The tracker-services monorepo contains four NestJS microservices (api-gateway, auth-service, users-service, expenses-service) alongside shared packages (database, shared, eslint-config, typescript-config). Currently, only PostgreSQL, Redis, and Redis Commander run via Docker Compose. Developers run services natively using `pnpm dev` (which invokes `turbo run dev`). The monorepo uses pnpm 10.10.0 workspaces with Node.js 22.15.0 and Turbo for orchestration.

## Goals / Non-Goals

**Goals:**

- Containerize all four microservices with production-optimized multi-stage Dockerfiles
- Extend Docker Compose to orchestrate the full application stack (infra + services)
- Preserve the existing `pnpm dev` workflow for developers who prefer native execution
- Enable one-command startup of the entire stack via `docker compose up`

**Non-Goals:**

- Kubernetes manifests or cloud-specific deployment configs
- CI/CD pipeline setup (separate initiative)
- Production hardening (secrets management, resource limits tuning, logging drivers)
- Service mesh or advanced networking beyond the existing bridge network

## Decisions

### 1. Single multi-stage Dockerfile per service (not a shared base image)

Each service gets its own Dockerfile using a multi-stage pattern: `deps → build → runtime`. The stages leverage pnpm's `--filter` flag to install only the dependencies each service needs.

**Why not a shared base image?** A shared base adds a build/publish step and registry dependency. With multi-stage builds, Docker layer caching already deduplicates the common Node.js + pnpm setup across services. Keeping Dockerfiles self-contained is simpler for a four-service repo.

### 2. Extend the existing docker-compose.yml rather than using overlays

Add service definitions directly to the existing `docker-compose.yml`. Use profiles to separate infrastructure (`infra`) from application services (`app`) so developers can still run only Postgres + Redis when developing natively.

**Why not docker-compose.override.yml?** Overlays add cognitive overhead for a small team. Profiles achieve the same selective-startup goal with a single file: `docker compose up` starts only databases, `docker compose --profile app up` starts the full stack.

### 3. Build context at repo root with per-service Dockerfile paths

Set the Docker build context to the repo root (`.`) so that workspace packages (`packages/*`) are accessible during build. Each service specifies its Dockerfile path via `build.dockerfile`.

**Why?** pnpm workspace dependencies (e.g., `@tracker/database`, `@tracker/shared`) must be resolvable at build time. A repo-root context is the simplest way to achieve this without copying or symlinking packages.

### 4. Use pnpm deploy for production-ready node_modules

In the build stage, use `pnpm deploy --filter=@tracker/<service> --prod` to create a self-contained production directory with only the runtime dependencies. This avoids shipping devDependencies and the full monorepo into the container.

### 5. Environment configuration via .env.docker

Create a `.env.docker` file with Docker-specific defaults (e.g., `POSTGRES_HOST=postgres` instead of `localhost`). Docker Compose references this file via `env_file`. The `.env.docker` is committed with safe defaults; secrets are overridden at deploy time.

## Risks / Trade-offs

- **Build time for monorepo context** → Mitigated by `.dockerignore` excluding `node_modules`, `.git`, `dist`, and test files. Layer caching handles repeat builds.
- **pnpm deploy compatibility** → pnpm deploy is stable in v10.x; if issues arise, fallback to `pnpm install --filter --prod` with a full lockfile copy.
- **Service startup ordering** → Use `depends_on` with health checks on Postgres and Redis so services don't crash-loop waiting for databases. NestJS microservice transport (TCP) connections between services are retry-tolerant.
- **Divergence between native and Docker dev workflows** → Documented in README; `.env.docker` isolates Docker-specific config from the local `.env`.
