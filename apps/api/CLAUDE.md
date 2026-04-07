# API Worker Rules

## This is the Cloudflare Worker (Hono router)
- Deployed to Cloudflare Workers (wrangler.toml config)
- Router: Hono — lightweight, edge-optimized
- Zmanim computation: KosherZmanim library (imported in src/lib/compute.ts)
- Hebrew dates: @hebcal/core
- Geocoding: Forward requests to Nominatim, cache results in Cloudflare KV
- KV namespace bindings defined in wrangler.toml
- All route handlers are in src/routes/
- Response format: always { data, error }
- CORS: allow all origins (public API)
- No authentication required (until v2 user accounts)
- Health check: GET /health → { status: "ok", version: "x.y.z" }
- Keep Worker bundle small — tree-shake aggressively