# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Early stage. Verified working: `npm install`, `npm run build` (all workspaces), `typecheck`, `lint`, Prisma migrations, and the api running from `dist` with auth (register/login/me). `npm run dev` has not been exercised yet. Web is still the scaffold page and doesn't call auth. The only Prisma model is `User`.

Requires **Node >= 24** (`.nvmrc`, `engines` in every package.json). Prisma 7 / ESLint 10 don't run on older Node.

## Commands (run from repo root; npm workspaces, no Turbo)

```bash
npm install
npm run db:up         # docker compose: postgres:17 only
npm run db:generate   # prisma generate (packages/db)
npm run db:migrate -- --name <name>   # prisma migrate dev (always pass --name: without it prisma prompts and hangs in non-TTY shells)
npm run db:studio
npm run build         # all workspaces, packages/* first (order in "workspaces" matters)
npm run dev           # concurrently: nest start --watch (api :4000) + next dev (web :3000)
npm run lint | typecheck | format | format:check
npm run <script> -w @expense-tracker/api   # target a single workspace
```

No test framework is set up (Jest/Vitest were deliberately not chosen yet).

Env files are per-package, not a single root file: `packages/db/.env` (DATABASE_URL, read by `prisma.config.ts`), `apps/api/.env` (PORT, CORS_ORIGIN, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN; the api refuses to boot if JWT_SECRET is < 32 chars or the example value, or if JWT_EXPIRES_IN lacks a unit like `1d`), `apps/web/.env.local` (NEXT_PUBLIC_API_URL). Root `.env` only feeds docker-compose (POSTGRES_*). Copy from the `.env.example` next to each.

## Architecture

Monorepo of two apps and two internal packages, all named `@expense-tracker/*`:

- `apps/web` — Next.js 16 App Router, Tailwind v4, shadcn/ui (config only, no components generated), TanStack Query + react-hook-form. Talks to the API over HTTP via `src/lib/api-client.ts`; never imports `@expense-tracker/db`.
- `apps/api` — NestJS **11** (not 12: `nestjs-zod` 5.5 doesn't support Nest 12 yet). Global prefix `/api`, Swagger at `/api/docs`.
- `packages/shared` — Zod schemas/types shared by web and api. Single source of truth for API contracts.
- `packages/db` — Prisma 7 schema + generated client + `createPrismaClient()` (uses `@prisma/adapter-pg`).

Non-obvious wiring:

- **Validation:** Zod schema in `shared` → `createZodDto()` in api controllers (global `ZodValidationPipe` via `APP_PIPE`, `cleanupOpenApiDoc` for Swagger) → same schema reused in web forms via `@hookform/resolvers`. See `apps/api/src/health/health.controller.ts` for the pattern.
- **Prisma 7 specifics:** datasource URL lives in `packages/db/prisma.config.ts`, not in `schema.prisma`. Generator is `prisma-client` with mandatory `output = ../src/generated/prisma` (gitignored) and `moduleFormat = "cjs"`. `PrismaService` in api wraps the client from `createPrismaClient()` and exposes it as `.client` (it does not extend PrismaClient).
- **Auth is on by default:** `JwtAuthGuard` is global (`APP_GUARD` in `apps/api/src/auth/auth.module.ts`), so every new route requires a Bearer token unless the controller/handler is marked `@Public()` (`auth/decorators/public.decorator.ts`). Use `@CurrentUser()` to get `{ id, email }`. Access token only (HS256, no refresh); the guard trusts the token payload and does not hit the DB.
- **Cross-module calls go through CQRS** (`@nestjs/cqrs` 11.0.3, since 12.x needs Nest 12). A module exports nothing. Others import only its `contracts/` folder (typed `Command<T>`/`Query<T>` classes) and call `CommandBus`/`QueryBus`, e.g. auth → `apps/api/src/users/contracts`. Inside a module, use plain DI (controller → service → repository). Handlers are registered as module providers. A missing handler fails only at request time, so typecheck won't catch it.
- **Users:** `UsersRepository` is the only place that touches `prisma.client.user`. `UserRecord` (with `passwordHash`) is internal; API responses use the shared `User` shape. Emails are lowercased by the zod schema. Passwords are capped at 72 UTF-8 bytes (the bcrypt limit).
- **Module format:** `shared` and `db` compile with `tsc` to CJS `dist/` (Nest 11 is CommonJS); their package.json `main`/`exports` point to `dist`, so they must be built before api/web resolve them. Web consumes `shared` through `transpilePackages`.
- **TypeScript 6.0.x is pinned** (not 7): typescript-eslint requires `<6.1`. `tsconfig.base.json` uses `module/moduleResolution: nodenext`; web overrides to `esnext/bundler`, api adds decorator flags. Don't enable `incremental` in api: `nest build` deletes `dist`, the stale `.tsbuildinfo` outside it makes tsc emit nothing, and the build still "succeeds". `packages/shared` has no DOM/node types (no `TextEncoder`, `Buffer`).
- Pinned exact versions everywhere; Prisma is 7.10.1 because npm `latest` points at an 8.0 RC.

## Conventions

- Planning docs from earlier sessions are copied to `tmp/plans/` (gitignored).
