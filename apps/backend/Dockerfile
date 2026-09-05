# Build context is the repo root (pnpm workspace), not this directory.
FROM node:22-slim
WORKDIR /repo
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/backend apps/backend

# Defensive: a stray local .tsbuildinfo/dist that slips past .dockerignore can
# corrupt incremental compilation and silently drop compiled .js files.
RUN rm -rf apps/backend/dist apps/backend/tsconfig.tsbuildinfo packages/shared/dist

RUN pnpm --filter @devotion/shared build
RUN pnpm --filter @devotion/backend prisma:generate
RUN pnpm --filter @devotion/backend build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "pnpm --filter @devotion/backend prisma:deploy && node apps/backend/dist/main.js"]
