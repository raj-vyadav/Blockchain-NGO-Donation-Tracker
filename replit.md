# NGO Donation Tracker

A role-based demonstration of transparent charitable funding, where NGO milestone funds remain locked until submitted evidence is reviewed and approved.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ngo-donation-tracker` — donor, NGO, and verifier web experience.
- `artifacts/api-server` — shared API service scaffold; the current prototype does not require it.
- `lib/api-spec/openapi.yaml` — shared API contract source of truth.

## Architecture decisions

- The first prototype keeps its shared demo state in browser storage so a presenter can switch roles and complete the workflow without configuring accounts or a database.
- Blockchain transactions are simulated for demonstration only; the prototype does not custody funds, connect a wallet, or publish to a live network.
- Evidence file selections are represented as saved metadata in the browser demo; they are not uploaded to persistent remote storage.

## Product

Donors can explore a school construction project, make a simulated contribution, and inspect fund status and history. NGO users can manage projects and submit milestone evidence. Verifiers can review evidence and vote; approval releases only the milestone's allocated amount, while rejection keeps it locked and records a reason.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Resetting the demo restores the seeded school project and sample ledger; it does not affect any real funds or blockchain network.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
