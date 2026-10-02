# eCenovnik Web

Web version of the eCenovnik grocery price-comparison platform with feature parity to the mobile app. Users can browse products, create and manage shopping lists, share lists, and compare prices across retailers in real-time.

**Live**: `https://web.ecenovnik.app` (production)

## Quick Start

### Prerequisites
- Node.js 18+ / npm
- Supabase account with project configured

### Setup

1. **Clone and install**:
```bash
git clone <repo>
cd cenovnik-web
npm install
```

2. **Environment variables** (`.env.local`, not committed):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

3. **Run locally**:
```bash
npm run dev
```
Open `http://localhost:3000` → login at `/prijava` (email OTP or OAuth).

### Build
```bash
npm run build
npm run dev  # test production build locally
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **State**: React Context (Auth, future: TanStack Query)
- **Deployment**: Vercel (auto-deploy on push to `main`)

## Key Libraries

- `@supabase/ssr` (0.12.4+) — Supabase SSR client for auth + RLS
- `@supabase/supabase-js` (2.110.8+) — Supabase JS client
- `@radix-ui/*` + `shadcn/ui` — Accessible, unstyled component primitives
- `class-variance-authority` — Type-safe component variants
- `tailwind-merge` + `clsx` — Tailwind class composition

## Architecture

**Auth**: Direct Supabase client (no API layer) with Row-Level Security policies. Session via cookie (Supabase SSR pattern).

**Routing**: Next.js App Router with middleware (`proxy.ts`). Unauthenticated → `/prijava`, authenticated → `/proizvodi`.

**Data**: Supabase PostgreSQL. Real-time syncing via Realtime subscriptions (WebSocket, `postgres_changes`).

**Responsive Layout**: Industry-standard `Container` primitive (`components/ui/container.tsx`) — Tailwind-native with adaptive horizontal gutters across all breakpoints. Ensures consistent page-level spacing from mobile (320px, `px-4`) through ultra-wide (3xl+, `lg:px-8`). Used by all authenticated pages for alignment consistency.

## System States (Stanja)

States from the Claude Design files `Stanja.dc.html` (system states) and `Proizvodi.dc.html` (in-page empty states). Full-page messages are built from `components/StatePage/`; every illustration is a `StateIllustration` variant (`components/ui/state-illustration.tsx`).

Status: ✅ built · ⏳ not built yet

### Full-page states

| State | Status | Shown when | Route / component |
|-------|--------|------------|-------------------|
| **404 – "Ova stranica ne postoji"** | ✅ | The URL matches no route. Keeps the app header and offers product search. | `app/not-found.tsx` → `NotFoundScreen` |
| **Greška 500 – "Nešto nije u redu"** (in app) | ✅ | A page under `(authenticated)` throws while rendering. Keeps the app header; "Pokušaj ponovo" re-renders, and a server error shows its digest code for support. | `app/(authenticated)/error.tsx` → `ErrorScreen` |
| **Greška 500 – "Nešto nije u redu"** (outside app) | ✅ | A page outside the app shell throws (sign-in, shared list). Shows only the logo header. | `app/error.tsx` → `ErrorScreen` + `LogoHeader` |
| **Bez marketa – "Izaberi svoje markete"** | ⏳ | A new user hasn't picked any favorite markets yet. Actions: "Izaberi markete" (→ `/prodavnice`) and "Prikaži cene iz svih marketa". Deferred until `/prodavnice` supports picking stores (it is still a placeholder). The `no-markets` illustration already exists. | — |

### Shared list (`/lista/[token]`)

| State | Status | Shown when | Route / component |
|-------|--------|------------|-------------------|
| **Učitavanje liste** | ✅ | The server couldn't load the list and the client is retrying. A skeleton shaped like the real list, no spinner. | `SharedListView` → `SharedListSkeleton` |
| **Link nije aktivan – "Ovaj link više nije aktivan"** | ✅ | Malformed token, deleted list, or sharing turned off. Every case shows the same screen, so the link never reveals which one it was. Responds with a real 404. | `app/lista/[token]/not-found.tsx` → `SharedListNotFound` |
| **Lista nedostupna – "Lista trenutno nije dostupna"** | ✅ | Server or network error before anything was shown. "Pokušaj ponovo" shows the skeleton again. | `SharedListView` → `SharedListError` |
| **Bez konekcije** | ✅ | The list already loaded, then the connection dropped. The last version stays on screen with a quiet banner, ticking still works, the header shows "Osvežavanje pauzirano", and the list refreshes when the connection returns. A banner, not a full page. | `SharedListView` + `SharedHeader status="paused"` |

### In-page empty states (Proizvodi)

| State | Status | Shown when | Component |
|-------|--------|------------|-----------|
| **Nema rezultata – "Nema proizvoda za ove filtere."** | ✅ | The product grid has no results for the current search or filters. "Prikaži sve proizvode" resets the filters. | `ProductGrid` (`no-results`) |
| **Prazna lista – "Tvoja lista je prazna."** | ✅ | The shopping list panel has no items. "Pregledaj proizvode" closes the panel. | `ListPanel` (`empty-list`) |
| **Nije u tvojim marketima – "Proizvod nije dostupan u tvojim marketima."** | ✅ | Product details, when none of the user's markets sells the product. | `StoreOffers` (`not-in-markets`) |
| **Loading** | ✅ | Product grid while search or catalog loads; store prices in product details while they load. | `ProductCardSkeleton`, `StoreOffers` |

## Development

### Conventions
- **Components**: Tailwind + shadcn primitives (no CSS Modules for new work)
- **Responsive**: Mobile-first (320px–1920px via `clamp()`, `min()`, media queries)
- **Commits**: Descriptive, no "AI assistant" credits in messages
- **Error handling**: All Supabase errors translated to Serbian for users

### Key Files
- `contexts/AuthContext.tsx` — Auth state, sign-in methods
- `app/(auth)/prijava/` — Login flows (welcome + OTP)
- `app/(authenticated)/` — Protected routes (navbar present)
- `lib/supabase/` — Client setup (browser, server, middleware)

## Features

✅ **Email OTP sign-in** — Full end-to-end, tested  
✅ **OAuth wiring** — Google & Apple, awaiting provider config in Supabase dashboard  
✅ **Shared lists** — Real-time sync via Supabase subscriptions  
✅ **Responsive design** — 320px–1920px (3xl breakpoint for 8-column grid at 1920px+)  
✅ **Product browsing** — Phase 2 Step 2 (production-ready: search, filtering, infinite scroll, mobile-parity UI)  
✅ **Responsive Container system** — Tailwind-native with adaptive gutters (16px → 24px → 32px)  
⏳ **Product details** — Phase 2 (planned: /proizvodi/[id], clickable cards)  
⏳ **Store selection** — Phase 2 (planned: /prodavnice)  
⏳ **Shopping lists** — Phase 3 (planned)

## Roadmap & Details

See [`docs/CLAUDE.md`](docs/CLAUDE.md) for:
- 6-phase roadmap (auth, products, lists, sharing, search, refinement)
- Architecture decisions and rationale
- Detailed status and blockers
- Development preferences

## Deployment

Deployed automatically to Vercel on every push to `main`. Preview URLs generated for feature branches.

## License

[License info here, if applicable]
