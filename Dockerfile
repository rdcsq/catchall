FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY . .
RUN bun install --frozen-lockfile
RUN cd frontend && bun --bun run build

FROM base AS final
COPY --from=install /app/backend/src/index.ts .
COPY --from=install /app/frontend/dist/ /app/public
COPY --from=install /app/frontend/public/ /app/public

ENTRYPOINT ["bun", "run", "index.ts"]