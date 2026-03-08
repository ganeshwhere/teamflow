# Coverage Policy

This repository enforces minimum automated test coverage for both server and client test suites in CI.

## Current Baseline Thresholds

## Server (`apps/api`, Jest)

- Statements: `>= 70%`
- Branches: `>= 55%`
- Functions: `>= 50%`
- Lines: `>= 70%`

Configured in:

- `apps/api/jest.config.ts`

## Client (`apps/web`, Vitest)

- Statements: `>= 7%`
- Branches: `>= 40%`
- Functions: `>= 30%`
- Lines: `>= 7%`

Configured in:

- `apps/web/vitest.config.ts`

## CI Enforcement

CI runs coverage commands directly and fails pull requests if thresholds regress:

- `pnpm --filter api test:cov`
- `pnpm --filter web test:cov`

CI also uploads diagnostics artifacts on every run:

- `apps/api/coverage`
- `apps/api/test-results`
- `apps/web/coverage`
- `apps/web/test-results`

## Rollout Plan

Coverage is ratcheted upward over time. Policy:

1. Do not lower thresholds unless there is a documented emergency rollback approved by maintainers.
2. Raise thresholds after meaningful test additions, in small increments (for example, +2% to +5%).
3. Prefer improving weak modules first instead of raising only easy-to-cover areas.
4. Keep threshold changes in the same pull request as added tests when possible.

## Local Verification

Run these before opening a pull request:

```bash
pnpm --filter api test:cov
pnpm --filter web test:cov
```
