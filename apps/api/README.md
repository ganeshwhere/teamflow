# Team Flow API (`apps/api`)

NestJS 10 backend for Team Flow.

## Responsibilities

- OAuth user upsert bridge (`POST /auth/verify-token`)
- API JWT issuance and route protection
- Teams, projects, tasks, and project chat APIs
- Invite and task-assignment email orchestration (Resend)
- PostgreSQL persistence via Prisma

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL running and reachable from `DATABASE_URL`

## Environment

Create local env from template:

```bash
cp .env.example .env
```

Key variables:

- `DATABASE_URL`
- `API_JWT_SECRET`
- `AUTH_BRIDGE_SECRET`
- `APP_URL`
- `PORT` (default `4000`)

Optional but recommended for email features:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TEAM_INVITE_JWT_SECRET`

## Database Setup

From monorepo root:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
```

For deployed environments using existing migrations only:

```bash
pnpm --filter api exec prisma migrate deploy
pnpm --filter api prisma:generate
```

## Run Locally

From monorepo root:

```bash
pnpm --filter api dev
```

API default URL: `http://localhost:4000`

## Scripts

- `pnpm --filter api dev` - run API in watch mode
- `pnpm --filter api build` - build Nest app
- `pnpm --filter api lint` - TypeScript checks
- `pnpm --filter api test` - Jest test suite
- `pnpm --filter api prisma:generate` - generate Prisma client
- `pnpm --filter api prisma:migrate` - create/apply migration (dev)
- `pnpm --filter api prisma:seed` - seed demo data

## API Surface (High-Level)

- Auth: `/auth/verify-token`
- Users: `/users/me`
- Teams: `/teams/...`
- Projects: `/teams/:teamId/projects/...`
- Tasks: `/projects/:projectId/tasks/...`
- Project chat: `/projects/:projectId/chat/messages`

## Troubleshooting

### Prisma auth/database errors

Verify:

- Postgres is running
- `DATABASE_URL` username/password/host/port/database are correct
- `schema=public` (if expected) is present

### Invite emails fail

The API is designed to keep core flows non-blocking on email failures. Confirm:

- `RESEND_API_KEY` is valid
- `RESEND_FROM_EMAIL` domain is configured in Resend

### 401/403 from protected routes

Check:

- API bearer token is issued by `/auth/verify-token`
- `AUTH_BRIDGE_SECRET` matches between web and api envs
