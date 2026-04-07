# Deployment

## API (Cloudflare Worker)

```bash
cd apps/api
pnpm run deploy
```

Deploys to Cloudflare Workers via wrangler. Requires `CLOUDFLARE_API_TOKEN` env var.

### KV Namespace Setup

Create the geocode cache KV namespace:

```bash
wrangler kv namespace create GEOCODE_CACHE
```

Update the `id` in `apps/api/wrangler.toml` with the returned namespace ID.

## Web (Cloudflare Workers)

```bash
pnpm --filter @better-zmanim/web build
```

The web app is built as a static site and deployed to Cloudflare Workers. CI/CD handles this via GitHub Actions on merge to `main`.

## Mobile (Expo / EAS)

```bash
cd apps/mobile
eas build --platform all
```

Requires Expo account and EAS CLI configured. Submits builds to App Store and Google Play via EAS Submit.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — Runs on PR: lint, typecheck, test, build
- **deploy.yml** — Runs on merge to main: deploys API + web

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | CI/CD | Cloudflare deployments |
| `EXPO_TOKEN` | CI/CD | EAS builds |
