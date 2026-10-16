# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Scaffold only: configs and minimal source were written by hand, **dependencies have never been installed** and nothing has been built or run yet (`tsc`, `next build`, `nest build`, `prisma generate` are unverified). Expect small config mismatches on the first build. Prisma schema has no models yet.

Requires **Node >= 24** (`.nvmrc`, `engines` in every package.json). The author's machine had Node 20.11, which is too old for Prisma 7 / ESLint 10.

## Commands (run from repo root; npm workspaces, no Turbo)

```bash
npm install
npm run db:up         # docker compose: postgres:17 only
npm run db:generate   # prisma generate (packages/db)
npm run db:migrate    # prisma migrate dev
npm run db:studio
npm run build         # all workspaces, packages/* first (order in "workspaces" matters)
npm run dev           # concurrently: nest start --watch (api :4000) + next dev (web :3000)
npm run lint | typecheck | format | format:check
npm run <script> -w @expense-tracker/api   # target a single workspace
```

No test framework is set up (Jest/Vitest were deliberately not chosen yet).

Env files are per-package, not a single root file: `packages/db/.env` (DATABASE_URL, read by `prisma.config.ts`), `apps/api/.env` (PORT, CORS_ORIGIN, DATABASE_URL), `apps/web/.env.local` (NEXT_PUBLIC_API_URL). Root `.env` only feeds docker-compose (POSTGRES_*). Copy from the `.env.example` next to each.

## Architecture

Monorepo of two apps and two internal packages, all named `@expense-tracker/*`:

- `apps/web` — Next.js 16 App Router, Tailwind v4, shadcn/ui (config only, no components generated), TanStack Query + react-hook-form. Talks to the API over HTTP via `src/lib/api-client.ts`; never imports `@expense-tracker/db`.
- `apps/api` — NestJS **11** (not 12: `nestjs-zod` 5.5 doesn't support Nest 12 yet). Global prefix `/api`, Swagger at `/api/docs`.
- `packages/shared` — Zod schemas/types shared by web and api. Single source of truth for API contracts.
- `packages/db` — Prisma 7 schema + generated client + `createPrismaClient()` (uses `@prisma/adapter-pg`).

Non-obvious wiring:

- **Validation:** Zod schema in `shared` → `createZodDto()` in api controllers (global `ZodValidationPipe` via `APP_PIPE`, `cleanupOpenApiDoc` for Swagger) → same schema reused in web forms via `@hookform/resolvers`. See `apps/api/src/health/health.controller.ts` for the pattern.
- **Prisma 7 specifics:** datasource URL lives in `packages/db/prisma.config.ts`, not in `schema.prisma`. Generator is `prisma-client` with mandatory `output = ../src/generated/prisma` (gitignored) and `moduleFormat = "cjs"`. `PrismaService` in api wraps the client from `createPrismaClient()` and exposes it as `.client` (it does not extend PrismaClient).
- **Module format:** `shared` and `db` compile with `tsc` to CJS `dist/` (Nest 11 is CommonJS); their package.json `main`/`exports` point to `dist`, so they must be built before api/web resolve them. Web consumes `shared` through `transpilePackages`.
- **TypeScript 6.0.x is pinned** (not 7): typescript-eslint requires `<6.1`. `tsconfig.base.json` uses `module/moduleResolution: nodenext`; web overrides to `esnext/bundler`, api adds decorator flags.
- Pinned exact versions everywhere; Prisma is 7.10.1 because npm `latest` points at an 8.0 RC.

## Conventions

- Planning docs from earlier sessions are copied to `tmp/plans/` (gitignored).
