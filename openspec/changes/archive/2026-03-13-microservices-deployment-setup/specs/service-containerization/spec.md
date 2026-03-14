## ADDED Requirements

### Requirement: Each microservice has a multi-stage Dockerfile

Each microservice (api-gateway, auth-service, users-service, expenses-service) SHALL have a Dockerfile at `apps/<service>/Dockerfile` using a multi-stage build pattern with three stages: dependency installation, build, and production runtime.

#### Scenario: Dockerfile builds successfully for each service

- **WHEN** `docker build -f apps/<service>/Dockerfile .` is run from the repo root
- **THEN** the image builds successfully and contains only production dependencies and compiled output

#### Scenario: Built image uses Node.js 22 Alpine runtime

- **WHEN** the production stage of any service Dockerfile is inspected
- **THEN** it uses `node:22-alpine` as the base image and runs as a non-root user

### Requirement: Docker Compose orchestrates all services

The `docker-compose.yml` SHALL define all four microservices alongside existing infrastructure (Postgres, Redis), with correct dependency ordering and network connectivity.

#### Scenario: Infrastructure starts by default

- **WHEN** `docker compose up` is run from the repo root
- **THEN** only infrastructure services (Postgres, Redis, and Redis Commander) start; no application services are launched

#### Scenario: Full stack starts with the app profile

- **WHEN** `docker compose --profile app up` is run from the repo root
- **THEN** Postgres, Redis, Redis Commander, and all four microservices (api-gateway, auth-service, users-service, expenses-service) start, and the microservices wait for databases to be healthy before accepting connections

### Requirement: Services communicate over the Docker network

All microservices SHALL connect to the existing `tracker-network` and reference each other and infrastructure services by container hostname.

#### Scenario: API gateway reaches backend services

- **WHEN** the api-gateway container sends a request to auth-service, users-service, or expenses-service
- **THEN** the request resolves via Docker DNS using the service name as hostname

#### Scenario: Services connect to Postgres and Redis

- **WHEN** any microservice container starts
- **THEN** it connects to Postgres via `postgres:5432` and Redis via `redis:6379` on the Docker network

### Requirement: Docker-specific environment configuration

A `.env.docker` file SHALL provide environment variables with Docker-network-appropriate defaults for all services.

#### Scenario: Environment file contains all required variables

- **WHEN** `.env.docker` is read
- **THEN** it provides at minimum the following keys with Docker-friendly values:
  - `DATABASE_URL` — full connection string using the Docker service name, e.g. `postgresql://tracker:tracker123@postgres:5432/tracker`
  - `JWT_ACCESS_SECRET` — signing key for access tokens, e.g. `docker-access-secret`
  - `JWT_REFRESH_SECRET` — signing key for refresh tokens, e.g. `docker-refresh-secret`
  - `AUTH_SERVICE_HOST` — Docker hostname for the auth service, e.g. `auth-service`
  - `USERS_SERVICE_HOST` — Docker hostname for the users service, e.g. `users-service`
  - `EXPENSES_SERVICE_HOST` — Docker hostname for the expenses service, e.g. `expenses-service`

#### Scenario: Environment file is committed with safe defaults

- **WHEN** the repository is cloned fresh
- **THEN** `.env.docker` exists with non-secret default values sufficient to start the stack without manual configuration

### Requirement: Dockerignore minimizes build context

A `.dockerignore` file SHALL exist at the repo root to exclude unnecessary files from the Docker build context.

#### Scenario: Large and irrelevant directories are excluded

- **WHEN** Docker builds any service image
- **THEN** `node_modules`, `.git`, `dist`, `coverage`, and `*.log` files are excluded from the build context
