# Architecture

## Overview

Better Zmanim is a monorepo containing a web PWA, mobile app, and API for computing Jewish prayer times (zmanim).

## Monorepo Structure

```
better-zmanim/
├── apps/
│   ├── api/          Cloudflare Worker (Hono) — zmanim computation API
│   ├── web/          React 19 PWA — Vite + Tailwind v4
│   └── mobile/       React Native (Expo) — iOS + Android
├── packages/
│   └── shared/       Shared types, hooks, API client, formatting, i18n
└── docs/             Documentation
```

## Data Flow

1. Client (web or mobile) requests zmanim for a location + date
2. API receives the request at `/api/zmanim`
3. API uses KosherZmanim library to compute times based on the location's geocoordinates
4. API returns `{ data, error }` response
5. Client renders the times using shared formatting utilities

## Key Libraries

- **KosherZmanim** — TypeScript port of KosherJava for halachic time computation
- **@hebcal/core** — Hebrew calendar date conversion
- **Hono** — Lightweight HTTP framework for Cloudflare Workers

## Caching Strategy

- Geocoding results are cached in Cloudflare KV with 30-day TTL
- Zmanim are computed on every request (they change daily and by location)

## Opinion System

Users can select their preferred halachic opinion (GRA, MGA, Rabbeinu Tam). The opinion affects how zmanim are calculated — see `packages/shared/src/opinions.ts` for definitions.
