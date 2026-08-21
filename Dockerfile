FROM node:24.10.0-bookworm-slim AS dependencies
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
ENV CI=true
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY . .
# Dynamic pages import the database client during Next's build-time route analysis.
# Keep runtime secret injection unchanged while providing a non-network placeholder here.
ENV DATABASE_URL_FILE="" DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN pnpm typecheck && pnpm test && pnpm build

FROM dependencies AS tooling
COPY --chown=node:node . .
RUN chown -R node:node /app

FROM tooling AS worker
RUN pnpm typecheck && pnpm test
RUN chown -R node:node /app
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
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# pnpm's symlinked @swc/helpers package is only partially traced by Next standalone.
# Include its ESM helpers so the standalone server can resolve Next's generated imports.
COPY --from=build --chown=nextjs:nodejs /app/node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers/esm ./node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers/esm
COPY --from=build --chown=nextjs:nodejs /app/node_modules/.pnpm/@swc+helpers@0.5.23/node_modules/@swc/helpers ./node_modules/.pnpm/next@16.3.1_@playwright+test@1.62.1_@types+node@24.10.0_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/@swc/helpers
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
