# syntax=docker/dockerfile:1
# Multi-stage build for the full-stack web app (Next.js serves UI + the
# in-process Hono API). Output is the Next standalone server.
FROM node:22-alpine AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile \
  && pnpm --filter @pmin/web build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    UPLOADS_DIR=/data/uploads
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./.next/static
EXPOSE 3000
VOLUME /data/uploads
CMD ["node", "server.js"]
