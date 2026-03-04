# Team Flow Web (`apps/web`)

Next.js 15 frontend for Team Flow (App Router + Server Actions).

## Responsibilities

- OAuth login via NextAuth (Google/GitHub)
- Protected dashboard routes and middleware checks
- Server Action layer for teams/projects/tasks/chat
- Task board, task detail, team management, notifications, settings views

## Prerequisites

- Node.js 22+
- pnpm 10+
- Running API (`apps/api`) reachable from `NEXT_PUBLIC_API_URL`

## Environment

Create local env from template:

```bash
cp .env.local.example .env.local
```

Required variables:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (local: `http://localhost:3000`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXT_PUBLIC_API_URL` (local: `http://localhost:4000`)
- `AUTH_BRIDGE_SECRET`

Important:

- `AUTH_BRIDGE_SECRET` must match `apps/api/.env`.

## OAuth Callback URLs

Configure in provider consoles:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

## Run Locally

From monorepo root:

```bash
pnpm --filter web dev
```

Web default URL: `http://localhost:3000`

## Scripts

- `pnpm --filter web dev` - run Next.js dev server
- `pnpm --filter web build` - production build
- `pnpm --filter web lint` - TypeScript checks (`tsconfig.lint.json`)
- `pnpm --filter web test` - Vitest test suite

## Feature Notes

- Server Actions return `{ data, error }` and normalize API failures for UI safety.
- Task detail chat supports:
  - realtime-like message append (server-backed writes)
  - `@mention` suggestions and mention persistence
  - responsive bubble layout and keyboard send (`Enter`)

## Troubleshooting

### NextAuth `JWTSessionError: no matching decryption secret`

Usually caused by secret mismatch or stale cookies.

- Ensure `NEXTAUTH_SECRET` is stable and correct.
- Clear localhost cookies/session and sign in again.

### OAuth callback ends with configuration errors

Check:

- Provider client ID/secret values
- Callback URL exactly matches provider config
- `NEXTAUTH_URL` is correct for current environment

### API calls fail with `ECONNREFUSED`

Check:

- API server is running on `NEXT_PUBLIC_API_URL`
- CORS and network target are correct

### Login works but API routes fail

Check:

- `AUTH_BRIDGE_SECRET` is identical in web + api envs
- API `/auth/verify-token` is reachable
