# Better Zmanim Web UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot the web app from a React SPA to a server-rendered React Router v7 app on Cloudflare Workers with Apple-inspired design, bilingual support, infinite-scroll zmanim, and SEO optimization.

**Architecture:** React Router v7 in framework mode handles SSR on Cloudflare Workers. Server loaders fetch zmanim via service binding to the existing Hono API worker. Pages render full HTML with SEO meta tags. Client-side hydration adds interactivity (countdown, collapsible past, infinite scroll, search modal).

**Tech Stack:** React Router v7, React 19, Vite, Tailwind CSS v4, Cloudflare Workers, @better-zmanim/shared

**Spec:** `docs/superpowers/specs/2026-04-13-web-ui-design.md`

---

## File Structure

```
apps/web/
├── app/
│   ├── root.tsx                    # Root layout: <html>, fonts, cookies, dir attribute
│   ├── routes.ts                   # Route config (React Router v7 file-route convention)
│   ├── routes/
│   │   ├── home.tsx                # "/" — IP-geolocated homepage
│   │   └── location.tsx            # "/location/:slug" — shareable location page
│   ├── components/
│   │   ├── nav.tsx                 # Sticky glass nav bar
│   │   ├── hero.tsx                # Black hero: Hebrew date, holiday, countdown
│   │   ├── countdown.tsx           # Live countdown to next zman
│   │   ├── zmanim-day.tsx          # Single day's zmanim list with collapsible past
│   │   ├── zman-row.tsx            # Individual zman row
│   │   ├── category-group.tsx      # Category header + zman rows
│   │   ├── day-divider.tsx         # Mini-hero between days (date, holiday)
│   │   ├── infinite-scroll.tsx     # Scroll trigger + day loading
│   │   ├── search-modal.tsx        # Location search overlay
│   │   ├── seo-meta.tsx            # Meta tags + JSON-LD structured data
│   │   └── footer.tsx              # Popular location links for SEO
│   ├── lib/
│   │   ├── slug.ts                 # Slug generation + resolution
│   │   ├── slug.test.ts            # Slug utility tests
│   │   ├── cookies.ts              # Cookie helpers (language, location)
│   │   ├── cookies.test.ts         # Cookie utility tests
│   │   ├── zmanim-helpers.ts       # Group zmanim by category, find next zman, etc.
│   │   ├── zmanim-helpers.test.ts  # Zmanim helper tests
│   │   └── api.server.ts           # Server-only: service binding fetch wrapper
│   └── app.css                     # Tailwind imports + Apple design tokens
├── react-router.config.ts          # React Router v7 config (SSR, Cloudflare adapter)
├── vite.config.ts                  # Vite config (updated for RR7)
├── wrangler.toml                   # Updated for SSR worker + service binding
├── tsconfig.json                   # Updated for app/ directory
├── worker-configuration.d.ts       # Cloudflare env type declarations
└── package.json                    # Updated dependencies
```

---

## Task 1: Scaffold React Router v7 on Cloudflare Workers

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/react-router.config.ts`
- Modify: `apps/web/vite.config.ts`
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/web/wrangler.toml`
- Create: `apps/web/worker-configuration.d.ts`
- Create: `apps/web/app/root.tsx`
- Create: `apps/web/app/routes.ts`
- Create: `apps/web/app/routes/home.tsx`
- Create: `apps/web/app/app.css`
- Delete: `apps/web/src/App.tsx`
- Delete: `apps/web/src/main.tsx`
- Delete: `apps/web/src/app.css`
- Delete: `apps/web/src/vite-env.d.ts`
- Delete: `apps/web/index.html`

- [ ] **Step 1: Update package.json dependencies**

Replace the contents of `apps/web/package.json`:

```json
{
  "name": "@better-zmanim/web",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "preview": "wrangler dev",
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint app/",
    "typecheck": "react-router typegen && tsc --noEmit",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:production": "wrangler deploy --env production"
  },
  "dependencies": {
    "@better-zmanim/shared": "workspace:*",
    "@react-router/cloudflare": "^7.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.5.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250410.0",
    "@react-router/dev": "^7.5.0",
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.7.0",
    "vite": "^6.2.0",
    "vitest": "^3.1.0",
    "wrangler": "^4.0.0",
    "@playwright/test": "^1.50.0"
  }
}
```

- [ ] **Step 2: Create React Router config**

Create `apps/web/react-router.config.ts`:

```ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
```

- [ ] **Step 3: Update Vite config**

Replace `apps/web/vite.config.ts`:

```ts
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflareDevProxy(),
    reactRouter(),
    tailwindcss(),
  ],
});
```

- [ ] **Step 4: Update wrangler.toml for SSR**

Replace `apps/web/wrangler.toml`:

```toml
name = "better-zmanim-web"
compatibility_date = "2025-04-01"
main = "./build/server/index.js"
assets = { directory = "./build/client" }

[[services]]
binding = "API"
service = "better-zmanim-api"

[env.staging]
name = "better-zmanim-web-staging"
[[env.staging.services]]
binding = "API"
service = "better-zmanim-api-staging"

[env.production]
name = "better-zmanim-web"
[[env.production.services]]
binding = "API"
service = "better-zmanim-api"
```

- [ ] **Step 5: Create worker type declarations**

Create `apps/web/worker-configuration.d.ts`:

```ts
interface Env {
  API: Fetcher;
}
```

- [ ] **Step 6: Update tsconfig.json**

Replace `apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": ".",
    "types": ["@cloudflare/workers-types/2023-07-01"]
  },
  "include": ["app", "worker-configuration.d.ts", ".react-router/types/**/*"],
  "references": [{ "path": "../../packages/shared" }]
}
```

- [ ] **Step 7: Create app.css with Tailwind + Apple design tokens**

Create `apps/web/app/app.css`:

```css
@import "tailwindcss";

@theme {
  /* Apple Design System Colors */
  --color-apple-blue: #0071e3;
  --color-apple-blue-bright: #2997ff;
  --color-apple-link: #0066cc;
  --color-apple-black: #000000;
  --color-apple-gray: #f5f5f7;
  --color-apple-text: #1d1d1f;

  /* Shadows */
  --shadow-card: 3px 5px 30px 0px rgba(0, 0, 0, 0.22);

  /* Font families */
  --font-display: "SF Pro Display", "Heebo", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-body: "SF Pro Text", "Heebo", "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

- [ ] **Step 8: Create route config**

Create `apps/web/app/routes.ts`:

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/location/:slug", "routes/location.tsx"),
] satisfies RouteConfig;
```

- [ ] **Step 9: Create root layout**

Create `apps/web/app/root.tsx`:

```tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const langMatch = cookieHeader.match(/lang=(en|he)/);
  const lang = langMatch ? langMatch[1] : "en";
  return { lang };
}

export default function Root() {
  const { lang } = useLoaderData<typeof loader>();
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-apple-black text-white font-body antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Create placeholder home route**

Create `apps/web/app/routes/home.tsx`:

```tsx
export function loader() {
  return { message: "Better Zmanim" };
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-semibold font-display tracking-tight">
        Better Zmanim
      </h1>
    </main>
  );
}
```

Create `apps/web/app/routes/location.tsx` as a placeholder:

```tsx
import type { Route } from "./+types/location";

export function loader({ params }: Route.LoaderArgs) {
  return { slug: params.slug };
}

export default function Location({ loaderData }: Route.ComponentProps) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-semibold font-display tracking-tight">
        {loaderData.slug}
      </h1>
    </main>
  );
}
```

- [ ] **Step 11: Delete old SPA files**

```bash
rm apps/web/src/App.tsx apps/web/src/main.tsx apps/web/src/app.css apps/web/src/vite-env.d.ts apps/web/index.html
rmdir apps/web/src
```

- [ ] **Step 12: Install dependencies and verify build**

```bash
cd apps/web && pnpm install
```

Run: `cd apps/web && pnpm build`
Expected: Build succeeds, outputs `build/server/index.js` and `build/client/` assets.

- [ ] **Step 13: Verify dev server starts**

Run: `cd apps/web && pnpm dev`
Expected: Dev server starts, visiting `http://localhost:5173` shows "Better Zmanim" text.

- [ ] **Step 14: Commit**

```bash
git add apps/web/
git commit -m "feat(web): pivot to React Router v7 SSR on Cloudflare Workers

Replace React SPA scaffold with React Router v7 framework mode.
SSR enabled, Cloudflare Workers adapter configured, service binding
to API worker declared. Old SPA files removed."
```

---

## Task 2: Slug Utilities and Cookie Helpers

**Files:**
- Create: `apps/web/app/lib/slug.ts`
- Create: `apps/web/app/lib/slug.test.ts`
- Create: `apps/web/app/lib/cookies.ts`
- Create: `apps/web/app/lib/cookies.test.ts`

- [ ] **Step 1: Write slug utility tests**

Create `apps/web/app/lib/slug.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { toSlug, fromSlug } from "./slug";

describe("toSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(toSlug("New York")).toBe("new-york");
  });

  it("strips diacritics", () => {
    expect(toSlug("Montréal")).toBe("montreal");
  });

  it("handles hyphens in original name", () => {
    expect(toSlug("Tel Aviv-Yafo")).toBe("tel-aviv-yafo");
  });

  it("strips non-alphanumeric characters except hyphens", () => {
    expect(toSlug("St. Louis, MO")).toBe("st-louis-mo");
  });

  it("collapses multiple hyphens", () => {
    expect(toSlug("San   Francisco")).toBe("san-francisco");
  });

  it("trims leading/trailing hyphens", () => {
    expect(toSlug(" London ")).toBe("london");
  });
});

describe("fromSlug", () => {
  it("converts slug back to search query", () => {
    expect(fromSlug("new-york")).toBe("new york");
  });

  it("handles single-word slugs", () => {
    expect(fromSlug("jerusalem")).toBe("jerusalem");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/web && pnpm test -- slug`
Expected: FAIL — module `./slug` not found.

- [ ] **Step 3: Implement slug utilities**

Create `apps/web/app/lib/slug.ts`:

```ts
export function toSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-");
}

export function fromSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm test -- slug`
Expected: All 8 tests PASS.

- [ ] **Step 5: Write cookie helper tests**

Create `apps/web/app/lib/cookies.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseCookies, serializeCookie } from "./cookies";

describe("parseCookies", () => {
  it("parses a cookie header string", () => {
    const result = parseCookies("lang=en; location=new-york");
    expect(result).toEqual({ lang: "en", location: "new-york" });
  });

  it("returns empty object for empty string", () => {
    expect(parseCookies("")).toEqual({});
  });

  it("handles values with equals signs", () => {
    const result = parseCookies("token=abc=def");
    expect(result).toEqual({ token: "abc=def" });
  });
});

describe("serializeCookie", () => {
  it("serializes a cookie with defaults", () => {
    const cookie = serializeCookie("lang", "en");
    expect(cookie).toContain("lang=en");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("serializes with max age", () => {
    const cookie = serializeCookie("lang", "he", { maxAge: 86400 });
    expect(cookie).toContain("Max-Age=86400");
  });
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `cd apps/web && pnpm test -- cookies`
Expected: FAIL — module `./cookies` not found.

- [ ] **Step 7: Implement cookie helpers**

Create `apps/web/app/lib/cookies.ts`:

```ts
export function parseCookies(header: string): Record<string, string> {
  if (!header) return {};

  const cookies: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const trimmed = pair.trim();
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key) cookies[key] = value;
  }
  return cookies;
}

interface CookieOptions {
  maxAge?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
}

export function serializeCookie(
  name: string,
  value: string,
  options?: CookieOptions,
): string {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options?.path ?? "/"}`);
  parts.push(`SameSite=${options?.sameSite ?? "Lax"}`);
  if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options?.secure) parts.push("Secure");
  return parts.join("; ");
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `cd apps/web && pnpm test -- cookies`
Expected: All 5 tests PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/web/app/lib/
git commit -m "feat(web): add slug and cookie utility functions with tests"
```

---

## Task 3: Zmanim Helper Utilities

**Files:**
- Create: `apps/web/app/lib/zmanim-helpers.ts`
- Create: `apps/web/app/lib/zmanim-helpers.test.ts`

- [ ] **Step 1: Write zmanim helper tests**

Create `apps/web/app/lib/zmanim-helpers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  groupZmanimByCategory,
  findNextZman,
  countPastZmanim,
} from "./zmanim-helpers";
import type { ZmanTimeResult } from "@better-zmanim/shared";

const SAMPLE_ZMANIM: ZmanTimeResult[] = [
  { zmanId: "alos", opinionId: "degrees_16_1", time: "2026-04-13T04:52:00Z" },
  { zmanId: "hanetz", opinionId: "standard", time: "2026-04-13T06:23:00Z" },
  { zmanId: "sofZmanShma", opinionId: "gra", time: "2026-04-13T09:41:00Z" },
  { zmanId: "chatzos", opinionId: "standard", time: "2026-04-13T12:53:00Z" },
  { zmanId: "minchaGedola", opinionId: "standard", time: "2026-04-13T13:24:00Z" },
  { zmanId: "shkia", opinionId: "standard", time: "2026-04-13T19:35:00Z" },
  { zmanId: "tzeis", opinionId: "degrees_8_5", time: "2026-04-13T20:02:00Z" },
];

describe("groupZmanimByCategory", () => {
  it("groups zmanim into display categories", () => {
    const groups = groupZmanimByCategory(SAMPLE_ZMANIM);
    expect(groups).toHaveLength(3);
    expect(groups[0]!.label).toBe("morning");
    expect(groups[1]!.label).toBe("afternoon");
    expect(groups[2]!.label).toBe("evening");
  });

  it("places each zman in the correct group", () => {
    const groups = groupZmanimByCategory(SAMPLE_ZMANIM);
    const morningIds = groups[0]!.zmanim.map((z) => z.zmanId);
    expect(morningIds).toContain("alos");
    expect(morningIds).toContain("hanetz");
    expect(morningIds).toContain("sofZmanShma");
  });
});

describe("findNextZman", () => {
  it("returns the first zman after the given time", () => {
    const now = new Date("2026-04-13T10:00:00Z");
    const next = findNextZman(SAMPLE_ZMANIM, now);
    expect(next?.zmanId).toBe("chatzos");
  });

  it("returns null when all zmanim have passed", () => {
    const now = new Date("2026-04-13T21:00:00Z");
    const next = findNextZman(SAMPLE_ZMANIM, now);
    expect(next).toBeNull();
  });

  it("skips zmanim with null times", () => {
    const withNull: ZmanTimeResult[] = [
      { zmanId: "alos", opinionId: "degrees_16_1", time: null },
      { zmanId: "hanetz", opinionId: "standard", time: "2026-04-13T06:23:00Z" },
    ];
    const now = new Date("2026-04-13T05:00:00Z");
    const next = findNextZman(withNull, now);
    expect(next?.zmanId).toBe("hanetz");
  });
});

describe("countPastZmanim", () => {
  it("counts zmanim before the given time", () => {
    const now = new Date("2026-04-13T10:00:00Z");
    expect(countPastZmanim(SAMPLE_ZMANIM, now)).toBe(3);
  });

  it("returns 0 when no zmanim have passed", () => {
    const now = new Date("2026-04-13T03:00:00Z");
    expect(countPastZmanim(SAMPLE_ZMANIM, now)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd apps/web && pnpm test -- zmanim-helpers`
Expected: FAIL — module `./zmanim-helpers` not found.

- [ ] **Step 3: Implement zmanim helpers**

Create `apps/web/app/lib/zmanim-helpers.ts`:

```ts
import { ZMANIM } from "@better-zmanim/shared";
import type { ZmanTimeResult, ZmanId } from "@better-zmanim/shared";

type DisplayCategory = "morning" | "afternoon" | "evening";

const CATEGORY_MAP: Record<string, DisplayCategory> = {
  dawn: "morning",
  morning: "morning",
  shma: "morning",
  tefila: "morning",
  midday: "afternoon",
  afternoon: "afternoon",
  evening: "evening",
  night: "evening",
};

export interface ZmanimGroup {
  label: DisplayCategory;
  zmanim: ZmanTimeResult[];
}

export function groupZmanimByCategory(
  zmanim: ZmanTimeResult[],
): ZmanimGroup[] {
  const groups: Record<DisplayCategory, ZmanTimeResult[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const z of zmanim) {
    const zmanDef = ZMANIM[z.zmanId as ZmanId];
    if (!zmanDef) continue;
    const displayCat = CATEGORY_MAP[zmanDef.category] ?? "morning";
    groups[displayCat].push(z);
  }

  const order: DisplayCategory[] = ["morning", "afternoon", "evening"];
  return order
    .filter((cat) => groups[cat].length > 0)
    .map((cat) => ({ label: cat, zmanim: groups[cat] }));
}

export function findNextZman(
  zmanim: ZmanTimeResult[],
  now: Date,
): ZmanTimeResult | null {
  const nowMs = now.getTime();
  for (const z of zmanim) {
    if (!z.time) continue;
    if (new Date(z.time).getTime() > nowMs) return z;
  }
  return null;
}

export function countPastZmanim(
  zmanim: ZmanTimeResult[],
  now: Date,
): number {
  const nowMs = now.getTime();
  return zmanim.filter(
    (z) => z.time !== null && new Date(z.time).getTime() <= nowMs,
  ).length;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && pnpm test -- zmanim-helpers`
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/lib/zmanim-helpers*
git commit -m "feat(web): add zmanim grouping and next-zman helper utilities"
```

---

## Task 4: Server-Side API Wrapper

**Files:**
- Create: `apps/web/app/lib/api.server.ts`

- [ ] **Step 1: Create the server-side API fetch wrapper**

This file uses the Cloudflare service binding to call the API worker. It is server-only (`.server.ts` suffix prevents bundling into client).

Create `apps/web/app/lib/api.server.ts`:

```ts
import type { ZmanimResponse, GeocodeResponse } from "@better-zmanim/shared";

interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

export async function fetchZmanim(
  api: Fetcher,
  params: {
    lat: number;
    lng: number;
    date?: string;
    tz?: string;
    candleLightingOffset?: number;
  },
): Promise<ApiResponse<ZmanimResponse>> {
  const searchParams = new URLSearchParams({
    lat: params.lat.toString(),
    lng: params.lng.toString(),
  });
  if (params.date) searchParams.set("date", params.date);
  if (params.tz) searchParams.set("tz", params.tz);
  if (params.candleLightingOffset !== undefined) {
    searchParams.set("candleLightingOffset", params.candleLightingOffset.toString());
  }

  const response = await api.fetch(
    new Request(`https://api/api/zmanim?${searchParams.toString()}`),
  );
  return response.json() as Promise<ApiResponse<ZmanimResponse>>;
}

export async function fetchGeocode(
  api: Fetcher,
  query: string,
): Promise<ApiResponse<GeocodeResponse>> {
  const searchParams = new URLSearchParams({ q: query });
  const response = await api.fetch(
    new Request(`https://api/api/geocode?${searchParams.toString()}`),
  );
  return response.json() as Promise<ApiResponse<GeocodeResponse>>;
}
```

Note: The `https://api/` hostname is arbitrary — Cloudflare service bindings ignore the hostname and route directly to the bound service. The URL just needs to be a valid URL.

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/lib/api.server.ts
git commit -m "feat(web): add server-side API wrapper using Cloudflare service binding"
```

---

## Task 5: SEO Meta Component

**Files:**
- Create: `apps/web/app/components/seo-meta.tsx`

- [ ] **Step 1: Create the SEO meta component**

This component generates meta tags and JSON-LD structured data. It's used in route `meta` exports.

Create `apps/web/app/components/seo-meta.tsx`:

```tsx
import type { ZmanimResponse } from "@better-zmanim/shared";
import { formatZmanTime, getZmanLabel } from "@better-zmanim/shared";

interface SeoData {
  locationName: string;
  slug: string;
  zmanimResponse: ZmanimResponse;
}

export function buildMeta({ locationName, slug, zmanimResponse }: SeoData) {
  const { dayInfo, zmanim } = zmanimResponse;
  const hebrewDate = dayInfo.hebrewDate.displayEnglish;
  const year = dayInfo.hebrewDate.year;

  const title = `Zmanim in ${locationName} — ${hebrewDate} ${year} | Better Zmanim`;

  const sunrise = zmanim.find(
    (z) => z.zmanId === "hanetz" && z.opinionId === "standard",
  );
  const candleLighting = zmanim.find(
    (z) => z.zmanId === "candleLighting",
  );
  const shkia = zmanim.find(
    (z) => z.zmanId === "shkia" && z.opinionId === "standard",
  );

  const timeParts: string[] = [];
  if (sunrise?.time) timeParts.push(`Sunrise ${formatZmanTime(sunrise.time)}`);
  if (candleLighting?.time) {
    timeParts.push(`Candle Lighting ${formatZmanTime(candleLighting.time)}`);
  } else if (shkia?.time) {
    timeParts.push(`Sunset ${formatZmanTime(shkia.time)}`);
  }

  const holiday = dayInfo.holidays[0];
  const holidayPart = holiday ? `. ${holiday.names.en}` : "";
  const description = `Jewish prayer times for ${locationName} today. ${timeParts.join(", ")}${holidayPart}.`;

  const canonicalUrl = slug
    ? `https://better-zmanim.com/location/${slug}`
    : "https://better-zmanim.com";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
  ];
}

export function buildJsonLd({ locationName, slug, zmanimResponse }: SeoData) {
  const { dayInfo, location } = zmanimResponse;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Zmanim in ${locationName}`,
    description: `Jewish prayer times for ${locationName}`,
    url: slug
      ? `https://better-zmanim.com/location/${slug}`
      : "https://better-zmanim.com",
    about: {
      "@type": "Place",
      name: locationName,
      geo: {
        "@type": "GeoCoordinates",
        latitude: location.lat,
        longitude: location.lng,
      },
    },
  };

  const holiday = dayInfo.holidays.find((h) => h.candleLightingApplies);
  if (holiday) {
    jsonLd.mainEntity = {
      "@type": "Event",
      name: holiday.names.en,
      startDate: zmanimResponse.date,
      location: {
        "@type": "Place",
        name: locationName,
      },
    };
  }

  return jsonLd;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/seo-meta.tsx
git commit -m "feat(web): add SEO meta tags and JSON-LD structured data builder"
```

---

## Task 6: Nav Component

**Files:**
- Create: `apps/web/app/components/nav.tsx`

- [ ] **Step 1: Create the sticky glass nav**

Create `apps/web/app/components/nav.tsx`:

```tsx
import { useNavigate } from "react-router";
import { serializeCookie } from "../lib/cookies";

interface NavProps {
  locationName: string;
  lang: string;
  onSearchOpen: () => void;
}

export function Nav({ locationName, lang, onSearchOpen }: NavProps) {
  const navigate = useNavigate();

  function toggleLanguage() {
    const newLang = lang === "he" ? "en" : "he";
    document.cookie = serializeCookie("lang", newLang, {
      maxAge: 60 * 60 * 24 * 365,
    });
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "he" ? "rtl" : "ltr";
    navigate(".", { replace: true });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-black/80 backdrop-blur-[20px] backdrop-saturate-[180%]">
      <div className="mx-auto flex h-full max-w-[980px] items-center justify-between px-5">
        <span className="text-[16px] font-semibold tracking-[-0.3px] text-white font-display">
          Better Zmanim
        </span>

        <button
          type="button"
          onClick={onSearchOpen}
          className="max-w-[200px] truncate text-[12px] font-normal tracking-[-0.12px] text-white/80 hover:text-white transition-colors"
        >
          {locationName}
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className="rounded-[980px] border border-apple-blue-bright px-2.5 py-0.5 text-[12px] font-normal text-apple-blue-bright hover:bg-apple-blue-bright/10 transition-colors"
        >
          {lang === "he" ? "EN" : "עב"}
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/nav.tsx
git commit -m "feat(web): add sticky glass nav with location button and lang toggle"
```

---

## Task 7: Hero and Countdown Components

**Files:**
- Create: `apps/web/app/components/hero.tsx`
- Create: `apps/web/app/components/countdown.tsx`

- [ ] **Step 1: Create the countdown component**

Create `apps/web/app/components/countdown.tsx`:

```tsx
import { useCountdown } from "@better-zmanim/shared";
import { getZmanLabel } from "@better-zmanim/shared";
import type { ZmanTimeResult, Language } from "@better-zmanim/shared";

interface CountdownProps {
  nextZman: ZmanTimeResult | null;
  lang: Language;
}

export function Countdown({ nextZman, lang }: CountdownProps) {
  const countdown = useCountdown(nextZman?.time ?? null);

  if (!nextZman || countdown.isExpired) return null;

  const label = getZmanLabel(nextZman.zmanId, nextZman.opinionId, lang) ?? nextZman.zmanId;
  const nextLabel = lang === "he" ? "הבא" : "Next";

  return (
    <div className="text-center pb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.8px] text-apple-blue-bright">
        {nextLabel}
      </p>
      <p className="text-[19px] font-normal text-white mt-0.5">
        {label}
      </p>
      <p className="text-[13px] font-light text-white/50 mt-0.5">
        {lang === "he" ? `בעוד ${countdown.label}` : `in ${countdown.label}`}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create the hero component**

Create `apps/web/app/components/hero.tsx`:

```tsx
import type { DayInfo, ZmanTimeResult, Language } from "@better-zmanim/shared";
import { Countdown } from "./countdown";

interface HeroProps {
  dayInfo: DayInfo;
  gregorianDate: string;
  locationName: string;
  nextZman: ZmanTimeResult | null;
  lang: Language;
}

export function Hero({
  dayInfo,
  gregorianDate,
  locationName,
  nextZman,
  lang,
}: HeroProps) {
  const hebrewDateDisplay =
    lang === "he"
      ? dayInfo.hebrewDate.displayHebrew
      : dayInfo.hebrewDate.displayEnglish;

  const holiday = dayInfo.holidays[0];
  const holidayName = holiday
    ? holiday.names[lang === "he" ? "he" : "en"]
    : null;

  const dateCaption =
    lang === "he"
      ? `${gregorianDate} · ${locationName}`
      : `${gregorianDate} · ${locationName}`;

  return (
    <section className="bg-apple-black pt-16 pb-0 text-center">
      <p className="text-[14px] font-light tracking-[-0.2px] text-white/50">
        {dateCaption}
      </p>
      <h1 className="mt-1.5 text-[36px] font-semibold leading-[1.07] tracking-[-0.28px] text-white font-display sm:text-[48px] lg:text-[56px]">
        {hebrewDateDisplay}
      </h1>
      {holidayName && (
        <p className="mt-1 text-[17px] font-normal leading-[1.47] tracking-[-0.37px] text-white/60">
          {holidayName}
        </p>
      )}
      <div className="mt-6">
        <Countdown nextZman={nextZman} lang={lang} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/hero.tsx apps/web/app/components/countdown.tsx
git commit -m "feat(web): add hero section with Hebrew date and countdown timer"
```

---

## Task 8: Zmanim List Components

**Files:**
- Create: `apps/web/app/components/zman-row.tsx`
- Create: `apps/web/app/components/category-group.tsx`
- Create: `apps/web/app/components/zmanim-day.tsx`

- [ ] **Step 1: Create the zman row component**

Create `apps/web/app/components/zman-row.tsx`:

```tsx
import { formatZmanTime, getZmanLabel } from "@better-zmanim/shared";
import type { ZmanTimeResult, Language } from "@better-zmanim/shared";

interface ZmanRowProps {
  zman: ZmanTimeResult;
  lang: Language;
  isPast: boolean;
  isNext: boolean;
  variant: "light" | "dark";
}

export function ZmanRow({ zman, lang, isPast, isNext, variant }: ZmanRowProps) {
  const label = getZmanLabel(zman.zmanId, zman.opinionId, lang) ?? zman.zmanId;
  const timeStr = formatZmanTime(zman.time);

  const baseText = variant === "light" ? "text-apple-text" : "text-white";
  const dimmedText =
    variant === "light" ? "text-black/25" : "text-white/20";
  const nextText = "text-apple-blue";
  const opinionColor =
    variant === "light" ? "text-black/35" : "text-white/35";

  let nameClass = `text-[15px] font-normal tracking-[-0.3px] sm:text-[17px] sm:tracking-[-0.37px] ${baseText}`;
  let timeClass = `text-[15px] font-semibold tracking-[-0.3px] tabular-nums sm:text-[17px] sm:tracking-[-0.37px] ${baseText}`;

  if (isPast) {
    nameClass = `text-[15px] font-normal tracking-[-0.3px] sm:text-[17px] sm:tracking-[-0.37px] ${dimmedText}`;
    timeClass = `text-[15px] font-semibold tracking-[-0.3px] tabular-nums sm:text-[17px] sm:tracking-[-0.37px] ${dimmedText}`;
  } else if (isNext) {
    nameClass = `text-[15px] font-semibold tracking-[-0.3px] sm:text-[17px] sm:tracking-[-0.37px] ${nextText}`;
    timeClass = `text-[15px] font-semibold tracking-[-0.3px] tabular-nums sm:text-[17px] sm:tracking-[-0.37px] ${nextText}`;
  }

  // Split label into name and opinion parts
  // Labels like "Latest Shma (GRA)" → name="Latest Shma", opinion="GRA"
  const parenMatch = label.match(/^(.+?)\s*\((.+)\)$/);
  const name = parenMatch ? parenMatch[1] : label;
  const opinion = parenMatch ? parenMatch[2] : null;

  const borderColor =
    variant === "light" ? "border-black/6" : "border-white/6";

  return (
    <div
      className={`flex min-h-[44px] items-baseline justify-between border-b py-2 ${borderColor} last:border-b-0`}
    >
      <span className={nameClass}>
        {name}
        {opinion && (
          <span
            className={`ms-1.5 text-[11px] font-normal ${isPast ? dimmedText : opinionColor}`}
          >
            {opinion}
          </span>
        )}
      </span>
      <time dateTime={zman.time ?? undefined} className={timeClass}>
        {timeStr}
      </time>
    </div>
  );
}
```

- [ ] **Step 2: Create the category group component**

Create `apps/web/app/components/category-group.tsx`:

```tsx
import type { ZmanTimeResult, Language } from "@better-zmanim/shared";
import { ZmanRow } from "./zman-row";

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  morning: { en: "Morning", he: "בוקר" },
  afternoon: { en: "Afternoon", he: "אחר הצהריים" },
  evening: { en: "Evening", he: "ערב" },
};

interface CategoryGroupProps {
  label: string;
  zmanim: ZmanTimeResult[];
  lang: Language;
  now: Date;
  nextZmanId: string | null;
  variant: "light" | "dark";
}

export function CategoryGroup({
  label,
  zmanim,
  lang,
  now,
  nextZmanId,
  variant,
}: CategoryGroupProps) {
  const langKey = lang === "he" ? "he" : "en";
  const displayLabel = CATEGORY_LABELS[label]?.[langKey] ?? label;
  const labelColor = variant === "light" ? "text-black/35" : "text-white/35";

  return (
    <div className="mt-4 first:mt-0">
      <h3
        className={`text-[11px] font-semibold uppercase tracking-[0.8px] ${labelColor} mb-2.5`}
      >
        {displayLabel}
      </h3>
      {zmanim.map((z) => {
        const isPast =
          z.time !== null && new Date(z.time).getTime() <= now.getTime();
        const isNext =
          z.zmanId === nextZmanId &&
          z.time !== null &&
          new Date(z.time).getTime() > now.getTime();
        return (
          <ZmanRow
            key={`${z.zmanId}-${z.opinionId}`}
            zman={z}
            lang={lang}
            isPast={isPast}
            isNext={isNext}
            variant={variant}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create the zmanim day component with collapsible past**

Create `apps/web/app/components/zmanim-day.tsx`:

```tsx
import { useState, useEffect } from "react";
import type { ZmanimResponse, Language } from "@better-zmanim/shared";
import { groupZmanimByCategory, findNextZman, countPastZmanim } from "../lib/zmanim-helpers";
import { CategoryGroup } from "./category-group";

interface ZmanimDayProps {
  zmanimResponse: ZmanimResponse;
  lang: Language;
  variant: "light" | "dark";
  isToday: boolean;
}

export function ZmanimDay({
  zmanimResponse,
  lang,
  variant,
  isToday,
}: ZmanimDayProps) {
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [isToday]);

  const { zmanim } = zmanimResponse;
  const groups = groupZmanimByCategory(zmanim);
  const nextZman = isToday ? findNextZman(zmanim, now) : null;
  const pastCount = isToday ? countPastZmanim(zmanim, now) : 0;

  const bgClass = variant === "light" ? "bg-apple-gray" : "bg-apple-black";

  const collapseLabel =
    lang === "he"
      ? `${pastCount} זמנים שעברו`
      : `${pastCount} past zmanim`;

  return (
    <section className={`${bgClass} px-5 py-6`}>
      <div className="mx-auto max-w-[980px]">
        {isToday && pastCount > 0 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`mb-4 w-full border-b pb-3.5 text-center text-[12px] font-normal tracking-[0.3px] ${
              variant === "light"
                ? "border-black/8 text-black/30"
                : "border-white/8 text-white/30"
            }`}
          >
            {collapseLabel} ▼
          </button>
        )}

        {isToday && pastCount > 0 && expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={`mb-4 w-full border-b pb-3.5 text-center text-[12px] font-normal tracking-[0.3px] ${
              variant === "light"
                ? "border-black/8 text-black/30"
                : "border-white/8 text-white/30"
            }`}
          >
            {lang === "he" ? "הסתר" : "Hide past"} ▲
          </button>
        )}

        {groups.map((group) => {
          const filteredZmanim =
            isToday && !expanded
              ? group.zmanim.filter(
                  (z) =>
                    z.time === null ||
                    new Date(z.time).getTime() > now.getTime() ||
                    z.zmanId === nextZman?.zmanId,
                )
              : group.zmanim;

          if (filteredZmanim.length === 0) return null;

          return (
            <CategoryGroup
              key={group.label}
              label={group.label}
              zmanim={filteredZmanim}
              lang={lang}
              now={now}
              nextZmanId={nextZman?.zmanId ?? null}
              variant={variant}
            />
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/components/zman-row.tsx apps/web/app/components/category-group.tsx apps/web/app/components/zmanim-day.tsx
git commit -m "feat(web): add zmanim list components with collapsible past"
```

---

## Task 9: Day Divider and Infinite Scroll

**Files:**
- Create: `apps/web/app/components/day-divider.tsx`
- Create: `apps/web/app/components/infinite-scroll.tsx`

- [ ] **Step 1: Create the day divider component**

Create `apps/web/app/components/day-divider.tsx`:

```tsx
import type { DayInfo, Language } from "@better-zmanim/shared";

interface DayDividerProps {
  dayInfo: DayInfo;
  gregorianDate: string;
  lang: Language;
  variant: "light" | "dark";
}

export function DayDivider({
  dayInfo,
  gregorianDate,
  lang,
  variant,
}: DayDividerProps) {
  const hebrewDateDisplay =
    lang === "he"
      ? dayInfo.hebrewDate.displayHebrew
      : dayInfo.hebrewDate.displayEnglish;

  const holiday = dayInfo.holidays[0];
  const holidayName = holiday
    ? holiday.names[lang === "he" ? "he" : "en"]
    : null;

  const bgClass = variant === "dark" ? "bg-apple-black" : "bg-apple-gray";
  const titleColor = variant === "dark" ? "text-white" : "text-apple-text";
  const subColor = variant === "dark" ? "text-white/50" : "text-black/40";

  return (
    <div className={`${bgClass} px-6 pb-3 pt-7 text-center`}>
      <h2
        className={`text-[24px] font-semibold leading-[1.1] tracking-[-0.2px] font-display ${titleColor}`}
      >
        {hebrewDateDisplay}
      </h2>
      <p className={`mt-1 text-[14px] font-light ${subColor}`}>
        {gregorianDate}
        {holidayName && ` · ${holidayName}`}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create the infinite scroll component**

Create `apps/web/app/components/infinite-scroll.tsx`:

```tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useFetcher } from "react-router";
import type { ZmanimResponse, Language } from "@better-zmanim/shared";
import { ZmanimDay } from "./zmanim-day";
import { DayDivider } from "./day-divider";

interface InfiniteScrollProps {
  initialDate: string;
  slug: string;
  lang: Language;
}

interface FutureDayData {
  date: string;
  gregorianDisplay: string;
  zmanimResponse: ZmanimResponse;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0]!;
}

function formatGregorianDate(dateStr: string, lang: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function InfiniteScroll({
  initialDate,
  slug,
  lang,
}: InfiniteScrollProps) {
  const [futureDays, setFutureDays] = useState<FutureDayData[]>([]);
  const [nextDate, setNextDate] = useState(() => addDays(initialDate, 1));
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<{ zmanimResponse: ZmanimResponse }>();

  const loadNextDay = useCallback(() => {
    if (isLoading || fetcher.state !== "idle") return;
    setIsLoading(true);
    fetcher.load(`/location/${slug}?date=${nextDate}&_data=true`);
  }, [isLoading, fetcher, slug, nextDate]);

  useEffect(() => {
    if (fetcher.data?.zmanimResponse && isLoading) {
      const newDay: FutureDayData = {
        date: nextDate,
        gregorianDisplay: formatGregorianDate(nextDate, lang),
        zmanimResponse: fetcher.data.zmanimResponse,
      };
      setFutureDays((prev) => [...prev, newDay]);
      setNextDate((prev) => addDays(prev, 1));
      setIsLoading(false);
    }
  }, [fetcher.data, isLoading, nextDate, lang]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextDay();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextDay]);

  return (
    <>
      {futureDays.map((day, index) => {
        const dayVariantIndex = index + 1;
        const dividerVariant = dayVariantIndex % 2 === 0 ? "light" : "dark";
        const listVariant = dayVariantIndex % 2 === 0 ? "dark" : "light";

        return (
          <div key={day.date}>
            <DayDivider
              dayInfo={day.zmanimResponse.dayInfo}
              gregorianDate={day.gregorianDisplay}
              lang={lang}
              variant={dividerVariant}
            />
            <ZmanimDay
              zmanimResponse={day.zmanimResponse}
              lang={lang}
              variant={listVariant}
              isToday={false}
            />
          </div>
        );
      })}

      <div ref={sentinelRef} className="h-px" />

      {isLoading && (
        <div className="bg-apple-gray px-5 py-8">
          <div className="mx-auto max-w-[980px] space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-black/10" />
            <div className="h-4 w-full animate-pulse rounded bg-black/5" />
            <div className="h-4 w-full animate-pulse rounded bg-black/5" />
            <div className="h-4 w-full animate-pulse rounded bg-black/5" />
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/day-divider.tsx apps/web/app/components/infinite-scroll.tsx
git commit -m "feat(web): add day divider and infinite scroll components"
```

---

## Task 10: Location Search Modal

**Files:**
- Create: `apps/web/app/components/search-modal.tsx`

- [ ] **Step 1: Create the search modal component**

Create `apps/web/app/components/search-modal.tsx`:

```tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { createApiClient } from "@better-zmanim/shared";
import type { Location, Language } from "@better-zmanim/shared";
import { toSlug } from "../lib/slug";
import { serializeCookie } from "../lib/cookies";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  apiBaseUrl: string;
}

export function SearchModal({
  isOpen,
  onClose,
  lang,
  apiBaseUrl,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      const client = createApiClient({ baseUrl: apiBaseUrl });
      const response = await client.getGeocode({ q });
      if (response.data) {
        setResults(response.data.results);
      }
      setIsSearching(false);
    },
    [apiBaseUrl],
  );

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  function selectLocation(location: Location) {
    const slug = toSlug(location.name);
    document.cookie = serializeCookie("location", slug, {
      maxAge: 60 * 60 * 24 * 365,
    });
    onClose();
    navigate(`/location/${slug}`);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const client = createApiClient({ baseUrl: apiBaseUrl });
      const response = await client.getGeocode({
        q: `${pos.coords.latitude},${pos.coords.longitude}`,
      });
      if (response.data?.results[0]) {
        selectLocation(response.data.results[0]);
      }
    });
  }

  if (!isOpen) return null;

  const placeholder = lang === "he" ? "חפש עיר..." : "Search city...";
  const useLocationLabel =
    lang === "he" ? "השתמש במיקום שלי" : "Use my location";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-12 sm:pt-24"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] rounded-xl bg-apple-gray p-6 shadow-card sm:mx-4 max-sm:h-full max-sm:max-w-none max-sm:rounded-none">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[11px] border-[3px] border-black/4 bg-[#fafafc] px-3.5 py-2.5 text-[17px] font-normal tracking-[-0.37px] text-black/80 outline-none focus:outline-2 focus:outline-apple-blue placeholder:text-black/30"
        />

        <button
          type="button"
          onClick={useMyLocation}
          className="mt-3 w-full rounded-lg bg-apple-blue px-4 py-2.5 text-[17px] font-normal text-white hover:brightness-110 transition-all"
        >
          {useLocationLabel}
        </button>

        <div className="mt-4 max-h-[400px] overflow-y-auto max-sm:max-h-[calc(100vh-200px)]">
          {isSearching && (
            <p className="py-4 text-center text-[14px] text-black/40">
              {lang === "he" ? "מחפש..." : "Searching..."}
            </p>
          )}

          {results.map((location, index) => (
            <button
              key={`${location.lat}-${location.lng}-${index}`}
              type="button"
              onClick={() => selectLocation(location)}
              className="w-full border-b border-black/6 px-2 py-3 text-start text-[17px] font-normal tracking-[-0.37px] text-apple-text hover:bg-black/4 transition-colors last:border-b-0"
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/search-modal.tsx
git commit -m "feat(web): add location search modal with geocode and browser geolocation"
```

---

## Task 11: Footer Component (SEO Internal Links)

**Files:**
- Create: `apps/web/app/components/footer.tsx`

- [ ] **Step 1: Create the footer with popular location links**

Create `apps/web/app/components/footer.tsx`:

```tsx
import { Link } from "react-router";
import type { Language } from "@better-zmanim/shared";

const POPULAR_LOCATIONS = [
  { slug: "jerusalem", en: "Jerusalem", he: "ירושלים" },
  { slug: "new-york", en: "New York", he: "ניו יורק" },
  { slug: "los-angeles", en: "Los Angeles", he: "לוס אנג'לס" },
  { slug: "london", en: "London", he: "לונדון" },
  { slug: "tel-aviv-yafo", en: "Tel Aviv", he: "תל אביב" },
  { slug: "chicago", en: "Chicago", he: "שיקגו" },
  { slug: "miami", en: "Miami", he: "מיאמי" },
  { slug: "toronto", en: "Toronto", he: "טורונטו" },
];

interface FooterProps {
  lang: Language;
  currentSlug?: string;
}

export function Footer({ lang, currentSlug }: FooterProps) {
  const title = lang === "he" ? "זמנים בערים נוספות" : "Zmanim in other cities";

  return (
    <footer className="bg-apple-black px-5 pb-12 pt-8">
      <div className="mx-auto max-w-[980px]">
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.8px] text-white/35">
          {title}
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {POPULAR_LOCATIONS.filter((loc) => loc.slug !== currentSlug).map(
            (loc) => (
              <Link
                key={loc.slug}
                to={`/location/${loc.slug}`}
                className="text-[14px] font-normal tracking-[-0.224px] text-apple-blue-bright hover:underline"
              >
                {lang === "he" ? loc.he : loc.en}
              </Link>
            ),
          )}
        </div>
        <p className="mt-8 text-[10px] font-normal tracking-[-0.08px] text-white/30">
          Better Zmanim
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/components/footer.tsx
git commit -m "feat(web): add footer with popular location links for SEO"
```

---

## Task 12: Location Route (Full Page Assembly)

**Files:**
- Modify: `apps/web/app/routes/location.tsx`

- [ ] **Step 1: Implement the location route with loader and full page**

Replace `apps/web/app/routes/location.tsx`:

```tsx
import { useState } from "react";
import type { Route } from "./+types/location";
import type { Language } from "@better-zmanim/shared";
import { fetchZmanim, fetchGeocode } from "../lib/api.server";
import { fromSlug } from "../lib/slug";
import { parseCookies } from "../lib/cookies";
import { buildMeta, buildJsonLd } from "../components/seo-meta";
import { findNextZman } from "../lib/zmanim-helpers";
import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { ZmanimDay } from "../components/zmanim-day";
import { InfiniteScroll } from "../components/infinite-scroll";
import { SearchModal } from "../components/search-modal";
import { Footer } from "../components/footer";

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const isDataRequest = url.searchParams.has("_data");

  const slug = params.slug;
  const api = (context.cloudflare.env as { API: Fetcher }).API;

  const cookies = parseCookies(request.headers.get("Cookie") ?? "");
  const lang = (cookies.lang === "he" ? "he" : "en") as Language;

  // Resolve slug to coordinates
  const query = fromSlug(slug);
  const geocodeResult = await fetchGeocode(api, query);
  const location = geocodeResult.data?.results[0];

  if (!location) {
    throw new Response("Location not found", { status: 404 });
  }

  const date = dateParam ?? new Date().toISOString().split("T")[0]!;
  const zmanimResult = await fetchZmanim(api, {
    lat: location.lat,
    lng: location.lng,
    date,
    tz: location.timeZone,
  });

  if (!zmanimResult.data) {
    throw new Response("Failed to load zmanim", { status: 500 });
  }

  // Enrich the response with the resolved location name
  const zmanimResponse = {
    ...zmanimResult.data,
    location,
  };

  if (isDataRequest) {
    return { zmanimResponse };
  }

  const gregorianDate = new Date(date + "T12:00:00Z").toLocaleDateString(
    lang === "he" ? "he-IL" : "en-US",
    { weekday: "long", month: "long", day: "numeric" },
  );

  return {
    slug,
    lang,
    locationName: location.name,
    date,
    gregorianDate,
    zmanimResponse,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.zmanimResponse) return [{ title: "Better Zmanim" }];
  return buildMeta({
    locationName: data.locationName,
    slug: data.slug,
    zmanimResponse: data.zmanimResponse,
  });
}

export default function Location({ loaderData }: Route.ComponentProps) {
  const { slug, lang, locationName, date, gregorianDate, zmanimResponse } =
    loaderData;
  const [searchOpen, setSearchOpen] = useState(false);

  const nextZman = findNextZman(zmanimResponse.zmanim, new Date());
  const jsonLd = buildJsonLd({
    locationName,
    slug,
    zmanimResponse,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Nav
        locationName={locationName}
        lang={lang}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <main>
        <Hero
          dayInfo={zmanimResponse.dayInfo}
          gregorianDate={gregorianDate}
          locationName={locationName}
          nextZman={nextZman}
          lang={lang}
        />

        <ZmanimDay
          zmanimResponse={zmanimResponse}
          lang={lang}
          variant="light"
          isToday={true}
        />

        <InfiniteScroll initialDate={date} slug={slug} lang={lang} />
      </main>

      <Footer lang={lang} currentSlug={slug} />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
        apiBaseUrl=""
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/routes/location.tsx
git commit -m "feat(web): implement location route with SSR loader, SEO, and full page"
```

---

## Task 13: Home Route (IP Geolocation)

**Files:**
- Modify: `apps/web/app/routes/home.tsx`

- [ ] **Step 1: Implement the home route with IP geolocation**

Replace `apps/web/app/routes/home.tsx`:

```tsx
import { useState } from "react";
import type { Route } from "./+types/home";
import type { Language } from "@better-zmanim/shared";
import { fetchZmanim } from "../lib/api.server";
import { parseCookies } from "../lib/cookies";
import { buildMeta, buildJsonLd } from "../components/seo-meta";
import { findNextZman } from "../lib/zmanim-helpers";
import { Nav } from "../components/nav";
import { Hero } from "../components/hero";
import { ZmanimDay } from "../components/zmanim-day";
import { InfiniteScroll } from "../components/infinite-scroll";
import { SearchModal } from "../components/search-modal";
import { Footer } from "../components/footer";

export async function loader({ context, request }: Route.LoaderArgs) {
  const api = (context.cloudflare.env as { API: Fetcher }).API;
  const cookies = parseCookies(request.headers.get("Cookie") ?? "");
  const lang = (cookies.lang === "he" ? "he" : "en") as Language;

  // IP geolocation from Cloudflare headers
  const cf = (request as { cf?: { latitude?: string; longitude?: string; city?: string; timezone?: string } }).cf;
  const lat = parseFloat(cf?.latitude ?? "40.7128");
  const lng = parseFloat(cf?.longitude ?? "-74.006");
  const city = cf?.city ?? "New York";
  const timeZone = cf?.timezone ?? "America/New_York";

  const date = new Date().toISOString().split("T")[0]!;
  const zmanimResult = await fetchZmanim(api, { lat, lng, date, tz: timeZone });

  if (!zmanimResult.data) {
    throw new Response("Failed to load zmanim", { status: 500 });
  }

  const zmanimResponse = {
    ...zmanimResult.data,
    location: { lat, lng, name: city, timeZone },
  };

  const gregorianDate = new Date(date + "T12:00:00Z").toLocaleDateString(
    lang === "he" ? "he-IL" : "en-US",
    { weekday: "long", month: "long", day: "numeric" },
  );

  return {
    lang,
    locationName: city,
    date,
    gregorianDate,
    zmanimResponse,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.zmanimResponse) return [{ title: "Better Zmanim" }];
  return buildMeta({
    locationName: data.locationName,
    slug: "",
    zmanimResponse: data.zmanimResponse,
  });
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { lang, locationName, date, gregorianDate, zmanimResponse } =
    loaderData;
  const [searchOpen, setSearchOpen] = useState(false);

  const nextZman = findNextZman(zmanimResponse.zmanim, new Date());
  const jsonLd = buildJsonLd({
    locationName,
    slug: "",
    zmanimResponse,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Nav
        locationName={locationName}
        lang={lang}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <main>
        <Hero
          dayInfo={zmanimResponse.dayInfo}
          gregorianDate={gregorianDate}
          locationName={locationName}
          nextZman={nextZman}
          lang={lang}
        />

        <ZmanimDay
          zmanimResponse={zmanimResponse}
          lang={lang}
          variant="light"
          isToday={true}
        />

        <InfiniteScroll initialDate={date} slug={`_home`} lang={lang} />
      </main>

      <Footer lang={lang} />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        lang={lang}
        apiBaseUrl=""
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/routes/home.tsx
git commit -m "feat(web): implement home route with Cloudflare IP geolocation"
```

---

## Task 14: Update Root Layout with Language Support

**Files:**
- Modify: `apps/web/app/root.tsx`

- [ ] **Step 1: Add error boundary and handle headers**

Update `apps/web/app/root.tsx` to include a proper error boundary:

```tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import type { Route } from "./+types/root";
import { parseCookies } from "./lib/cookies";
import "./app.css";

export function loader({ request }: Route.LoaderArgs) {
  const cookies = parseCookies(request.headers.get("Cookie") ?? "");
  const lang = cookies.lang === "he" ? "he" : "en";
  return { lang };
}

export default function Root() {
  const { lang } = useLoaderData<typeof loader>();
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-apple-black text-white font-body antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Location not found" : `Error ${error.status}`;
    message =
      error.status === 404
        ? "We couldn't find that location. Try searching for a city."
        : error.statusText ?? message;
  }

  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} | Better Zmanim</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-apple-black text-white font-body antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-[36px] font-semibold leading-[1.07] tracking-[-0.28px] font-display sm:text-[48px]">
            {title}
          </h1>
          <p className="mt-3 text-[17px] font-normal leading-[1.47] tracking-[-0.37px] text-white/60">
            {message}
          </p>
          <a
            href="/"
            className="mt-6 rounded-[980px] border border-apple-blue-bright px-5 py-2 text-[14px] font-normal text-apple-blue-bright hover:bg-apple-blue-bright/10 transition-colors"
          >
            Go home
          </a>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/root.tsx
git commit -m "feat(web): add error boundary and cookie-based language to root layout"
```

---

## Task 15: Build Verification and Smoke Test

**Files:**
- No new files

- [ ] **Step 1: Run all unit tests**

Run: `cd apps/web && pnpm test`
Expected: All tests PASS (slug, cookies, zmanim-helpers).

- [ ] **Step 2: Run type check**

Run: `cd apps/web && pnpm typecheck`
Expected: No type errors. If React Router type generation creates issues, fix them.

- [ ] **Step 3: Run build**

Run: `cd apps/web && pnpm build`
Expected: Build succeeds, `build/server/index.js` and `build/client/` created.

- [ ] **Step 4: Run lint**

Run: `cd apps/web && pnpm lint`
Expected: No lint errors. Fix any that appear.

- [ ] **Step 5: Start dev server and verify**

Run: `cd apps/web && pnpm dev`

Verify in browser:
1. `http://localhost:5173` — should show the home page with "Better Zmanim" text, hero section. (API service binding won't work locally without wrangler, but the UI should render.)
2. Check that the page source shows server-rendered HTML.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(web): resolve build and type errors from integration"
```

---

## Task 16: Robots.txt and Sitemap

**Files:**
- Modify: `apps/web/app/routes.ts`
- Create: `apps/web/app/routes/robots.tsx`
- Create: `apps/web/app/routes/sitemap.tsx`

- [ ] **Step 1: Create robots.txt route**

Create `apps/web/app/routes/robots.tsx`:

```tsx
export function loader() {
  const content = `User-agent: *
Allow: /
Allow: /location/

Sitemap: https://better-zmanim.com/sitemap.xml`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
```

- [ ] **Step 2: Create sitemap route**

Create `apps/web/app/routes/sitemap.tsx`:

```tsx
const POPULAR_SLUGS = [
  "jerusalem",
  "new-york",
  "los-angeles",
  "london",
  "tel-aviv-yafo",
  "chicago",
  "miami",
  "toronto",
  "lakewood",
  "brooklyn",
  "baltimore",
  "detroit",
  "monsey",
  "passaic",
  "teaneck",
];

export function loader() {
  const baseUrl = "https://better-zmanim.com";
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority><lastmod>${today}</lastmod></url>`,
    ...POPULAR_SLUGS.map(
      (slug) =>
        `<url><loc>${baseUrl}/location/${slug}</loc><changefreq>daily</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
```

- [ ] **Step 3: Add routes to route config**

Update `apps/web/app/routes.ts`:

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/location/:slug", "routes/location.tsx"),
  route("/robots.txt", "routes/robots.tsx"),
  route("/sitemap.xml", "routes/sitemap.tsx"),
] satisfies RouteConfig;
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/routes/robots.tsx apps/web/app/routes/sitemap.tsx apps/web/app/routes.ts
git commit -m "feat(web): add robots.txt and sitemap.xml routes for SEO"
```

---

## Task 17: Update Gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add React Router generated types to gitignore**

Add to the project's `.gitignore`:

```
# React Router generated types
apps/web/.react-router/
```

- [ ] **Step 2: Add superpowers brainstorm directory to gitignore**

Add to `.gitignore`:

```
# Superpowers brainstorm sessions
.superpowers/
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: update gitignore for React Router types and superpowers"
```
