# Phase 2A — Gate 1

Gate 1 implements schema, development migration and API contracts only.
Semantic routes are **not mounted**. No worker, provider setup, demo data or
feature activation is included. A missing feature-flag row means OFF.

## Development operation

```sh
MARJEA_APPLY_DEV_MIGRATION=1 node lib/db/apply-phase2a.mjs
MARJEA_RUN_DB_TESTS=1 node --test lib/db/tests/phase15.test.mjs lib/db/tests/phase2a.test.mjs
pnpm --filter @workspace/api-spec run codegen
node --test lib/api-spec/tests/phase2a.test.mjs
pnpm run typecheck
```

Never invoke the migration during app startup or a production build.
The development migration uses the existing checksum ledger and advisory lock.
The enum addition commits separately because PostgreSQL forbids using a new
enum value in the transaction that introduces it. If the schema transaction
fails, the unused `reject` enum value is harmless; rerun after addressing the
error. Never alter an applied migration's checksum.

## Security and compatibility

- All six new tables have tenant RLS using `marjea.tenant_id`, and composite
  membership/entity foreign keys. Null/missing tenant context reveals no rows
  to a non-owner, non-BYPASSRLS role.
- Application identities are not database roles. Database tenant policies
  do not replace Clerk authentication, membership checks or endpoint role
  authorization. Those semantic services belong to subsequent gates.
- Request/link roles: `tenant_admin`, `analyst`; assignment/reset:
  `tenant_admin`; analysis decisions: assigned `reviewer` or assigned
  `tenant_admin`, never the requester; deviation decisions:
  `reviewer`, `tenant_admin`; historical reads: any authenticated member.
- No public flag-toggle endpoint. Operational enablement must be separately
  approved, tenant-specific and audited after acceptance tests.
- Analysis inputs/engine identity and saved machine results are immutable by
  database trigger. Machine JSON is an object at the DB boundary; full strict
  schema/evidence/semantic validation belongs to the engine gate before writes.
- Audit rows are append-only, including for the runtime database owner.
- Existing review rows default to `response_draft`, retain their sequence
  uniqueness, and cannot receive `reject`. Only semantic targets may receive it.
- Legacy case responses/decision lookup filter draft targets, so nullable
  semantic draft IDs never enter the old nonnullable API contract.
- Demo records require both scenario ID and positive generation; the scenario
  FK includes the institution. No automatic seed or reset is present.

The SQL schema diff is derived from the declared Drizzle schema. Trigger
definitions are in `20261002_phase2a_guards.sql` and included in the migration
checksum. A future general schema push must not remove these guards.

## Contracts

`lib/api-spec/openapi.yaml` remains the root contract with `/api` and `/v1`.
The locally allowlisted `phase2a.openapi.yaml` splits the Phase 2A contracts
without creating a second API. Generated validators for the semantic tag
reject unknown fields, including nested result objects. Old validators retain
their compatibility behavior.

API fields omit internal worker leases. Clients cannot select the requester,
engine, snapshots, hash, flags or server timestamps.

## Rollback

Keep flags OFF and use a schema-compatible app version. Preserve tables,
analysis inputs, human decisions and audit history; do not drop or reverse
the enum. No data deletion or production migration is part of this gate.
Publication is a separate user action; this partial phase is not ready to publish.