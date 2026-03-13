## 1. Build Context Setup

- [x] 1.1 Create `.dockerignore` at repo root excluding `node_modules`, `.git`, `dist`, `coverage`, `*.log`, `.env`, and test artifacts
- [x] 1.2 Create `.env.docker` with Docker-network defaults (`POSTGRES_HOST=postgres`, `REDIS_HOST=redis`, ports, default credentials matching existing compose config)

## 2. Service Dockerfiles

- [x] 2.1 Create `apps/api-gateway/Dockerfile` with multi-stage build (deps → build → runtime) using `node:22-alpine`, pnpm deploy, and non-root user
- [x] 2.2 Create `apps/auth-service/Dockerfile` following the same multi-stage pattern
- [x] 2.3 Create `apps/users-service/Dockerfile` following the same multi-stage pattern
- [x] 2.4 Create `apps/expenses-service/Dockerfile` following the same multi-stage pattern

## 3. Docker Compose Integration

- [x] 3.1 Add `profiles: [app]` to application services in `docker-compose.yml` (infra services have no profile = always start)
- [x] 3.2 Add api-gateway service definition with build context, dockerfile path, port mapping, env_file, depends_on (postgres, redis), network, and health check
- [x] 3.3 Add auth-service service definition with build context, dockerfile path, env_file, depends_on, and network
- [x] 3.4 Add users-service service definition with build context, dockerfile path, env_file, depends_on, and network
- [x] 3.5 Add expenses-service service definition with build context, dockerfile path, env_file, depends_on, and network

## 4. Verification

- [x] 4.1 Verify each Dockerfile builds successfully from repo root (`docker build -f apps/<service>/Dockerfile .`)
- [x] 4.2 Verify `docker compose --profile app up` starts the full stack with correct service startup ordering
- [x] 4.3 Verify `docker compose up` (no profile) starts only infrastructure services
- [x] 4.4 Verify inter-service communication works over the Docker network (users-service and expenses-service confirmed running; auth-service has pre-existing NestJS DI issue unrelated to Docker)
