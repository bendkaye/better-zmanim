# Project: Better Zmanim
# Branch strategy: feature/* → develop → main

## Stack
- Monorepo: pnpm workspaces + Turborepo
- Web frontend: React 19 + Vite + Tailwind CSS v4 (PWA)
- Mobile: React Native (Expo managed workflow) + Expo Router + Nativewind v4
- API: Cloudflare Workers + Hono router
- Zmanim engine: KosherZmanim (TypeScript port of KosherJava)
- Hebrew calendar: @hebcal/core
- Testing: Vitest (unit/integration) + Playwright (E2E web) + Detox (E2E mobile)
- CI/CD: GitHub Actions → Cloudflare Pages/Workers + EAS Build

## Commands
- Dev (all): `pnpm dev` (runs web + api via Turborepo)
- Dev (mobile): `cd apps/mobile && npx expo start`
- Test (unit): `pnpm test`
- Test (e2e web): `pnpm test:e2e`
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Build (web): `pnpm --filter @better-zmanim/web build`
- Build (api): `pnpm --filter @better-zmanim/api build`
- Deploy (web+api): `pnpm deploy`
- Mobile build: `cd apps/mobile && eas build --platform all`

## Monorepo Structure
- apps/web — React PWA on Cloudflare Workers (Pages is being deprecated)
- apps/mobile — React Native (Expo) for iOS + Android
- apps/api — Cloudflare Worker (Hono)
- packages/shared — Shared TS: types, hooks, API client, formatting, i18n

## Code Standards
- Functional components with hooks — no classes
- Named exports only (no default exports except Expo Router pages)
- Strict TypeScript — no `any`, no `as` casts unless documented with a comment
- All shared logic goes in packages/shared, never duplicated between web and mobile
- Hooks in packages/shared must be platform-agnostic (no DOM, no RN imports)
- Web components use standard React DOM elements + Tailwind classes
- Mobile components use React Native primitives (View, Text, Pressable) + Nativewind classes
- Tests co-located: *.test.ts next to source file
- TDD: write failing test FIRST, then implement

## API Conventions
- All API routes use Hono router (apps/api/src/routes/)
- All responses: { data, error } — never raw values
- All zmanim computation goes through apps/api/src/lib/compute.ts (wraps KosherZmanim)
- Geocoding results cached in Cloudflare KV with 30-day TTL
- API is stateless — no sessions, no cookies, no auth (until v2 user accounts)

## Zmanim-Specific Rules
- NEVER hardcode zmanim times — always compute from KosherZmanim library
- NEVER use your own sunrise/sunset formulas — use the library
- All times must respect the user's selected opinions (GRA vs MGA vs Rabbeinu Tam)
- Elevation is optional but must be supported in the API signature
- Hebrew dates must use @hebcal/core — never compute manually
- Candle lighting is ALWAYS 18 minutes before shkia (configurable per minhag)
- Havdalah uses the configured tzeis opinion

## Git Workflow
- NEVER commit directly to main or develop
- Branch naming: feature/[short-desc], fix/[short-desc]
- Commit messages: conventional commits (feat:, fix:, chore:, docs:)
- Always run /project:pre-pr before opening a PR
- Squash merge to develop, merge commit to main

## Forbidden
- NEVER push to main or develop directly
- NEVER use `any` type
- NEVER commit secrets, .env files, or API keys
- NEVER use console.log — use a structured logger
- NEVER skip tests — every feature needs tests before implementation
- NEVER merge without CI passing
- NEVER duplicate logic between web and mobile — extract to packages/shared
- NEVER import from apps/web in apps/mobile or vice versa
- NEVER use localStorage in shared hooks (mobile doesn't have it)

## Domain Context
- Zmanim opinions: read packages/shared/src/opinions.ts
- API routes: read apps/api/src/routes/
- Deployment: read docs/deployment.md
- Architecture: read docs/architecture.md