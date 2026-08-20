FROM node:24.10.0-bookworm-slim AS dependencies
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN pnpm typecheck && pnpm test && pnpm build

FROM dependencies AS tooling
COPY --chown=node:node . .

FROM tooling AS worker
RUN pnpm typecheck && pnpm test
USER node
CMD ["pnpm", "worker"]

FROM worker AS test-runner
ARG OSV_SCANNER_VERSION=2.5.1
ARG OSV_SCANNER_SHA256=f9f25499a2c8cc367b3af45df2ea7eeca7fbccceab9c35079968f4b3652194be
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && curl -fsSLo /usr/local/bin/osv-scanner "https://github.com/google/osv-scanner/releases/download/v${OSV_SCANNER_VERSION}/osv-scanner_linux_amd64" \
 && echo "${OSV_SCANNER_SHA256}  /usr/local/bin/osv-scanner" | sha256sum -c - \
 && chmod 0755 /usr/local/bin/osv-scanner \
 && pnpm exec playwright install --with-deps chromium \
 && chmod -R a+rX /ms-playwright \
 && rm -rf /var/lib/apt/lists/*
USER node
CMD ["/bin/sh", "-c", "pnpm build && pnpm test:e2e"]

FROM node:24.10.0-bookworm-slim AS runtime
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
