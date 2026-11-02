#!/bin/bash
set -e
pnpm install --frozen-lockfile
export MARJEA_APPLY_DEV_MIGRATION=1
pnpm --filter @workspace/db exec node ./apply-phase15.mjs
pnpm --filter @workspace/db exec node ./apply-phase2a.mjs
pnpm --filter @workspace/db exec node ./apply-phase2a-queue.mjs
pnpm --filter @workspace/db exec node ./apply-phase2a-coverage.mjs
pnpm --filter @workspace/db exec node ./apply-workspace-integration.mjs
pnpm --filter @workspace/db exec node ./apply-rss-local-test.mjs
