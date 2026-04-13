# Web Frontend Rules

## This is the React SSR app (Cloudflare Workers)
- Uses React Router v7 (framework mode, SSR) + React 19 + Vite + Tailwind CSS v4
- Server-rendered on Cloudflare Workers — every page is full HTML for SEO
- API calls via Cloudflare Worker service binding to the Hono API worker
- All shared hooks imported from @better-zmanim/shared
- Web-specific hooks go in src/hooks/ (e.g., DOM event listeners)
- Styling: Tailwind utility classes only — no CSS modules, no styled-components
- No dark mode toggle — design uses intentional black/light-gray section alternation
- Typography: SF Pro Display/Text (Latin, system fallbacks) + Heebo (Hebrew, Google Fonts)
- Design system: Apple-inspired, defined in DESIGN.md. Single accent: #0071e3 (Apple Blue)
- Geolocation: Cloudflare IP headers for SSR, browser navigator.geolocation as fallback
- Storage: cookies for preferences (language, last location) — must be server-readable
- Full spec: docs/superpowers/specs/2026-04-13-web-ui-design.md
