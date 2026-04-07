# Better Zmanim

A modern Jewish prayer times (zmanim) app built for accuracy and usability. Computes halachic times from KosherZmanim, supports multiple rabbinical opinions (GRA, MGA, Rabbeinu Tam), and delivers them through a fast edge API, a responsive PWA, and native mobile apps.

## Stack

- **API**: Cloudflare Workers + Hono -- computes zmanim at the edge (<5ms cold start)
- **Web**: React 19 + Vite + Tailwind CSS v4 (PWA, deployed to Cloudflare)
- **Mobile**: React Native (Expo) + Expo Router + Nativewind v4
- **Shared**: TypeScript package with types, hooks, API client, and formatting
- **Zmanim**: KosherZmanim (TypeScript port of KosherJava)
- **Hebrew calendar**: @hebcal/core
- **Monorepo**: pnpm workspaces + Turborepo

## Monorepo Structure

```
apps/web        -- React PWA (Cloudflare Workers)
apps/mobile     -- React Native (Expo) for iOS + Android
apps/api        -- Cloudflare Worker (Hono)
packages/shared -- Shared TS: types, hooks, API client, formatting, i18n
```
