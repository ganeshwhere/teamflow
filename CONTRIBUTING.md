# Contributing to Team Flow

Thanks for contributing.

This document defines contribution workflow, quality standards, and testing rules for this monorepo.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Branching and Commits](#branching-and-commits)
- [Coding Standards](#coding-standards)
- [Testing Policy](#testing-policy)
- [Database and Prisma Rules](#database-and-prisma-rules)
- [Pull Request Rules](#pull-request-rules)
- [Definition of Done](#definition-of-done)
- [Security and Secrets](#security-and-secrets)
- [License](#license)

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL (local or remote)

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

3. Prepare DB:

```bash
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate
```

4. Run all apps:

```bash
pnpm dev
```

## Branching and Commits

- Branch from latest `main`.
- Branch naming:
  - `feature/<scope>`
  - `fix/<scope>`
  - `chore/<scope>`
- Keep commits atomic and logically grouped.
- Use clear, outcome-based commit messages.
- Do not mix unrelated refactors with functional changes.

## Coding Standards

- Use TypeScript across apps/packages.
- Reuse contracts from `@repo/types`.
- Reuse shared primitives from `@repo/ui` where possible.
- Keep server actions typed and return predictable error/data contracts.
- Keep Nest modules cohesive and guarded at route boundaries.
- Prefer explicit, maintainable implementations over quick workarounds.

## Testing Policy

Testing is mandatory for behavior changes.

### Required checks before PR

From repo root:

```bash
pnpm lint
pnpm test
pnpm build
```

### App-level expectations

- API (`apps/api`, Jest):
  - Add/update unit tests for service and guard logic changes.
  - Add/update integration tests for route-contract or auth-flow changes.
- Web (`apps/web`, Vitest):
  - Add/update tests for server actions and utility logic changes.
  - Add/update integration tests for page/action flows when behavior changes.

### Test quality rules

- Tests must be deterministic (no flaky timing dependencies).
- Avoid network calls in unit tests; mock external dependencies.
- Keep assertions specific to behavior, not implementation noise.
- New features should include at least one positive-path and one failure-path test.

### Running targeted tests

```bash
pnpm --filter api test
pnpm --filter web test
```

### Running coverage locally

```bash
pnpm --filter api test:cov
pnpm --filter web test:cov
```

Coverage thresholds are enforced in CI for both suites. See
[`docs/testing/coverage-policy.md`](./docs/testing/coverage-policy.md)
for thresholds, artifact details, and rollout policy.

## Database and Prisma Rules

When changing `apps/api/prisma/schema.prisma`:

- Generate migration with meaningful name:

```bash
pnpm --filter api prisma:migrate
```

- Validate and regenerate client:

```bash
pnpm --filter api prisma:validate
pnpm --filter api prisma:generate
```

- Update seed data if required by new schema constraints.
- Include migration impact notes in the PR description.

## Pull Request Rules

Each PR should include:

- Clear summary and scope
- Why the change is needed
- Testing evidence (commands run + result)
- Migration notes (if DB changed)
- Screenshots/GIFs for user-facing UI changes

Keep PRs reviewable:

- Prefer smaller PRs
- Avoid unrelated formatting churn
- Resolve review comments with follow-up commits

## Definition of Done

A change is considered done when:

- Code is implemented and reviewed
- Relevant tests are added/updated
- `pnpm lint`, `pnpm test`, and `pnpm build` pass
- No secrets or local env files are committed
- Documentation is updated when behavior/setup changes

## Security and Secrets

- Never commit `.env`, `.env.local`, tokens, secrets, or credentials.
- Redact sensitive values in logs and screenshots.
- Report security concerns privately to maintainers.

## License

By contributing, you agree that contributions are licensed under the
[MIT License](./LICENSE).
