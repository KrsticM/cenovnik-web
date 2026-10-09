# eCenovnik Web

Web app for eCenovnik, the Serbian grocery price-comparison platform. It mirrors the mobile app: browse and search products with today's prices, compare markets, keep a shopping list and share it with anyone through a link.

**Live**: `https://web.ecenovnik.app`

## Features

- **Sign-in**: email one-time code; Google and Apple OAuth are wired but need provider setup in Supabase.
- **Products** (`/proizvodi`):
  - search (diacritics-insensitive, words in any order, barcodes);
  - filters (my markets, price ranges, deals only), sort, and infinite scroll;
  - search and the grid run in Postgres.
- **Product detail**: a dialog with a shareable URL (`?proizvod=<id>`). Browser Back closes it.
  - prices in the user's favourite markets, grouped by chain and price;
  - deals show the old price struck through and the discount;
  - lists the favourite stores that don't carry the product.
- **Shopping list panel**: quantities with undo, a market comparison for the whole list, sharing and clearing. Changes save in order and sync live across devices.
- **Shared list** (`/lista/[token]`): a public, no-account page.
  - live updates from the owner;
  - "bought" ticks shared by everyone with the link, with progress and the remaining total;
  - offline: ticks queue on the device and sync on reconnect;
  - never shows owner details and is not indexed by search engines.
- **System states**: 404, error pages, loading skeletons, empty states and an offline banner. All are listed under [System states](#system-states).
- **Not built yet**: settings (`/podesavanja`) is a placeholder.

UI copy is Serbian (Latin), in the informal "ti" form.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 with design tokens in `app/globals.css`; shadcn/ui on Radix primitives
- Supabase: Postgres, Auth, Realtime (`@supabase/ssr`, `@supabase/supabase-js`)
- Vercel (deploys on push to `main`, previews for branches)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm test           # unit tests (Vitest); see .claude/skills/write-tests
npx tsc --noEmit   # type check
```

`.env.local` (not committed):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
REVENUECAT_PROJECT_ID=xxx
REVENUECAT_SECRET_KEY=sk_xxx
```

The two RevenueCat variables are server-only (never `NEXT_PUBLIC_`) and used by `/api/pretplata` to check Premium. The key is a **v2 secret API key** with only *Customer information → read only*; the project id is in the RevenueCat dashboard URL. On Vercel add both under Project Settings → Environment Variables for Production and Preview. Without them locally the endpoint answers 500 with `isPremium: null` and everyone is treated as Standard, which is fine unless you are testing Premium. Restart `npm run dev` after changing `.env.local`. `.env.example` lists every variable.

The database also needs the scripts under [Database](#database).

## Architecture

### Routes

| Route | Access | What it is |
|---|---|---|
| `/` | all | Redirects to `/proizvodi` (signed in) or `/prijava` |
| `/prijava`, `/prijava/email` | public | Sign-in (OAuth, email code) |
| `/auth/callback` | public | OAuth / magic-link callback |
| `/proizvodi` | signed in | Product catalog and detail dialog |
| `/lista` | signed in | Older full-page list (the panel is the main list UI) |
| `/moji-marketi` | signed in | Store picker (same component as the sign-in step) |
| `/podesavanja` | signed in | Placeholder |
| `/lista/[token]` | public | Shared list (server-rendered, real 404 for dead links) |
| `/api/lista/[token]` | public | Shared list JSON for client refreshes |

`proxy.ts` refreshes the Supabase session and redirects signed-out users away from protected routes.

### Code layout

```
app/                      routes; (auth) and (authenticated) route groups, error/not-found pages
components/ui/            primitives: shadcn files plus our own (price, deal-price, check-row,
                          state-illustration, empty-state, …); kebab-case file names like shadcn
components/<Name>/        app components: AppShell, Navbar, ListPanel, SharedListView, StatePage,
                          StoreCard, QuantityStepper, …
contexts/                 AuthContext (session, sign-in), ShoppingListContext (owner's list, stores)
hooks/                    shared-list hooks (data, ticks, connectivity) and small utilities
lib/services/             all data access (Supabase client calls, RPCs)
lib/                      helpers: price formatting, local storage store, uuid check, support contact
supabase/                 SQL for functions, triggers and access rules (see Database)
types/                    shared types (list, list items, product)
```

Conventions:
- Components are dumb: props in, callbacks out.
- State and effects live in hooks, data access in `lib/services`.
- Colours come from palette tokens, never raw hex.
- Styled raw HTML lives only in `components/ui` primitives.

`.claude/skills/design-to-component/` documents the design workflow (Claude Design project "Scope questions for page build") and these rules.

### Data and sync

- **Signed-in users** talk to Supabase directly from the browser; Row-Level Security limits them to their own lists.
- **Catalog**: Postgres functions `browse_products` / `browse_products_count` do search, filters, sort, keyset pagination and a capped count. The cheapest price per product comes from the materialized view `product_price_summary`, and the daily "Preporučeno" order from `product_browse_order`; a pg_cron job refreshes both by calling `refresh_product_price_summary()`.
- **Owner's list**: `ShoppingListContext` applies changes optimistically and saves them one after another. Realtime `postgres_changes` keeps other devices in sync, with reloads debounced and shared-list ticks ignored.
- **Shared list**:
  - **Reads:** anonymous visitors have no table access at all. They read through `get_shared_list(token)` and tick through `set_shared_item_checked(token, …)`, both security-definer functions checked against the token.
  - **Live updates:** database triggers send data-free Realtime Broadcast pings on a topic hashed from the token. The page then re-reads the list.
  - **Offline:** ticks are optimistic, queued in localStorage while offline, replayed on reconnect and retried every 10 s on errors. The last tap wins.

## Database

Scripts in `supabase/`, run in the Supabase SQL Editor. All are safe to re-run.

| Script | Provides |
|---|---|
| `authenticated_shopping_lists.sql` | RLS: owners read and edit only their own lists and items |
| `browse_products.sql` | Catalog search functions, `product_price_summary` view, refresh function, pg_cron note |
| `browse_products_checks.sql` | Read-only checks for the catalog functions (run block by block) |
| `shared_list_checks.sql` | `checked_at` on list items, `set_shared_item_checked` |
| `shared_list_realtime.sql` | Broadcast triggers and `shared_list_topic` for live shared lists |
| `get_shared_list.sql` | `get_shared_list(token)`: name, topic, items, cheapest prices |
| `signin_showcase.sql` | `get_signin_showcase(limit)`: popular products behind the sign-in card |
| `public_shopping_lists.sql` | Removes all direct table access for anonymous visitors |

Order for a new database:
1. `authenticated_shopping_lists.sql`
2. `browse_products.sql`
3. `shared_list_checks.sql`
4. `shared_list_realtime.sql`
5. `get_shared_list.sql`
6. `signin_showcase.sql`
7. Deploy the web app.
8. `public_shopping_lists.sql`, last: app versions older than the `get_shared_list` reader stop working once it runs.

## System states

Designs come from `Stanja.dc.html` (system states) and `Proizvodi.dc.html` (in-page empty states).
- Full-page messages use `components/StatePage/`.
- In-page messages use `EmptyState`.
- Every illustration is a `StateIllustration` variant.

| State | Where | Component |
|---|---|---|
| 404 "Ova stranica ne postoji" | Unknown URL; app header for signed-in users, product search | `app/not-found.tsx` → `NotFoundScreen` |
| 500 "Nešto nije u redu" | Render error; retry, support contact, error code | `app/error.tsx`, `app/(authenticated)/error.tsx` → `ErrorScreen` |
| Shared list loading | Server couldn't render the list, client retries | `SharedListSkeleton` |
| "Ovaj link više nije aktivan" | Bad token, deleted or unshared list (same screen, real 404) | `app/lista/[token]/not-found.tsx` |
| "Lista trenutno nije dostupna" | Shared list failed before anything showed | `SharedListError` |
| Offline banner | Shared list loaded, connection lost; header shows "pauzirano" | `OfflineNotice`, `LiveStatus` |
| Unsaved ticks banner | A tick couldn't be saved yet; retries every 10 s | `UnsavedNotice` |
| "Nema proizvoda za ove filtere." | Empty product grid | `ProductGrid` |
| "Tvoja lista je prazna." | Empty list panel | `ListPanel` |
| "Proizvod nije dostupan u tvojim marketima." / "Izaberi svoje markete" | Product detail with no offers / no favourite markets | `StoreOffers` |
| Loading skeletons | Grid, detail prices, list panel | `ProductCardSkeleton`, `StoreOffers`, `ListPanelSkeleton` |
| Full-page "Bez marketa" | Not built yet: waits for store selection in `/moji-marketi` | — |

## Deployment

Vercel deploys `main` automatically and builds previews for branches. Database scripts are run by hand (see [Database](#database)); run any new script before deploying the code that uses it.

More background (roadmap, decisions) is in [`docs/CLAUDE.md`](docs/CLAUDE.md).
