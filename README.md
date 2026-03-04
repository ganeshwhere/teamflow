# Team Flow

Team Flow is a full-stack project management platform built as a Turborepo monorepo.
It includes:

- `apps/web`: Next.js 15 frontend (App Router, Server Actions, NextAuth OAuth)
- `apps/api`: NestJS 10 backend (REST API, guards, Prisma, mail)
- `packages/types`: shared API/domain types used by both apps
- `packages/ui`: shared UI primitives
- `packages/config`: shared config package

## Tech Stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 15, React 19, NextAuth v5 beta, Tailwind
- Backend: NestJS 10, Passport JWT
- Database: PostgreSQL + Prisma ORM
- Email: Resend + React Email
- Testing: Vitest (web) + Jest (api)

## Monorepo Structure

```txt
main/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── types/
│   ├── ui/
│   └── config/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker (recommended for local Postgres)

## Environment Setup

### 1) API env

```bash
cp apps/api/.env.example apps/api/.env
```

Minimum required values to run core features:

- `DATABASE_URL`
- `API_JWT_SECRET`
- `AUTH_BRIDGE_SECRET`
- `APP_URL`
- `PORT`

For email features (team invites / assignment emails), also set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### 2) Web env

Use local env for Next.js dev:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Required:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `AUTH_BRIDGE_SECRET`

Important:

- `AUTH_BRIDGE_SECRET` must match between `apps/api/.env` and `apps/web/.env.local`.

## Local Development Setup

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start PostgreSQL (Docker)

```bash
docker run --name projectdb -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres
```

### 3) Prepare database schema and client

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
```

### 4) Seed demo data (optional)

```bash
pnpm --filter api prisma:seed
```

### 5) Run both servers

```bash
pnpm dev
```

## App URLs

- Web: http://localhost:3000
- API: http://localhost:4000

## OAuth Redirect URLs

Set these in your OAuth provider dashboards:

- Google callback: `http://localhost:3000/api/auth/callback/google`
- GitHub callback: `http://localhost:3000/api/auth/callback/github`

## Core Scripts

From repo root:

- `pnpm dev` - run all apps in watch mode
- `pnpm lint` - monorepo type/lint checks
- `pnpm test` - monorepo tests
- `pnpm build` - monorepo build
- `pnpm ci` - lint + test + build
- `pnpm format` - prettier write
- `pnpm format:check` - prettier check

Package-level examples:

- `pnpm --filter api test`
- `pnpm --filter web test`

## API Route Overview

### Auth

- `POST /auth/verify-token`

### Users

- `GET /users/me`

### Teams

- `GET /teams`
- `POST /teams`
- `GET /teams/:id`
- `PATCH /teams/:id`
- `DELETE /teams/:id`
- `POST /teams/:id/invite`
- `POST /teams/:id/join`
- `DELETE /teams/:id/members/:userId`

### Projects

- `GET /teams/:teamId/projects`
- `POST /teams/:teamId/projects`
- `GET /teams/:teamId/projects/:id`
- `PATCH /teams/:teamId/projects/:id`
- `DELETE /teams/:teamId/projects/:id`

### Tasks

- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `GET /projects/:projectId/tasks/:id`
- `PATCH /projects/:projectId/tasks/:id`
- `DELETE /projects/:projectId/tasks/:id`

### Project Chat

- `GET /projects/:projectId/chat/messages`
- `POST /projects/:projectId/chat/messages`

## Common Troubleshooting

### Prisma authentication failed

Verify `DATABASE_URL` user/password and that Postgres is running on the expected host/port.

### NextAuth `JWTSessionError: no matching decryption secret`

Your auth secret changed while old cookies still exist, or envs do not match.
Fix by ensuring correct `NEXTAUTH_SECRET` and clearing browser cookies for localhost.

### Chat endpoint returns migration-related errors

Run:

```bash
pnpm --filter api exec prisma migrate deploy
pnpm --filter api prisma:generate
```

Then restart API.

## Notes

- The API uses OAuth user upsert flow via `POST /auth/verify-token` from the web app.
- API auth for app routes is token-based (Bearer token issued by API).
- Team invites and assignment emails are non-blocking (mail failures are logged, API continues).
