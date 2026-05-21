@AGENTS.md

# PROJECT: Dental Community Organization — Global Events Landing Page

## MODEL
claude-opus-4-7

## MISSION
Build a full-stack, production-grade landing page for a dental professional community
organization hosting events across California and globally. Output must be visually
stunning, dentistry-themed, and enterprise-ready. Zero tolerance for runtime bugs.

---

## TECH STACK (non-negotiable)

### Frontend
- Framework: Next.js 14+ (App Router)
- Language: TypeScript (strict mode, `"strict": true` in tsconfig)
- Styling: Tailwind CSS v3 + shadcn/ui components
- Animation: Framer Motion
- Icons: Lucide React
- Forms: React Hook Form + Zod validation
- State: Zustand (client) + React Query (server state)
- Maps: Mapbox GL JS (event locations, CA + world)
- Fonts: Google Fonts — "DM Serif Display" (headings) + "Inter" (body)

### Backend
- Runtime: Node.js 20 LTS
- API: Next.js Route Handlers (RESTful, typed with Zod)
- Database: PostgreSQL via Prisma ORM
- Auth: NextAuth.js v5 (credentials + OAuth)
- Email: Resend API
- File Storage: Vercel Blob or AWS S3
- CMS: Sanity.io (events, staff, content)

### DevOps / Quality
- Linting: ESLint + Prettier (enforce on save)
- Testing: Vitest (unit) + Playwright (E2E)
- CI: GitHub Actions (lint -> test -> build -> deploy)
- Hosting: Vercel
- ENV: All secrets in `.env.local`, never hardcoded

---

## DESIGN SYSTEM — DENTISTRY AESTHETIC

### Color Palette
```
--primary:       #0A2540   /* Deep dental navy */
--accent:        #00B4D8   /* Clinical cyan (tooth enamel) */
--gold:          #C9A84C   /* Prestige gold (professional org) */
--surface:       #F8FAFB   /* Sterile white-grey */
--surface-dark:  #0D1B2A   /* Dark mode base */
--text-primary:  #1A1A2E
--text-muted:    #64748B
```

### Visual Language
- Use tooth silhouettes, DNA helix, and cross-section motifs as SVG decorators
- Glassmorphism cards with `backdrop-filter: blur(12px)` on hero sections
- Subtle animated gradient mesh background (CSS only, no canvas)
- Parallax scroll on hero image
- Micro-interactions on every CTA button (scale + glow on hover)
- Section transitions: staggered fade-up via Framer Motion `variants`

---

## PAGE SECTIONS (build in order)

1. Navbar
2. Hero
3. Featured Events
4. Interactive Map (Mapbox)
5. About / Mission
6. Testimonials
7. Newsletter / Registration CTA
8. Footer

---

## API ROUTES

| Route | Method | Description |
|-------|--------|-------------|
| `/api/events` | GET | Fetch all events (filter by region, date) |
| `/api/events/[id]` | GET | Single event detail |
| `/api/events/register` | POST | Event registration (Zod schema) |
| `/api/newsletter` | POST | Email signup -> Resend |
| `/api/contact` | POST | Contact form -> email notification |
| `/api/auth/[...nextauth]` | ALL | NextAuth handler |

---

## CODE QUALITY RULES

1. Every function/component has an explicit TypeScript return type
2. No `any` — use `unknown` + type guards where needed
3. All async operations wrapped in try/catch with typed error handling
4. API routes return typed `NextResponse` with consistent shape:
   `{ data: T | null, error: string | null, status: number }`
5. No inline styles — Tailwind only
6. All images use `next/image` with explicit `width`, `height`, `alt`
7. Dynamic imports for heavy components (Mapbox, carousel)
8. All environment variables typed via `src/env.ts` (T3 env pattern)
9. Prisma client singleton in `src/lib/db.ts`
10. No prop drilling beyond 2 levels — use Zustand or Context
11. All forms validate client-side (React Hook Form + Zod) AND server-side
12. Rate limit all POST routes (upstash/ratelimit)
13. SEO: `generateMetadata()` on every page, OpenGraph tags
14. Accessibility: WCAG 2.1 AA — aria labels, focus rings, color contrast

---

## NEVER DO

- Never use `useEffect` for data fetching — use React Query or Server Components
- Never commit `.env` files
- Never use `@ts-ignore` or `@ts-expect-error` without a documented reason
- Never skip loading/error/empty states on any async UI
- Never hardcode coordinates, API keys, or copy
