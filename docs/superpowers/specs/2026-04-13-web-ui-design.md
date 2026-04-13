# Better Zmanim — Web UI Design Spec

## Overview

A server-rendered zmanim web app built with React Router v7 on Cloudflare Workers. The UI follows an Apple-inspired design system with cinematic dark/light section rhythm, SF Pro + Heebo typography, and a single-column infinite scroll through days. Fully bilingual (English/Hebrew) with RTL support. SEO-first: every location page is server-rendered with structured data.

## Stack

- **Framework:** React Router v7 (framework mode, SSR)
- **Runtime:** Cloudflare Workers
- **UI:** React 19 + Tailwind CSS v4
- **Typography:** SF Pro Display/Text (Latin, system fallbacks) + Heebo (Hebrew, Google Fonts)
- **Build:** Vite
- **Shared logic:** `@better-zmanim/shared` (hooks, types, formatting, i18n)
- **API:** Cloudflare Worker service binding to the existing Hono API worker. The API worker remains a separate worker serving both web and mobile clients. The React Router SSR loader calls it via service binding (no public HTTP roundtrip, stays on Cloudflare's backbone).

## Design System

Apple-inspired, defined in `DESIGN.md`. Key tokens:

- **Backgrounds:** Pure black `#000000` (hero/immersive) alternating with light gray `#f5f5f7` (informational)
- **Accent:** Apple Blue `#0071e3` — the only chromatic color, reserved for interactive elements
- **Text on light:** `#1d1d1f` (headings), `rgba(0,0,0,0.8)` (body), `rgba(0,0,0,0.4)` (secondary)
- **Text on dark:** `#ffffff` (headings), `rgba(255,255,255,0.8)` (body), `rgba(255,255,255,0.5)` (secondary)
- **Links:** `#0066cc` (light bg), `#2997ff` (dark bg)
- **Nav glass:** `rgba(0,0,0,0.8)` + `backdrop-filter: saturate(180%) blur(20px)`
- **Shadows:** Rare. `rgba(0,0,0,0.22) 3px 5px 30px 0px` for elevated cards, or nothing.
- **Border radius:** 8px (buttons/cards), 980px (pill CTAs), 50% (circular controls)
- **Spacing base:** 8px

### Typography Scale

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero headline | SF Pro Display / Heebo | 56px (desktop), 36px (mobile) | 600 | 1.07 | -0.28px |
| Section heading | SF Pro Display / Heebo | 24px | 600 | 1.10 | normal |
| Category label | SF Pro Text / Heebo | 11-12px | 600 | 1.33 | 0.8px |
| Zman name | SF Pro Text / Heebo | 15-17px | 400 | 1.47 | -0.37px |
| Zman time | SF Pro Text / Heebo | 15-17px | 600 | 1.47 | -0.37px |
| Body/subtitle | SF Pro Text / Heebo | 17px | 400 | 1.47 | -0.37px |
| Caption/link | SF Pro Text / Heebo | 14px | 400 | 1.29 | -0.224px |
| Nav text | SF Pro Text / Heebo | 12px | 400 | 1.33 | -0.12px |

## Routes

| Path | Purpose | Data Source |
|------|---------|-------------|
| `/` | Homepage. IP-geolocated from Cloudflare request headers (`CF-IPCity`, `CF-IPLatitude`, `CF-IPLongitude`). Renders the full zmanim scroll. | Server loader |
| `/location/:slug` | Shareable location page (e.g., `/location/new-york`). Slug resolved to coordinates, zmanim fetched server-side. | Server loader |

Location search is a client-side modal overlay, not a route. On selection, it reverse-geocodes coordinates to a city slug and navigates to `/location/:slug`.

### Slug Resolution
- Slugs are generated deterministically from the geocode API's city/display name: lowercase, spaces to hyphens, strip diacritics (e.g., "New York" → `new-york`, "Tel Aviv-Yafo" → `tel-aviv-yafo`)
- The `/location/:slug` loader reverse-resolves slugs by searching the geocode API with the slug as a query, then uses the first result's coordinates
- Popular city slugs can be pre-mapped to exact coordinates for faster resolution and consistent results

## Page Structure

### Nav (sticky)
- 48px height, glass blur background
- Left: "Better Zmanim" logo text (16px, weight 600)
- Center: tappable location name — opens search modal
- Right: language toggle pill ("עב" / "EN")
- Fixed position, floats above all scrolling content

### Hero Section (black background)
- Gregorian date + location as subtle caption (14px, weight 300, 50% opacity)
- Hebrew date as headline (36-56px responsive, weight 600)
- Holiday/special day name as subtitle (17px, weight 400, 60% opacity) — shown only when applicable
- Countdown block:
  - "Next" label in Apple Blue (11px, weight 600, uppercase)
  - Zman name (19px, weight 400)
  - Time remaining (13px, weight 300, 50% opacity)

### Today's Zmanim (light `#f5f5f7` background)
- Collapsible past section: "X past zmanim ▼" — tap to expand with height animation
- Zmanim grouped by category: Morning, Afternoon, Evening
- Category headers: small uppercase labels (11px, weight 600, 35% opacity)
- Each zman row:
  - Left: zman name + opinion badge (e.g., "GRA") in secondary color
  - Right: time in tabular-nums, weight 600
  - Next upcoming zman: name and time in Apple Blue `#0071e3`, name weight 600
  - Past zmanim (when expanded): dimmed to 25% opacity
- Row height comfortable for touch (minimum 44px effective)

### Future Days (infinite scroll)
- Each day: mini-hero divider (day name, Hebrew date, holiday) + full zmanim list
- Backgrounds alternate: black divider → light zmanim, light divider → dark zmanim
- Maintains cinematic rhythm from the Apple design system
- Loaded one day at a time as user scrolls within 200px of bottom
- DOM management: keep ~7 days rendered, unmount earlier days
- Loading state: subtle skeleton shimmer

### Location Search Modal
- Full-screen overlay on mobile, centered card (480-520px) on tablet/desktop
- Search input auto-focused on open
- "Use my location" button for browser geolocation
- Debounced search (300ms) hits geocode API
- Results as tappable rows
- Selection: reverse-geocode to slug → navigate to `/location/:slug` → modal closes

## Bilingual Support

- **Default:** English (LTR)
- **Toggle:** Nav pill switches entire UI between English and Hebrew
- **Mechanism:** `dir` attribute on `<html>`, font stack swap, full layout flip (flexbox `row-reverse`)
- **Storage:** Language preference in cookie (server-readable for SSR)
- **Labels:** All UI text from `packages/shared/src/i18n.ts`
- **Hebrew font:** Heebo (Google Fonts), loaded with `preload` for performance
- **Zman names:** Transliterated in English mode, Hebrew in Hebrew mode (from shared i18n)

## Interaction & State

### Countdown Timer
- Uses `useCountdown` hook from shared package
- Ticks every second
- When a zman passes: countdown switches to next, passed zman moves into collapsed group
- End of day (after tzeis/havdalah): shows first zman of tomorrow

### Collapsible Past Zmanim
- Default collapsed: "X past zmanim ▼"
- Tap to expand: smooth height animation, reveals dimmed rows
- Real-time updates: as each zman passes, count increments, row slides into collapsed group
- Per-day: each day's collapsed section is independent

### Infinite Scroll
- Trigger: scroll within 200px of bottom
- Fetch: React Router fetcher (server-side zmanim computation)
- Append: new day section with alternating background
- Memory: ~7 days in DOM, unmount earlier days
- Loading: skeleton shimmer placeholder

### Location
- First load on `/`: IP geolocation from Cloudflare headers (no browser prompt)
- Search modal: user types city → geocode API → results
- "Use my location": browser geolocation → reverse geocode → slug
- Last location stored in cookie

### Language Toggle
- Tap nav pill: switches English ↔ Hebrew
- Sets `dir`, swaps fonts, flips layout
- Stored in cookie for SSR
- All labels from shared i18n module

## SEO & Structured Data

### Meta Tags (per page, server-rendered)
- `<title>`: "Zmanim in New York — 14 Nisan 5786 | Better Zmanim"
- `<meta name="description">`: "Jewish prayer times for New York today. Sunrise 6:23 AM, Candle Lighting 7:17 PM. Erev Pesach."
- `og:title`, `og:description`, `og:url` for social sharing
- `og:type`: "website"
- `twitter:card`: "summary"
- Canonical URL: full URL of the current page

### JSON-LD
- `@type: "WebPage"` with location and date context
- `@type: "Event"` for special days (candle lighting, holidays)
- `@type: "Place"` for the location

### Crawlability
- All `/location/:slug` pages: full server-rendered HTML, no JS required
- `robots.txt`: allow all location pages
- Dynamic sitemap from known location slugs (popular cities)
- Footer with internal links to popular locations for crawler discovery
- Semantic HTML: `<main>`, `<section>`, `<h1>`, `<time datetime="...">` elements
- Clean heading hierarchy: H1 = Hebrew date + location, H2 = day sections

## Responsive Behavior

| Breakpoint | Hero Headline | Content Width | Search Modal | Nav |
|------------|---------------|---------------|--------------|-----|
| Mobile (< 640px) | 36px | Full width | Full screen | Logo left, location center (truncated), lang right |
| Tablet (640-1024px) | 48px | Max 640px centered | Centered card 480px | Same |
| Desktop (1024px+) | 56px | Max 980px centered | Centered card 520px | Same |

- Always single-column — zmanim are inherently a vertical list
- Full-width background color blocks at all breakpoints
- Touch targets: minimum 44px effective height everywhere
- Full-viewport-width section backgrounds persist at every size

## Defaults (v1, no settings page)

- Opinion: GRA for Shma/Tefila
- Time format: 12-hour
- Seconds: hidden
- Candle lighting: 18 minutes before shkia
- Language: English
- Elevation: not used

Settings page deferred to v2 (with user accounts/retention).

## Out of Scope for v1

- Settings/preferences page
- User accounts / authentication
- Multiple saved locations
- Weekly/monthly calendar view
- Push notifications
- Elevation support
- PWA / service worker (defer until core experience is solid)
