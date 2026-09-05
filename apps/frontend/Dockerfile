# Build context is the repo root (pnpm workspace), not this directory.
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/frontend apps/frontend

# Defensive: a stray local .tsbuildinfo/dist that slips past .dockerignore can
# corrupt incremental compilation and silently drop compiled .js files.
RUN rm -rf packages/shared/dist apps/frontend/dist

# Vite bakes VITE_ variables into the build, so this must be set as a Railway
# build variable on the frontend service before the first deploy.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm --filter @devotion/shared build
RUN pnpm --filter @devotion/frontend build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /repo/apps/frontend/dist ./dist
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
