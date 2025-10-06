# Copilot Instructions for ChatLand

## Overview
ChatLand is a full-stack web application with:
- **Frontend**: Next.js (TypeScript), Tailwind CSS, located in `frontend/`
- **Backend**: NestJS (TypeScript), Prisma ORM, located in `backend/`

## Architecture & Data Flow
- **Frontend** (`frontend/`):
  - Uses Next.js App Router (`src/app/`) with modular folders for features (e.g., `auth`, `inbox`, `listfriend`).
  - UI components are in `src/app/components/`, with modals in `components/(modal)/`.
  - Tailwind CSS for styling; config in `tailwind.config.js`.
  - Entry point: `src/app/page.tsx`.
- **Backend** (`backend/`):
  - NestJS app entry: `src/main.ts`, with core logic in `app.controller.ts`, `app.service.ts`, and `app.module.ts`.
  - Prisma ORM for database access. Schema in `prisma/schema.prisma`.
  - Migrations in `prisma/migrations/`. Seed script: `prisma/seed.ts`.
  - Generated Prisma client in `generated/prisma/`.

## Developer Workflows
- **Frontend**:
  - Start dev server: `npm run dev` in `frontend/`
  - Edit pages in `src/app/`, components in `src/app/components/`
  - Hot reload enabled
- **Backend**:
  - Install deps: `npm install` in `backend/`
  - Start dev server: `npm run start:dev` in `backend/`
  - Run migrations: Use Prisma CLI (`npx prisma migrate dev`)
  - Seed DB: `npx ts-node prisma/seed.ts`
  - Tests: `npm run test` (unit), `npm run test:e2e` (integration)

## Conventions & Patterns
- **TypeScript everywhere**
- **Frontend**:
  - Feature folders under `src/app/` (e.g., `auth`, `inbox`)
  - Modals/components in `components/(modal)/`
  - Use Next.js conventions for routing and layouts
- **Backend**:
  - NestJS module/controller/service pattern
  - Prisma schema changes require migration and client regeneration
  - Seed script uses Prisma client

## Integration Points
- **API communication**: Frontend calls backend via REST endpoints (NestJS controllers)
- **Database**: Prisma ORM, schema in `prisma/schema.prisma`
- **Styling**: Tailwind CSS (frontend)

## Key Files & Directories
- `frontend/src/app/` — Next.js app router, feature folders
- `frontend/src/app/components/` — UI components
- `backend/src/` — NestJS app code
- `backend/prisma/schema.prisma` — DB schema
- `backend/prisma/seed.ts` — DB seeding
- `backend/prisma/migrations/` — DB migrations

## Example Patterns
- Add a new API route: Create a controller in `backend/src/`, update `app.module.ts`
- Add a new page: Create a folder/file in `frontend/src/app/`
- Update DB: Edit `schema.prisma`, run migration, update seed if needed

---
_If any section is unclear or missing, please provide feedback for improvement._
