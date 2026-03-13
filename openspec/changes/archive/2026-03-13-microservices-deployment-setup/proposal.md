## Why

The tracker-services monorepo has four NestJS microservices (api-gateway, auth-service, users-service, expenses-service) but only PostgreSQL and Redis are containerized via Docker Compose. Developers must manually run each service locally, and there's no containerized path for deploying the application stack. Dockerizing all services with a unified Compose setup enables consistent local development, easier onboarding, and a foundation for production deployment.

## What Changes

- Add a `Dockerfile` for each microservice (api-gateway, auth-service, users-service, expenses-service) using multi-stage builds optimized for pnpm monorepo filtering
- Add a shared base Dockerfile or build stage for common Node.js + pnpm setup
- Extend the existing `docker-compose.yml` (or create a `docker-compose.services.yml` overlay) to include all four services alongside the existing PostgreSQL and Redis containers
- Add `.dockerignore` to keep images lean
- Add environment variable configuration for service-to-service communication within the Docker network

## Capabilities

### New Capabilities

- `service-containerization`: Dockerfile definitions and Docker Compose orchestration for all four microservices, including multi-stage builds, health checks, dependency ordering, and network configuration

### Modified Capabilities

_None — no existing spec-level requirements are changing._

## Impact

- **Code**: New Dockerfiles in each app directory, updated/extended docker-compose configuration at repo root
- **Dependencies**: No new runtime dependencies; Docker and Docker Compose are required dev tools
- **APIs**: No API changes — services expose the same ports, now mapped through Docker
- **Systems**: Local development workflow gains a `docker compose up` option for the full stack; existing `pnpm dev` workflow remains unaffected
