# Expense Tracker

Монорепозиторий (npm workspaces): трекер расходов.

## Стек

| Слой | Технологии |
|---|---|
| Web (`apps/web`) | Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, TanStack Query, react-hook-form |
| API (`apps/api`) | NestJS 11, Swagger (`/api/docs`), nestjs-zod |
| DB (`packages/db`) | Prisma 7 + PostgreSQL 17 |
| Shared (`packages/shared`) | Zod-схемы и типы, общие для web и api |
| Tooling | TypeScript 6, ESLint 10 (flat config), Prettier |

## Требования

- **Node.js >= 24** (см. `.nvmrc`), npm >= 10
- Docker (для Postgres)

## Запуск

```bash
npm install
cp .env.example .env
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

npm run db:up        # Postgres в docker
npm run db:generate  # Prisma Client
npm run build        # сборка packages/*, затем apps/*
npm run dev          # api + web
```

- Web: http://localhost:3000
- API health: http://localhost:4000/api/health
- Swagger: http://localhost:4000/api/docs

## Структура

```
apps/web         Next.js
apps/api         NestJS
packages/db      Prisma schema + клиент
packages/shared  Zod-схемы
```

Порядок `workspaces` важен: `packages/*` собираются раньше `apps/*`.
