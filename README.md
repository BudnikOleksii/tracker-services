# Tracker Services

Monorepo containing four NestJS microservices for the Tracker application.

## Services

| Service          | Port | Transport | Description                     |
| ---------------- | ---- | --------- | ------------------------------- |
| api-gateway      | 3000 | HTTP      | API routing, auth, Swagger docs |
| auth-service     | 3001 | TCP       | Authentication, JWT, lockout    |
| expenses-service | 3002 | TCP       | Expense tracking                |
| users-service    | 3003 | TCP       | User management                 |

## Prerequisites

- Node.js 22.15.0
- pnpm 10.10.0
- Docker & Docker Compose

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Infrastructure (database + cache)

```bash
docker compose up -d
```

This starts:

- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`
- **Redis Commander** (UI) on `localhost:8081`

### Run services locally

```bash
pnpm dev
```

This uses Turbo to start all four services in watch mode.

## Docker

### Full stack (all services containerized)

```bash
docker compose --profile app up
```

Builds and starts all four microservices alongside PostgreSQL and Redis. Services wait for databases to be healthy before starting.

### Build a single service image

```bash
docker build -f apps/<service>/Dockerfile . -t tracker-<service>
```

Build context must be the repo root (`.`) since workspace packages are needed.

### Environment configuration

Docker services use `.env.docker` for environment variables. This file contains Docker-network defaults (e.g., `POSTGRES_HOST=postgres` instead of `localhost`). For local development without Docker, create a `.env` file with `localhost` values.

Key variables in `.env.docker`:

| Variable                | Default                                                 | Used by                   |
| ----------------------- | ------------------------------------------------------- | ------------------------- |
| `DATABASE_URL`          | `postgresql://tracker:tracker123@postgres:5432/tracker` | all services              |
| `CACHE_URL`             | `redis://redis:6379`                                    | all services              |
| `JWT_ACCESS_SECRET`     | dev default                                             | api-gateway, auth-service |
| `JWT_REFRESH_SECRET`    | dev default                                             | auth-service              |
| `AUTH_SERVICE_HOST`     | `auth-service`                                          | api-gateway               |
| `USERS_SERVICE_HOST`    | `users-service`                                         | api-gateway               |
| `EXPENSES_SERVICE_HOST` | `expenses-service`                                      | api-gateway               |
| `EMAIL_HOST`            | `mailpit`                                               | auth-service              |

### Architecture

```
                    ┌─────────────────┐
                    │   api-gateway   │ :3000 (HTTP)
                    └────────┬────────┘
                             │ TCP
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌────────────────┐
      │ auth-service │ │  users   │ │    expenses    │
      │    :3001     │ │  :3003   │ │     :3002      │
      └──────┬───────┘ └────┬─────┘ └───────┬────────┘
             │              │               │
             └──────────────┼───────────────┘
                            ▼
                    ┌──────────────┐
                    │  PostgreSQL  │ :5432
                    └──────────────┘
```

All services communicate over the `tracker-network` Docker bridge network.
