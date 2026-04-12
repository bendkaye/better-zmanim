# Web Frontend Rules

## This is the React PWA (Cloudflare Workers Static Assets)
- Uses React 19 + Vite + Tailwind CSS v4
- PWA via vite-plugin-pwa (Workbox)
- All shared hooks imported from @better-zmanim/shared
- Web-specific hooks go in src/hooks/ (e.g., DOM event listeners, service worker registration)
- Styling: Tailwind utility classes only — no CSS modules, no styled-components
- Dark mode: use Tailwind's `dark:` variant, toggled via class on <html>
- Typography: Frank Ruhl Libre (Hebrew) + DM Sans (English) — loaded via Google Fonts
- Color palette: slate-950 (bg), amber-400 (accent), defined in tailwind.config.ts
- Geolocation: use browser navigator.geolocation API
- Storage: localStorage for preferences (saved locations, opinion settings)