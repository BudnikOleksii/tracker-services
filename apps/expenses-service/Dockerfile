FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate
WORKDIR /app

# --- Dependencies ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json .npmrc ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/users-service/package.json ./apps/users-service/
COPY apps/expenses-service/package.json ./apps/expenses-service/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/ ./packages/eslint-config/
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM deps AS build
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY apps/expenses-service ./apps/expenses-service
RUN pnpm turbo run build --filter=@tracker/expenses-service...
RUN pnpm deploy --filter @tracker/expenses-service --prod --legacy /app/deployed

# --- Runtime ---
FROM node:22-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/deployed ./
USER appuser
EXPOSE 3002
CMD ["node", "dist/main.js"]
