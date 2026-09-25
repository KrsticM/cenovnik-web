# Cenovnik Web — Feature Parity Roadmap

**Goal**: Build a web app at `web.ecenovnik.app` that achieves feature parity with cenovnik-mobile, backed by a shared API architecture.

---

## Project Overview

**Cenovnik** is a Serbian grocery price-comparison platform. The mobile app lets users:
- Browse products with infinite scroll search
- View prices across multiple retail stores
- Create and manage shopping lists
- Share shopping lists via shareable links
- Select preferred stores
- Authenticate via email OTP (and social logins)
- Access premium features via subscription (RevenueCat)

**Web parity goal**: Replicate all core UX flows in a responsive Next.js web app, shared database (Supabase), and optional shared API for both clients to use.

**Domain**: `web.ecenovnik.app` (configured via DNS/deployment)

**Tech Stack (Web)**:
- Framework: Next.js 15+ (App Router)
- Language: TypeScript (strict mode)
- UI: React + Tailwind CSS (design tokens match mobile palette)
- State: React Context (Auth, UserStores, Subscription) — mirror mobile
- Backend: Supabase (PostgreSQL, Auth, Edge Functions)
- Deployment: Vercel
- API: RESTful API layer (optional; can be shared by both clients or mobile hits Supabase directly)

---

## Architecture Decision: Direct Supabase (No API Layer)

**Decision**: Both web and mobile clients hit Supabase directly via client libraries and RLS policies.

**Why**:
- Simpler architecture; no additional backend to maintain
- Supabase is built for this pattern (Auth, Realtime, RLS)
- Faster iteration during development
- Revisit if scaling or advanced use cases require API layer (e.g., complex billing, webhooks)

**Risk mitigation**:
- Use Row-Level Security (RLS) policies to enforce user data isolation
- Implement rate limiting at the Supabase level if needed
- Monitor Supabase usage; optimize queries if performance degrades

---

## Phase Breakdown

### Phase 1: Foundation ✅ COMPLETED
**Status**: All commits pushed (4f04def — Phase 1, Step 5)

**Deliverables**:
- [x] Migrate from Cloudflare Workers + vinext to Vercel + vanilla Next.js
- [x] Set up Supabase client libraries (with proper env vars)
- [x] Establish design token palette matching mobile (earth tones: #925442 primary, etc.)
- [x] Implement authentication routes (OAuth via Supabase, Email OTP via Supabase)
- [x] Build AuthProvider context + session management (mirror mobile authContext pattern)

**Outcome**: Web app has auth flow parity with mobile. Users can sign in and session persists.

---

### Phase 2: Core Product Browsing
**Target**: ~2 weeks | ~40 tasks

**Deliverables**:
1. **Product Service Layer**
   - Create `lib/services/products.ts` (Supabase or API client)
   - Fetch products with pagination (limit 20–50 per page)
   - Search products via `ilike` query (replicate mobile search logic)
   - Format product data (name, image, category)

2. **Home/Products Page** (`app/(authenticated)/home/page.tsx`)
   - Product grid (responsive: 2 cols on mobile, 3–4 on desktop)
   - Search bar at top (debounced 400ms, live results)
   - Infinite scroll via `useInfiniteQuery` (TanStack Query) or custom fetch logic
   - Skeleton loading states
   - Pull-to-refresh (web equivalent: manual refresh button or React Query refetch)

3. **Product Detail Page** (`app/(authenticated)/products/[id]/page.tsx`)
   - Display product name, image, category
   - Show prices per retailer/store (table or card layout)
   - Display store logos (same asset map from mobile)
   - Back navigation

4. **Store Selection UI** (`app/(authenticated)/stores/page.tsx`)
   - List all available stores (sync from Supabase)
   - User toggles preferred stores (persist to user_stores table via Supabase)
   - Mirror mobile `userStoresContext` with React Context

5. **Styling**
   - Tailwind setup matching mobile palette (custom config for #925442, etc.)
   - Responsive layout (mobile-first)
   - Dark mode consideration (or match mobile's light theme only)

**Tech Debt / Decision Points**:
- Use TanStack Query (`@tanstack/react-query`) for data fetching & caching (improves over custom fetch)
- Consider extracting shared types (`types.ts` from mobile) into a monorepo or npm package
- Decide: Direct Supabase queries in Next.js server components (lighter) vs API routes (centralized)

**Testing**:
- Verify product grid loads and scrolls
- Search returns correct results
- Product detail shows correct prices per store
- Store selection persists across sessions

---

### Phase 3: Shopping Lists
**Target**: ~2 weeks | ~30 tasks

**Deliverables**:
1. **Shopping List Service** (`lib/services/shoppingLists.ts`)
   - Fetch user's shopping lists (real-time via Supabase subscriptions)
   - Create, update, delete shopping lists
   - Add/remove products from lists
   - Calculate totals per store

2. **Shopping Lists Page** (`app/(authenticated)/shopping-lists/page.tsx`)
   - Display user's shopping lists in a table or card view
   - "Create new list" button
   - Search/filter lists
   - Actions: edit name, delete, compare prices

3. **Shopping List Detail** (`app/(authenticated)/shopping-lists/[id]/page.tsx`)
   - Display products in list with quantity
   - Add/remove products (searchable product modal)
   - Show total price per store (table format)
   - "Compare Prices" button (show all stores side-by-side)
   - Delete list, rename list

4. **Price Comparison Modal/Page** (`app/(authenticated)/shopping-lists/[id]/compare/page.tsx`)
   - Table: rows = products, columns = stores
   - Show total row at bottom
   - Highlight cheapest option per store
   - Share list button

5. **Real-time Sync**
   - Use Supabase `onSnapshot` listener (React Hook pattern) to sync list changes across tabs/devices
   - Update prices if product prices change

**Testing**:
- Create, edit, delete shopping lists
- Add/remove products
- Verify price totals are correct
- Real-time updates work across browser tabs

---

### Phase 4: Shopping List Sharing & Advanced Features
**Target**: ~10 days | ~20 tasks

**Deliverables**:
1. **Shopping List Sharing**
   - "Share list" button on shopping list detail
   - Generate share token (call Supabase `enableSharing` function)
   - Display shareable link: `https://www.ecenovnik.app/lista/<token>`
   - Copy link to clipboard button
   - Social share (native share API or pre-filled share text)

2. **Public Shared List Page** (`app/lista/[token]/page.tsx`)
   - Unauthenticated users can view shared list
   - Display product list + prices per store
   - No edit capability (read-only)
   - Show store total column
   - "Sign in to add to your list" CTA

3. **Subscription Management** (`app/(authenticated)/subscription/page.tsx`)
   - Display current subscription status (if subscribed via RevenueCat or Supabase)
   - Show available plans/offerings
   - "Upgrade" / "Manage subscription" button
   - Link to RevenueCat paywall (if using) or custom paywall

4. **Settings Page** (`app/(authenticated)/settings/page.tsx`)
   - Display logged-in user info
   - Sign out button
   - Delete account button (calls Supabase Edge Function)
   - App version info
   - Subscription status link
   - Language/theme preferences (future)

**Testing**:
- Share list, verify link works for unauthenticated users
- Copy link to clipboard
- Delete account flow
- Subscription status displays correctly

---

### Phase 5: Search Optimization & Performance
**Target**: ~10 days | ~15 tasks

**Deliverables**:
1. **Advanced Search** (optional Typesense migration)
   - Current: Supabase `ilike` search
   - Future: Migrate to Typesense for full-text search, typo tolerance, facets
   - Surface search filters: category, price range, store
   - Search suggestions/autocomplete

2. **Performance**
   - Image optimization (Next.js `<Image>` component, lazy loading, srcset)
   - Code splitting & route-based lazy loading
   - Caching strategy: Cache-Control headers for product images (immutable)
   - Database query optimization (add indexes, avoid N+1 queries)

3. **Analytics & Monitoring**
   - Setup Vercel Analytics (Web Vitals tracking)
   - Log errors to Sentry or similar
   - Track key events (search, add to list, share list)

4. **Accessibility**
   - ARIA labels on interactive elements
   - Keyboard navigation (Tab, Enter, Escape)
   - Color contrast audit
   - Screen reader testing

**Testing**:
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Search performance with 10k+ products
- Image loading on slow connections (Lighthouse 3G throttle)

---

### Phase 6: Refinement & Launch
**Target**: ~5 days | ~10 tasks

**Deliverables**:
1. **Mobile-first Responsive Design**
   - Test on iPhone 12, iPad, desktop (1920px)
   - Verify touch targets (min 44x44px)
   - Test on mobile browsers (Safari iOS, Chrome Android)

2. **Barcode Scanner (Optional, Phase 6+)**
   - Use Web APIs (`navigator.mediaDevices.getUserMedia` + barcode detection library)
   - Allow users to scan product barcodes to add to list
   - Can defer to Phase 6 or later sprint

3. **Ads (Optional, Monetization)**
   - Google AdSense or similar for web
   - Ad placement: product grid, shopping list (non-intrusive)
   - Can defer or skip if subscription is sufficient

4. **Testing Suite**
   - Unit tests for services (products, shopping lists)
   - Integration tests for core flows (auth, create list, share)
   - E2E tests for critical paths (Playwright or Cypress)

5. **Documentation**
   - Update CLAUDE.md with finalized architecture
   - Document API endpoints (if built)
   - Deployment runbook for Vercel

6. **Launch Checklist**
   - SEO setup (meta tags, Open Graph for shared lists)
   - SSL certificate for web.ecenovnik.app
   - Error monitoring (Sentry)
   - Performance monitoring (Vercel Analytics)
   - Content Security Policy headers

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Clients                                 │
├────────────────────────┬────────────────────────────────────┤
│   cenovnik-mobile      │   cenovnik-web (web.ecenovnik.app)│
│  (React Native/Expo)   │      (Next.js on Vercel)          │
└────────────────────────┴────────────────────────────────────┘
           │                            │
           └────────────┬───────────────┘
                        │
                   ┌────▼──────────────────┐
                   │    Supabase           │
                   │    PostgreSQL         │
                   │    Auth (email OTP)   │
                   │    Realtime           │
                   │    Edge Functions     │
                   │    RLS Policies       │
                   └───────────────────────┘
```

Both clients use Supabase client libraries directly with Row-Level Security policies enforcing data isolation.

---

## Technology Decisions

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Framework | Next.js 15 (App Router) | Server/Client components, built-in API routes, Vercel native |
| Styling | Tailwind CSS | Mobile-first, design tokens, matches mobile palette easily |
| State | React Context (+ TanStack Query) | Mirrors mobile architecture; Query adds caching/sync |
| Auth | Supabase Auth | Already in use; Email OTP + OAuth via Supabase |
| Database | Supabase PostgreSQL | Existing schema; Realtime subscriptions for lists |
| Deployment | Vercel | Native Next.js, serverless functions, auto CI/CD |
| Client Communication | Direct Supabase (no API layer) | Simpler architecture; client libraries handle auth & RLS |
| Testing | Playwright (E2E) + Vitest (Unit) | Fast, modern, good DX |

---

## Data Model (Mirrors Mobile)

**Existing in Supabase** (shared with mobile):
- `products`: id, product_name, has_image, created_at
- `barcodes`: id, product_id, barcode (joined to products via foreign key)
- `current_prices`: product_id, store_id, regular_price, discounted_price, price_date (live per-store pricing)
- `stores`: id, retailer_id, retailer_name, address (physical store locations)
- `auth.users`: Supabase managed (email, uid, etc.)
- `user_stores`: user_id, store_id (many-to-many user preferences; used for scoped pricing in mobile, not yet in web)
- `shopping_lists`: id, user_id, name, created_at, updated_at
- `shopping_list_items`: id, list_id, product_id, quantity, added_at
- `share_tokens`: id, list_id, token, created_at, expires_at
- `app_config`: min_version, store_urls (version gating)

**Web-specific tables** (optional, future):
- `web_sessions`: if adding analytics (not implemented)
- `feature_flags`: for A/B testing (not implemented)

---

## Deployment & Environment

**Staging**: `staging-web.ecenovnik.app` (Vercel branch deployment)
**Production**: `web.ecenovnik.app` (Vercel production)

**Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (server-only, for Edge Functions)

NEXT_PUBLIC_REVENUEAT_API_KEY=xxx (if using RevenueCat)
NEXT_PUBLIC_GOOGLE_ADS_ID=xxx (if using AdMob/AdSense)

VERCEL_URL (auto-set by Vercel)
NODE_ENV (auto-set)
```

---

## Success Metrics

- **Phase 1**: Users can authenticate and see auth state persists ✅
- **Phase 2**: Product grid loads in < 2s; search works with debounce; 90+ Lighthouse score
- **Phase 3**: Shopping lists sync in real-time; totals calculate correctly
- **Phase 4**: Share links work for unauthenticated users; subscription status displays
- **Phase 5**: Search handles 50k+ products; Core Web Vitals all green
- **Phase 6**: Mobile-responsive layout; E2E tests pass; launch on time

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Supabase RLS complexity | Start simple; add row-level security rules incrementally |
| Real-time sync delays | Set reasonable `onSnapshot` intervals; use optimistic updates |
| Performance (image loading) | Use Next.js `<Image>` + Vercel image optimization |
| Mobile browser compatibility | Test on iOS Safari + Chrome Android early; use polyfills if needed |
| Authentication token refresh | Ensure Supabase client handles refresh automatically |
| Shared schema conflicts | Coordinate with mobile team; use feature flags for schema changes |

---

## Team & Ownership

- **Lead**: Dusan Marjanski
- **Backend** (if API created): TBD
- **Mobile Liaison**: Coordinate on schema changes, shared types
- **Deployment**: Vercel (configured via web.ecenovnik.app DNS)

---

## Progress Tracking

See **## Status** section below.

---

## Status

### Phase 1: Foundation ✅ COMPLETE
**Date Completed**: 2026-07-23

**Step 1-5 (Previous sessions)**:
- [x] Migrate to Vercel + vanilla Next.js
- [x] Design tokens set up (earth-tone palette matching mobile)
- [x] Supabase client configured
- [x] Auth routes implemented (OAuth, Email OTP)
- [x] AuthProvider context built
- **Commits**: beea3dd–4f04def

**Step 6 (2026-07-22)**: Component Refactoring ✅
- [x] Refactored shared shopping list page into reusable React components
- [x] Created 10 composable components with isolated CSS modules:
  - BrandMark (logo display)
  - Checkbox (custom checkbox with state)
  - ProductImage (thumbnail with preview)
  - LiveIndicator (real-time sync badge)
  - ListItem (row composition)
  - ImageModal (full-screen preview)
  - ListHeader (brand + indicator)
  - ListCard (container with title)
  - LoadingState, ErrorState, EmptyState
  - SharedListView (main orchestrator)
- [x] Tailwind config created with brand color tokens
- [x] CSS modules pattern implemented (industry standard)
- [x] DRY principle enforced (no code duplication)
- [x] Development preferences documented
- **Commit**: e3f56b2
- **Files**: 22 new files (components + CSS modules + index + config)

**Step 7 (2026-07-23)**: Navbar & Typography Polish ✅
- [x] Create ListNavbar component (fixed sticky header)
- [x] Match navbar design exactly from cenovnik-landing-page
- [x] Import Work Sans font family site-wide
- [x] Remove duplicate brand mark from ListHeader
- [x] Fix vertical spacing between "8 proizvoda" and first item
- [x] Add responsive padding offsets for fixed navbar
- [x] Copy logo.png and icon.png assets
- **Navbar features**:
  - Fixed positioning, full-width, z-50
  - Glassmorphic background (rgba + blur)
  - 48×48px logo with rounded corners and soft shadow
  - Brand color text, 500 weight, 1.375rem size
  - Responsive container pattern (max-width 80rem, px-4/6/8)
- **Spacing improvements**:
  - ListCard titleSection padding reduced
  - ListItem first-child border-top hidden
  - No duplicate dividers
- **Commit**: 654c107
- **Status**: Phase 1 complete, ready for Phase 2

**Step 8 (2026-07-23)**: Web-Native Auth Redesign (CSS Modules) — ABANDONED ❌
- Reason: Unresolved CSS layout bug (width constraint on 16" displays) + stale `@supabase/ssr` version incompatibility with current auth client made session parsing fail. Reverted in favor of Step 12's cleaner architecture built on Tailwind+shadcn.
- **Decision**: When re-implementing, use Tailwind + shadcn components (aligned with newer codebase direction) instead of CSS Modules, which was the pattern at the time Step 8 was built. Session cookie issue also required `@supabase/ssr` upgrade from 0.1.0 to 0.12.4.

**Step 9 (2026-08-18)**: SharedListView Refactoring & Architecture Polish ✅
- [x] **Phase 1: Quick Wins (CSS Tokens + shadcn Checkbox)**
  - [x] Add transition tokens to globals.css (`--transition-fast`, `--transition-base`, `--transition-slow`)
  - [x] Replace custom Checkbox with shadcn checkbox (WCAG compliance, keyboard support, focus management)
  - [x] Create shared-styles module (consolidate .eyebrow, transitions)
  - [x] Update transition values to use CSS variables across all components
- [x] **Phase 2: Hooks Extraction (DRY + SRP)**
  - [x] Create `hooks/` directory structure
  - [x] Extract `useShoppingListData(token)` hook: API fetch + Supabase realtime subscription
  - [x] Extract `useCheckedItems(token)` hook: localStorage persistence
  - [x] Refactor SharedListView: 198 lines → ~60 lines (70% reduction)
  - [x] Remove 3 useEffect blocks, move logic to hooks
  - [x] Create lib/transition-variables.ts (CSS variable documentation)
- [x] **Image Modal Improvements**
  - [x] Swap ImageModal from CSS Modules to pure Tailwind (shadcn Dialog-based)
  - [x] Fix grid/flex collision bug (using Tailwind utilities + cn() for proper merging)
  - [x] Implement responsive sizing: `w-[calc(100%-2rem)] sm:max-w-[600px]`
  - [x] Fix image cutoff on mobile: `items-start` instead of `items-center`
  - [x] Increase mobile viewport usage: `max-h-[95dvh]` on phones
  - [x] Add title right padding to prevent overlap with close button
- [x] **Generalize ImageModal Component**
  - [x] Replace hardcoded barcode→URL logic with generic title/imageUrl props
  - [x] Create `lib/productImageUrl.ts` utility for CDN URL building
  - [x] Move barcode-specific logic to callers (ProductImage, SharedListView)
  - [x] Enable ImageModal reuse for any image preview (products, stores, avatars, etc.)
- [x] **Code Quality Improvements**
  - [x] Eliminate DRY violations: .eyebrow duplicated in 3 places → 1 global class
  - [x] Transition values hardcoded in 5+ files → centralized CSS variables
  - [x] Checkbox accessibility: custom component → shadcn (Radix-backed)
  - [x] SharedListView: mixed concerns → clear hooks abstraction
- **Architecture Grade**: B+ → A (solid dumb components, proper SRP, DRY enforced)
- **Files Created**: hooks/useShoppingListData.ts, hooks/useCheckedItems.ts, hooks/index.ts, lib/productImageUrl.ts, lib/transition-variables.ts, components/shared/shared-styles.module.css
- **Files Modified**: 15+ (Checkbox, SharedListView, ImageModal, ListCard, StateShells, ListItem, ProductImage, globals.css)
- **Files Deleted**: ImageModal.module.css, Checkbox.module.css (refactored to Tailwind/shadcn)
- **Commits**: 6 atomic commits (each phase tracked separately for clean history)
- **Status**: ✅ Complete, all phases merged, ready for Phase 2

**Step 10 (2026-08-19)**: Auth Routing & Root Page Refactor ✅
- [x] Real middleware protection with user state (getUser validation)
- [x] Server-side auth dispatcher at root `/` (redirects to /prijava or /proizvodi)
- [x] Placeholder pages: /prijava (login) and /proizvodi (products)
- [x] Created PlaceholderCard reusable component (dumb, CSS modules)
- [x] Sign-out button in navbar (ListNavbar, functional when authenticated)
- [x] Deleted dead code: /prijava/email, /api/lista/[token]
- [x] Fixed background consistency (removed radial gradient, solid --paper)
- [x] Centered text on both pages (text-align: center)
- [x] Responsive layout: (authenticated) layout with proper flex structure
- [x] Refactored to match SharedListView architecture (dumb components, CSS Modules)
- [x] CLAUDE.md updated: responsive design marked as CRITICAL requirement
- **Status**: ✅ Complete, build passes, 5 routes compiled, responsive design verified
- **Files Created**: app/(authenticated)/, components/PlaceholderCard/
- **Files Deleted**: app/(auth)/prijava/email/page.tsx (dead code)
- **Commit**: e556413 (merged PR #2)

**Step 11 (2026-08-19)**: Enable Supabase Realtime Subscriptions ✅
- [x] Diagnosed broken auto-refresh on `/lista/[token]` (dead realtimeConfig plumbing)
- [x] Traced root cause: API route never returned realtime field, blocking subscription activation
- [x] Removed `RealtimeConfig` type and state dependencies
- [x] Integrated `createClient()` from `@/lib/supabase/client` (uses bundled `NEXT_PUBLIC_*` env vars)
- [x] WebSocket push-based sync now activates on page load (phoenix channels underneath)
- [x] No polling; instant updates when `shopping_list_items` or `shopping_lists` change in Postgres
- **Architecture**: Client reads public env vars directly → Supabase Realtime subscription → postgres_changes listener on tables → browser gets instant push updates
- **Status**: ✅ Complete, build passes, Realtime feature now active
- **Files Modified**: hooks/useShoppingListData.ts, hooks/index.ts
- **Commit**: 5e090cd
- **Branch**: lista-za-kupovinu-auto-refresh (ready for Phase 2)

**Step 12 (2026-08-20)**: Email OTP Sign-In (Tailwind + shadcn, Full End-to-End) ✅
- [x] **AuthContext Extensions**:
  - [x] Add `signInWithEmail(email)` → `supabase.auth.signInWithOtp({ shouldCreateUser: true })`
  - [x] Add `verifyOtpCode(email, code)` → `supabase.auth.verifyOtp(type: "email")`
  - [x] Add `signInWithGoogle(next?)` → `supabase.auth.signInWithOAuth({ provider: "google", redirectTo: ... })`
  - [x] Add `signInWithApple(next?)` → `supabase.auth.signInWithOAuth({ provider: "apple", ... })`
  - [x] Add `translateAuthError()` utility (Supabase errors → Serbian, no English leakage)
- [x] **Routes**:
  - [x] `/prijava/page.tsx`: Welcome screen (Apple, Google, Email buttons; plain shadcn styling)
  - [x] `/prijava/email/page.tsx`: Two-step flow (email entry → 6-digit code verification)
- [x] **UX Polish**:
  - [x] Auto-submit on 6th digit (via `useEffect` watching `otp.length === 6`)
  - [x] 60-second resend cooldown with live countdown on both email/OTP steps
  - [x] Split loading states (`sendLoading` vs `verifyLoading`) — resend doesn't block verify button, vice versa
  - [x] Cooldown prevents rate-limit errors in normal use (button disabled while counting down)
  - [x] All Supabase errors translated to Serbian (`over_email_send_rate_limit` → "Iz bezbednosnih razloga...")
  - [x] Browser-back bfcache state reset (reset `loading` on `pageshow` event with `persisted` flag)
- [x] **Infrastructure Fixes**:
  - [x] Upgrade `@supabase/ssr` from stale 0.1.0 to 0.12.4 (fixes session cookie parsing with current 2.110.8 auth client)
  - [x] Hard navigation after OTP verify (`window.location.href` instead of `router.push`) to ensure fresh session cookies visible to middleware
- [x] **Testing**: Full end-to-end manual testing (send code → receive → verify → redirect to `/proizvodi` → session persists)
- **OAuth Status**: Code-level wiring complete (redirect flow works), awaiting Supabase provider config (Google Web Client ID + Apple Services ID)
- **Architecture**: Tailwind + shadcn Button/Input/Label (no custom components), responsive (320px–1920px), integrated with existing middleware/auth context
- **Files Created**: `app/(auth)/prijava/email/page.tsx`
- **Files Modified**: `contexts/AuthContext.tsx`, `app/(auth)/prijava/page.tsx`, `package.json` (@supabase/ssr bump), `.gitignore` (add CONTEXT.md)
- **Files Deleted**: `components/PlaceholderCard/` (dead code)
- **Commits**: One atomic commit with full Phase 1 auth completion
- **Status**: ✅ Complete, end-to-end email OTP tested and working, OAuth wiring ready for provider config, plain shadcn styling (visual polish deferred to Phase 1B)

### Phase 2: Core Product Browsing ⏳ (In Progress)

**Step 1 (2026-08-21)**: /proizvodi Functional UI v1 ✅
- [x] Product service layer (`lib/services/products.ts` — browse feed, search, pricing)
- [x] Types (`types/product.ts` — Product shape)
- [x] Price formatting (`lib/formatPrice.ts` — RSD display)
- [x] /proizvodi listing page: Tailwind + shadcn, debounced search, product grid, "load more" button
- [x] Lowest-price display (across all stores; store-scoped pricing deferred until /prodavnice exists)
- [x] Error/loading/empty states (inline, minimal)
- **Architecture**: Ported directly from `cenovnik-mobile/services/products.ts`; plain `useState`/`useEffect` (no TanStack Query, keep it simple for v1)
- **Data fetching**: Browser-side Supabase queries via `@/lib/supabase/client`
- **Styling**: Tailwind + shadcn/ui (`Button`, `Input`, `Skeleton`), no CSS Modules (consistent with prijava precedent)
- **Known gaps in v1**: No clickable product detail routes; no barcode scanner; responsive layout tested but visual design is placeholder
- **Next steps**: Product detail page (/proizvodi/[id]), visual polish/design refinement, consider TanStack Query for pagination caching

**Tech debt note**: TanStack Query — nice-to-have for v2+, explore for pagination/caching; current `useState`/`useEffect` pattern matches mobile's existing approach and keeps first pass focused.

- **Target Start**: 2026-08-20
- **Target End**: 2026-09-02
- **Prerequisites**: ✅ Phase 1 auth (email OTP) complete, ✅ Realtime subscriptions working, ⏳ OAuth needs Supabase provider config (Google Web Client ID + Apple Services ID — external setup, not code)

**Step 2 (2026-08-23)**: /proizvodi Production Polish & Performance Optimization ✅
- [x] **Responsive Container Foundation**
  - [x] Created `Container` primitive (`components/ui/container.tsx`) — Tailwind/shadcn-native, NOT CSS Modules (aligns with Phase 2+ architecture)
  - [x] Responsive gutters: `px-4` → `sm:px-6` → `lg:px-8` (16px → 24px → 32px per side)
  - [x] Size variants: `sm` (720px), `md` (1040px), `lg` (1280px), `full` (no max-width)
  - [x] Adopted in `/proizvodi`, `/prijava`, `/prijava/email` for consistent page-level spacing
  - [x] Uses `cva` + `cn()` matching existing shadcn primitives pattern (forwardRef, interfaces, exports)
  - [x] **Decision**: Industry-standard single outer wrapper per page (not multiple nested containers) for alignment consistency
  - [x] **Reasoning**: CSS Grid's `align-items: stretch` makes all cards in a row equal height; single container ensures all sections share responsive gutters
  
- [x] **ProductCard Layout (Mobile Parity)**
  - [x] Added `flex h-full flex-col` to root card — stretches to grid row height, flex column layout
  - [x] Product name: left-aligned, `line-clamp-2` (unchanged) — matches `cenovnik-mobile` exactly (NOT centered)
  - [x] Price footer: `mt-auto` pins to bottom of card regardless of name line count
  - [x] Footer content: `flex flex-col items-center gap-1 text-center` — centers label + price as block (matches mobile)
  - [x] Verified against `cenovnik-mobile/components/ProductGridCard.tsx` for exact parity
  - [x] **Decision**: Match mobile, not user's initial assumption (he said "centralized" for both, but mobile only centers footer)
  
- [x] **Price Fetching Bug Fix**
  - [x] **Root cause identified**: useProductPrices hook had dependency array `[products.length, userStoreIds]` where `userStoreIds` is an array reference, causing flaky timing
  - [x] **Solution**: Created useMemo'd stable strings for product IDs and store IDs (only recalculate when actual data changes)
  - [x] **Result**: Prices now fetch immediately after products load, visible on first render (was blank until "Load More" clicked)
  - [x] Added `isLoadingPrices` state to hook for future UI states (loading skeletons)
  
- [x] **"Učitaj još" Button Logic Fix**
  - [x] **Critical bug**: Button showed when loading finished, even with < 20 results (logic was `hasMore || !loading`)
  - [x] **Solution**: Changed ProductGrid condition from `(hasMore || !loading)` to just `hasMore`
  - [x] **Cascading fix**: handleSearchChange now sets `hasMore = (results.length === PRODUCTS_PER_PAGE)` for initial search
  - [x] **Result**: Button now correctly hides when search returns 11 results, shows when search/browse has full page (20+)
  
- [x] **Performance Optimization**
  - [x] useProductBrowse loadMore(): Changed O(n²) deduplication (`prev.some()`) to O(n) with Set
  - [x] Removed unused `newIds` variable
  - [x] ProductCard & ProductGrid wrapped in `memo()` with proper equality checks to prevent cascade re-renders
  - [x] useProductPrices: Removed all debug console.log statements (kept error logging for production)
  - [x] useProductSearch: Removed all debug console.log statements
  - [x] useProductBrowse: Removed all debug console.log statements
  
- [x] **3xl Breakpoint Support**
  - [x] Added `--breakpoint-3xl: 1920px` to `@theme` block in `app/globals.css`
  - [x] ProductGrid's `3xl:grid-cols-8` class now generates CSS (was dead code before)
  
- [x] **Architecture Decisions**
  - [x] **Tailwind-native, no CSS Modules**: New `Container` follows shadcn conventions (cva, forwardRef, cn), not legacy CSS Modules pattern
  - [x] **Single outer Container per page**: Ensures consistent guttering and alignment across all sections
  - [x] **Stable dependency arrays**: useMemo for product/store ID strings prevents effect flapping
  - [x] **Memoization strategy**: Only ProductCard and ProductGrid memoized (not every component) to balance perf vs complexity
  - [x] **Error logging preserved**: console.error for "Failed to fetch prices/stores" kept for production debugging
  
- **Files Created**: `components/ui/container.tsx`
- **Files Modified**: `app/(authenticated)/proizvodi/page.tsx`, `app/(authenticated)/proizvodi/components/ProductCard.tsx`, `app/(authenticated)/proizvodi/components/ProductGrid.tsx`, `app/(authenticated)/proizvodi/hooks/useProductPrices.ts`, `app/(authenticated)/proizvodi/hooks/useProductSearch.ts`, `app/(authenticated)/proizvodi/hooks/useProductBrowse.ts`, `app/(auth)/prijava/page.tsx`, `app/(auth)/prijava/email/page.tsx`, `app/globals.css`
- **Commit**: d6bf447 — "Proizvodi page: production-ready with responsive grid, optimized prices, and smart pagination"
- **Status**: ✅ Complete. All bugs fixed, production-ready code (no debug logs), performance optimized, mobile parity achieved, build verified with no type errors.
- **Next**: Product detail page (`/proizvodi/[id]`), store selection UI (`/prodavnice`), visual design refinement

### Phase 3: Shopping Lists ⏳
- [ ] Shopping list service
- [ ] Lists index page
- [ ] List detail + edit
- [ ] Price comparison
- [ ] Real-time sync
- **Target Start**: 2026-08-05
- **Target End**: 2026-08-19

### Phase 4: Sharing & Advanced Features ⏳
- [ ] Share link generation
- [ ] Public shared list page
- [ ] Subscription management
- [ ] Settings page
- **Target Start**: 2026-08-19
- **Target End**: 2026-08-29

### Phase 5: Search & Performance ⏳
- [ ] Advanced search (Typesense optional)
- [ ] Image optimization
- [ ] Performance audits
- [ ] Accessibility review
- **Target Start**: 2026-08-29
- **Target End**: 2026-09-08

### Phase 6: Refinement & Launch ⏳
- [ ] Mobile-responsive QA
- [ ] Barcode scanner (optional)
- [ ] Ad integration (optional)
- [ ] Test suite
- [ ] Documentation
- [ ] Launch checklist
- **Target Start**: 2026-09-08
- **Target End**: 2026-09-13

---

## Next Steps

1. **Immediately** (Today):
   - Save this CLAUDE.md to version control
   - Review plan with team
   - Confirm Phase 2 timeline & resource allocation

2. **Phase 2 Kickoff**:
   - Create GitHub issues for each Phase 2 task (40 estimated)
   - Set up TanStack Query or equivalent data-fetching layer
   - Begin product service layer implementation
   - Establish code review process & PR template

3. **Ongoing**:
   - Update `## Status` section weekly
   - Track issues in GitHub Projects
   - Sync with mobile team on schema changes
   - Post-mortem on Phase 1 (what went well, what could improve)

---

## Appendix: Mobile Feature Reference

**Mobile App Screens** → **Web Equivalents**:
| Mobile | Web | Status |
|--------|-----|--------|
| (auth)/index (login) | /auth/page | ✅ Phase 1 |
| (auth)/email-sign-in | /auth/email-otp | ✅ Phase 1 |
| (tabs)/home/index | /home/page | ⏳ Phase 2 |
| (tabs)/home/[id] | /products/[id]/page | ⏳ Phase 2 |
| select-stores / my-stores | /stores/page | ⏳ Phase 2 |
| (tabs)/shoppingList/index | /shopping-lists/page | ⏳ Phase 3 |
| (tabs)/shoppingList/[id] | /shopping-lists/[id]/page | ⏳ Phase 3 |
| (tabs)/shoppingList/pricesByStore | /shopping-lists/[id]/compare | ⏳ Phase 3 |
| Shared list (native) | /lista/[token] | ✅ Realtime syncing (Phase 1, Step 11) |
| (tabs)/settings | /settings/page | ⏳ Phase 4 |
| barcode-scanner | /scanner/page (optional Phase 6) | ⏳ Phase 6 |

---

## Files to Update

- **CLAUDE.md** (this file): Maintain status section weekly
- **MEMORY.md** (memory index): Save plan summary + phase tracking
- **.github/projects/cenovnik-web.md** (optional): GitHub Projects board for task tracking
- **package.json**: Add `@tanstack/react-query`, testing deps as needed

---

## Development Preferences

- **Commit messages**: Do not mention Claude or AI assistance; keep commits focused on the work itself
- **Code style**: **Phase 2+**: Tailwind + shadcn/ui for auth and product pages (new, confirmed in Phase 2); **legacy**: CSS Modules for shared/list components (will converge on Tailwind during refactor). Use Uncle Bob's DRY principle regardless of styling approach.
- **Component structure**: Each component gets its own folder with .tsx and .module.css
- **Architecture**: Industry-standard patterns (composition over inheritance, single responsibility). **⚠️ Do not deviate from documented architecture decisions (shadcn/ui components, Tailwind styling, composition patterns) without explicit approval — any deviations must include a concrete reason and require user sign-off.**
- **⚠️ CRITICAL: Responsive Design**: ALL pages and components MUST be responsive across mobile (320px), tablet (600px), and desktop (1920px). Use `clamp()` for fluid typography, `min()` for fluid container widths, and mobile-first media queries. Test on iPhone, iPad, and desktop viewports before committing. This is NOT optional — every page must work on all device sizes.

---

## Component Architecture (Phase 1, Step 6)

### Component Directory Structure
```
components/
├── BrandMark/
│   ├── BrandMark.tsx
│   └── BrandMark.module.css
├── Checkbox/
├── ProductImage/
├── LiveIndicator/
├── ListItem/
├── ImageModal/
├── ListHeader/
├── ListCard/
├── StateShells/
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   └── StateShells.module.css
├── SharedListView/
├── index.ts (barrel export)
└── tailwind.config.ts (brand colors)
```

### Component Hierarchy (Shared List Page)
```
SharedListView (main orchestrator - "use client")
├── ListHeader
│   ├── BrandMark (sm size, with image)
│   └── LiveIndicator (real-time badge)
├── ListCard (container for list title + items)
│   ├── ListItem (repeats for each product)
│   │   ├── Checkbox (checked state + visual)
│   │   ├── ProductImage (thumbnail, clickable)
│   │   └── item info (name, barcode, quantity)
│   └── EmptyState (if no items)
├── ImageModal (when image clicked - overlay)
├── LoadingState (initial load)
└── ErrorState (if fetch fails)
```

### Styling Approach
- **CSS variables** (globals.css): `--brand`, `--ink`, `--muted`, etc. from mobile app palette
- **CSS modules**: Each component has scoped .module.css file
- **Tailwind**: Configured but not used for components (kept for utilities if needed later)
- **Responsive**: Mobile-first media queries in each module

### Key Design Patterns
1. **Composition**: Components compose from smaller units (ListItem uses Checkbox + ProductImage)
2. **Single Responsibility**: Each component does one thing (Checkbox = checkbox, ProductImage = image + preview)
3. **State Management**: SharedListView holds all state (list, checked items, preview modal)
4. **DRY**: No duplicated markup or logic—extract to components if repeating

---

## Navbar Architecture & Design (Phase 2, Step 3)

### Overview
The global application navbar (`components/Navbar/`) provides primary navigation and authentication controls. It appears on all authenticated pages via `app/(authenticated)/layout.tsx` and follows a responsive mobile-first design with a hamburger menu pattern on narrow viewports.

### Component Structure
```
components/Navbar/
├── Navbar.tsx           (main orchestrator, state management)
├── NavLink.tsx          (reusable nav link with active state)
├── MobileNavMenu.tsx    (mobile dropdown panel)
└── navItems.ts          (navigation definition constant)
```

### Navigation Items
Three primary sections (mobile-parity with cenovnik-mobile):
1. **Proizvodi** (`/proizvodi`) — Product browsing & search (Store icon)
2. **Lista** (`/lista`) — Shopping list management (ShoppingCart icon)
3. **Podešavanja** (`/podesavanja`) — Settings & sign-out (Settings icon)

### Responsive Design & Breakpoints

**Desktop (≥640px)**:
- Fixed header with brand logo (left), centered nav links (Proizvodi / Lista / Podešavanja), sign-out button (right)
- All controls inline, no dropdown
- Nav links show icon + label
- Sign-out visible as standalone button

**Mobile (<640px)**:
- Fixed header with brand logo (left), hamburger menu icon (right)
- Nav links and sign-out hidden; hamburger toggles mobile dropdown
- Dropdown panel appears below navbar with stacked full-width menu items
- Nav links show icon + label (same as desktop, full-width)
- Sign-out button moves into dropdown as final menu item
- Hamburger icon swaps Menu → X when open

**Rationale**: 320px viewport width prevents inline links + sign-out button from fitting. Hamburger menu is industry standard for mobile nav collapse, maximizes usable space, matches mobile app bottom-tab affordance.

### Styling & Color Palette

**Technology**: Tailwind CSS v4 with semantic color classes aliased to CSS variables.

**Key Classes**:
- `text-primary` → `var(--brand)` (warm brown/tan primary color)
- `text-muted-foreground` → `var(--muted)` (neutral gray for inactive links)
- `bg-secondary` → `var(--brand-soft)` (light tan background for active/hover)
- `text-secondary-foreground` → `var(--brand-dark)` (dark brown for hover text)
- `bg-background` → `var(--paper)` (off-white page background)
- `border-border` → `var(--line)` (subtle light gray divider)

**Active Link State**: 
- Background: `bg-secondary` (light tan)
- Text: `text-primary` (darker brown)
- Aria-current="page" for semantics

**Hover State** (inactive links):
- Background: `bg-secondary`
- Text: `text-secondary-foreground`
- Transition: 200ms ease

**Components**:
- Uses shadcn `Button` component with `variant="outline"` for sign-out button (consistent with system)
- lucide-react icons (Store, ShoppingCart, Settings, Menu, X) for visual consistency
- No CSS Modules (Phase 2+ architecture uses Tailwind only)

### State Management

**Navbar component**:
- `isMenuOpen` (boolean): Controls mobile dropdown visibility
- `pathname` (from usePathname): Detects current route for active link highlighting
- `user` (from useAuth): Shows/hides navbar content when authenticated

**Mobile dropdown closes on**:
- Clicking any nav link (auto-navigates + closes)
- Clicking sign-out button (after sign-out completes)
- No click-outside close (user explicitly opens/closes via hamburger)

### Accessibility

- Hamburger button: `aria-label` updates per state ("Otvori meni" / "Zatvori meni")
- Hamburger button: `aria-expanded={isMenuOpen}` reflects open/close state
- Nav links: `aria-current="page"` when active (ARIA standard for current page indicator)
- Mobile menu: `id="mobile-menu"` and hamburger `aria-controls="mobile-menu"` (explicit relationship)
- Semantic HTML: `<header>`, `<nav>`, `<Link>` (from Next.js), `<button>` (mouse + keyboard accessible)

### Design Decisions & Rationale

1. **Hamburger over icon-only links** (mobile): Icon-only "Proizvodi" / "Lista" / "Podešavanja" at 320px would overflow or require extreme scaling. Hamburger menu is the industry standard and doesn't sacrifice discoverability.

2. **Sign-out in mobile dropdown** (not persistent button): Sign-out on mobile is destructive and infrequent. Moving it into the dropdown reclaims valuable navbar space (15–20px width) and groups it with other settings, matching mobile app mental model where sign-out lives in Settings tab.

3. **Fixed navbar** (position: fixed, z-index: 50): Persistent navigation improves UX across long pages. Footer navigation (mobile app pattern) isn't viable on desktop. Fixed header with z-index ensures it overlays all content without blocking interaction.

4. **Tailwind semantic classes** (not inline styles): Maintains consistency with Phase 2+ architecture and allows centralized color theme management via globals.css. CSS variables are aliased to Tailwind tokens, enabling both systems to coexist.

5. **Composition over inheritance** (Navbar + NavLink + MobileNavMenu): Each component has a single responsibility. NavLink is reusable in both desktop and mobile contexts. MobileNavMenu is isolated and testable. Navbar orchestrates state but delegates rendering.

### Future Enhancements

- **Active indicator animation**: Subtle underline or scale animation on active link (currently: background + text color change)
- **Dropdown transitions**: Fade-in/slide animation for mobile menu open/close (currently: instant)
- **Keyboard navigation**: Test Tab order through mobile dropdown when open; add focus trap if needed
- **Search/filter links**: If future pages added to nav, consider grouping in secondary menu or mega-menu
- **Notification badge**: Possible future: badge on Lista icon showing item count (design TBD)

---

## Design Direction & Inspiration (Phase 2+)

This section documents the web app's design direction, reference applications, and open design questions. It serves as a brief for "Claude Design" conversations and design review discussions. All decisions here are living — subject to refinement and change as the team reviews reference sites and iterates on UX patterns.

### Product & UX Strategy: Exploration-Focused Browsing

**Core strategic choice**: Cenovnik is designed for **exploration-focused browsing**, not just task-completion utility. Users should be able to casually browse products/prices the way one might browse a social feed — even without a specific shopping goal in mind — and the app should make that pleasant enough to encourage extended session length.

**Business rationale**: Standard (free) tier users see ads; longer engaged sessions directly support ad revenue. Paying subscribers are an alternative monetization path. This makes "time spent browsing comfortably" a legitimate design goal, not scope creep. Engagement time is a real product metric tied to monetization.

**Design implications already identified**:
- **Calmer color palette** (ties to the Option A sage-green refinement documented below) suits sustained casual browsing better than high-urgency bright colors. Muted tones invite lingering; bright greens imply "buy now urgency."
- **Infinite scroll + maximized product-grid real estate** (navbar scroll-collapse hides nav to expand search/grid on scroll) reduces friction to keep scrolling, matching Instagram-feed patterns.
- **Low-friction, easily-reversible interactions** (see "Misclick Safety" principle below) reduce the psychological "cost" of casual interaction, encouraging exploration without fear of mistakes.
- **OpenStreetMap store favoriting** (below) acts as a lightweight engagement hook — favoriting markets is itself an exploratory, low-commitment action that deepens engagement without requiring purchase intent.

**Explicitly future / not yet scoped** (design for extensibility, no concrete plan yet):
- Personalized recommendations based on browsing/list history
- Trending/popular products section
- Social proof elements (e.g., "2,000 people bought this week")

These are directions the user is open to, kept in mind for design flexibility, but not committed roadmap items.

---

### Misclick Safety & Low-Commitment Interaction (Design Principle)

Because browsing is meant to be casual and exploratory, accidental taps must be cheap to undo. No action in the product/list flow should feel risky or hard to reverse.

**Concrete existing pattern**: The quantity-selector interaction (minus/plus/trash buttons) already makes over-incrementing trivially reversible — tap minus once to undo.

**Critical structural safeguard**: There is **no checkout/payment step in the app**. Items only ever go into a **shopping list** for the user's own personal shopping trip; Cenovnik does not process purchases or handle payments. This structurally removes the highest-stakes misclick (accidental purchase) by design. This must be stated plainly so future design/development doesn't accidentally introduce e-commerce-style "buy now" affordances.

---

### Reference Applications

The following live applications serve as design and UX inspiration:

**PRIMARY REFERENCE: Airbnb** ⭐
- Focus: Product browsing, search UX, responsive navbar behavior
- Why chosen: Matches exactly what we want on `/proizvodi` page — navbar with icon + options in center (Proizvodi / Lista / Podešavanja), powerful search, beautiful animation where search bar merges into navbar, product grid layout.
- Key inspiration: The navbar scroll-collapse animation on the search/listings page. As users scroll down, the navbar transitions from "logo — nav links — search/filter controls" to a condensed "logo — search bar — account icon" state. The logo (left) and account controls (right) remain visible; the center space gets reclaimed for search. This pattern maximizes viewport real estate on pages with heavy browsing/scrolling.
- Target implementation: Apply this exact pattern to Cenovnik's `/proizvodi` page. On scroll down, the navbar should collapse to prioritize the search bar; on scroll up or initial page load, it expands to show the full nav.
- **Status**: Primary direction locked in. Proceed with this as the template.

**Color Direction: Option C — Warm Optimistic** ✅ (CHOSEN 2026-08-30)
- **Primary**: `#d97706` (Amber/Orange) — warmth, celebration, energy
- **Secondary**: `#f5f1e8` (Warm Neutral) — approachability, calm
- **Accent**: `#0ea5e9` (Cool Blue) — confidence, interaction feedback
- **Typography**: Geist (geometric sans-serif, modern + friendly)
- **Why chosen**: Feels warm and welcoming without urgency. Amber/orange celebrates savings and deals (not cold fintech blue). Cool blue accent provides confidence and interactive clarity. Best fits the "casual, exploratory browsing" strategy and engagement-focused goals.

**Arc Browser** (secondary aesthetic inspiration)
- Why considered: Feels quite innovative with good transitions. Looks like a 2026 site — the design language and interaction polish appeal for the overall web app aesthetic.
- Use case: Reference for modern, polished micro-interactions and transition timing.
- Status: Informational; not prescriptive.

**Wolt** (pattern reference — quantity selector)
- Why considered: Design feels too playful/game-like for a serious price-comparison app, so NOT the overall reference. However, one specific interaction pattern from Wolt is worth adopting: the quantity selector for cart items (see "Cart Quantity Selector Pattern" section below).
- Status: One pattern adopted (see below); overall aesthetic not carried forward.

**Reference Apps — Not Selected (Rationale)**:
- **Revolut**: Feels more appropriate for landing page redesign if we do one; too fintech-focused for grocery price comparison.
- **Stripe**: Too minimalist and plain; doesn't convey the personality we want.
- **Amazon**: Too basic; just transactional, doesn't match our UX goals.
- **Figma & Notion**: Both okay for landing page and marketing materials; more inspiration than core app reference.

**Final Reference Direction**:
- **Primary**: Airbnb (navbar + browsing UX)
- **Secondary aesthetic**: Arc Browser (polish + transitions)
- **Specific pattern**: Wolt quantity selector (cart interaction detail)

This combination gives us: serious, usable design (Airbnb) + modern polish (Arc) + delightful cart interaction (Wolt pattern).

### Navbar Scroll-Behavior Collapse (Planned Enhancement)

**Current state**: The Navbar (documented above) is static — it does not change on scroll.

**Target behavior** (inspired by Airbnb):
- **Desktop/tablet (≥640px)**: On scroll down, hide the center nav links (Proizvodi / Lista / Podešavanja) to reveal an expanded search bar. Keep the logo (left) and account actions (right) always visible.
- **Mobile (<640px)**: Hamburger menu icon behavior unchanged; consider if search bar expansion is needed or if the navbar simply gets out of the way via scroll-hide pattern (not yet decided).

**Rationale**: Browsing product listings is the primary use case; search is more important than top-level nav links on this page. The collapse frees ~200px of navbar space for search input, improving discoverability of filtering options and reducing context-switching.

**Timeline**: Planned after product detail pages and store selection UI (Phase 2, Step 5+). Not a blocker for current work.

### List Quantity Selector Pattern (Wolt-Inspired, Planned for Phase 2 Step 4)

**Pattern Overview**: A smooth, delightful way to adjust product quantities in the shopping list without requiring modal/page navigation.

**Interaction Flow**:

1. **Collapsed state** (product already in list): The product card shows the quantity as a simple number in a rounded badge (e.g., "2") in the top-right corner. User can continue browsing.

2. **Expanded state** (on tap/click): The badge animates to reveal minus (−) and plus (+) buttons on either side of the number, plus a trash/delete icon. This gives the user a compact control bar for:
   - **Decrease quantity**: Tap minus (−) to reduce quantity by 1. If quantity reaches 0, remove from list.
   - **Increase quantity**: Tap plus (+) to increase quantity by 1.
   - **Remove from list**: Tap trash icon to delete the item entirely.

3. **Collapse back**: Tapping elsewhere on the product card or anywhere on the page collapses the controls back to the badge number.

**Rationale**:
- **Immediate feedback**: Users see item count right on the product card without opening a modal or sidebar.
- **Smooth interaction**: The animation (number → controls) provides visual delight and clarifies that this is an interactive element.
- **Friction reduction**: Add to list, adjust quantity, all from the browse grid. No modal/page hop needed.
- **Low cognitive load**: Controls appear on demand; the default state is clean and simple.

**Technical Details**:
- Quantity badge styling: rounded pill-shaped container (e.g., `rounded-full`, `bg-secondary`, `text-primary`), positioned absolute top-right of product card.
- Expanded control bar: flex row with minus-number-plus-delete, animated appearance (scale or fade-in), positioned over the badge.
- Animation timing: ~200ms ease for smooth expansion/collapse (consistent with project's `--transition-base`).
- States: collapsed (badge only) ↔ expanded (full controls). Tap outside to collapse.

**Implementation Priority**: Phase 2, Step 4 (after product detail page, before advanced filtering). This pattern is valuable enough to prioritize after core product pages are done.

**Future Extensions**:
- Estimated price update as quantity changes (real-time total shown on the card or in cart sidebar).
- Favorite/bookmark icon on the card (separate from quantity controls).
- Add to list selector (if multi-list is already implemented — user picks which list without leaving the grid).

---

### Shopping List UX (Partially Resolved + Open Questions)

**Resolved**: The Wolt quantity-selector pattern (above) handles the "adjust items in list while browsing" experience elegantly. This removes one layer of friction — users no longer need a modal/sidebar just to change quantity.

**Still Open**: How should users **view and manage the full shopping list** while browsing? The quantity badge on product cards is great for adding/adjusting, but doesn't show the complete list, totals, or multi-list management.

**Options Under Consideration**:

1. **Modal drawer** — clicking a list icon (navbar or product card) opens a modal showing the full shopping list. Product grid remains visible behind the modal (semi-transparent overlay). User can see items, totals, and manage multi-list selector. Closes to return to browsing.

2. **Persistent side panel** — a right-hand drawer stays open while browsing. Product grid shrinks to accommodate. User can see full list and switch between lists without disrupting browsing. Mobile: collapses or becomes a modal to preserve space.

3. **Dedicated page only** — a separate `/lista` page shows the full list with edit/manage controls. Users tap a navbar link or list icon to go to the page, manage, then return to `/proizvodi`. Simpler initial implementation but requires navigation away from the grid.

**Open questions**:
- Placement in navbar: Should a list icon live in the navbar (next to other nav items on desktop, in the mobile dropdown)? Or remain a dedicated page link like it currently is?
- Default list behavior: When adding an item via the quantity selector, does it go to the active/default list automatically, or does the user pick the list first?
- Multi-list selector: If the user has 5 shopping lists, how do they switch the active list while browsing? Dropdown in the modal/panel? Navbar dropdown? Separate management page?
- List total visibility: Should the navbar show a list badge with item count and/or total price, updated in real-time as the user adjusts quantities?

**Constraint**: Whatever pattern is chosen must support the multi-list paradigm: one list is active/default (items go there via quantity selector unless user changes it), and users can explicitly add items to other lists with extra interaction.

**Important note on consistency**: The app already has an existing shopping-list view at `lista/{token}` (public shared lists, accessible without login), rendering via the `SharedListView` component. Whichever full-list view pattern is chosen for the authenticated `/lista` experience (modal, panel, or dedicated page) should maintain visual and interaction consistency with this existing shared-list view where practical. Both views serve users managing shopping lists; ideally they don't feel like completely separate UI patterns.

**Next step**: After deciding on the full-list view pattern (modal, panel, or page), return to the color palette / animations review to finalize the overall aesthetic, then hand off to Claude Design for prototyping.

### Multi-List Support (Hard Requirement)

The product roadmap includes support for multiple shopping lists per user. This affects all list UX design:

- **Active list**: One list per session is marked as the default. Items added while browsing (via the quantity selector) go to this list by default.
- **Switching lists**: Users can explicitly switch the active list via a dropdown/selector in the navbar, on the list page, or in the list modal/panel.
- **Adding to other lists**: From the list UI, users can pick a different list for individual items or batch-add to a specific list (exact UX TBD).
- **Design implication**: The list icon should reflect the active list (or offer a way to see/switch quickly), not assume a single flat list.

### Animations & Transitions (Open Question)

**Current thinking**: Micro-interactions and animations are valuable for perceived performance and delight, but unclear where they best fit in the authenticated web app.

- **Candidates for animation**: Navbar scroll-collapse (above), search result transitions, active nav link indicators, list item add/remove (success feedback).
- **Landing/marketing page**: Animation treatment will be richer when the landing page is refactored (not in scope for authenticated-app work currently).
- **Questions**: Should we prioritize polish animations now, or defer until core features are complete? Are there specific interactions that feel sluggish without animation?

This is flagged as a design-review discussion point rather than a locked decision.

### Color Palette & Typography (Open for Revision)

**Current state** (documented in the Navbar Architecture section):
- **Palette**: Warm brown/tan primary (`var(--brand)`, oklch(0.5136 0.0877 37.00)), with soft secondary and dark accents. Chosen to evoke earth tones and approachability (groceries, savings).
- **Typography**: Work Sans (400–800 weights) for all text. Chosen for neutrality and readability.

**Status: NOT locked in.**

Context worth noting:
- **Cost of change is low**: The web app currently has ~10–20 users on the iOS mobile app. A redesigned color palette and typography for web will not disrupt existing users significantly.
- **Web leads, mobile follows**: The web app redesign is *intended* to be the design reference for future mobile versions. Whatever palette/typography direction is chosen for web is expected to become the standard that both iOS (via a redesign) and the future Android app adopt — *not the reverse* (i.e., we are not locked to the current mobile app's aesthetics).
- **Stakeholder openness**: The co-founder has agreed that changing the palette and typography is on the table if the team identifies something that better conveys "product price comparison" and "smart savings" than the current warm-earth aesthetic.

**Design considerations for review**:
- What color palette best communicates a budget/savings use case? (e.g., fintech apps like Revolut use cool blues; price-comparison sites use bold accent colors; grocery chains use warm/natural tones)
- Does the current Work Sans choice feel friendly and approachable, or should a different sans-serif be considered? (e.g., Inter for modern minimalism, Poppins for playfulness, Geist for tech-forward feel)
- Should the palette tie to a specific category (fintech, retail, productivity) or stay neutral and let the *product* define the identity?

This is an open design-direction conversation, not a settled choice.

### Status & Next Steps

This section is a **living design brief**, not a locked spec. The next phase of work involves:

1. **Reference site review**: User to examine Airbnb's navbar behavior, Wolt's list management, and candidate apps in depth; provide feedback on what feels right for Cenovnik.
2. **Design refinement**: Based on feedback, refine the open questions (cart UX pattern, color/typography direction, animation strategy).
3. **Claude Design handoff**: Once clear direction emerges, export this section + design system tokens via `/design-sync` to Claude Design for prototyping and iteration.
4. **Implementation**: After design approval in Claude Design, return to Claude Code to build.

All of the above is subject to change as the team gathers feedback and explores alternatives.

### Color Palettes & Typography (Documented Options)

Three color palette directions were explored and documented. Use this section as a reference if the team revisits the color direction in the future.

**CHOSEN: Option A — Green + Neutral + Gold** ✅

*Emotion: "Smart savings, healthy choices, fresh & natural"*

- **Primary**: `#2ea853` (Fresh Green) — growth, organic, nature, savings
- **Secondary**: `#f5f1e8` (Warm Neutral) — approachability, calm, background
- **Accent**: `#f59e0b` (Gold) — optimism, value, celebration of deals found
- **Typography**: Geist (geometric sans-serif, modern + friendly)
- **Why chosen**: Immediately communicates grocery/savings without coldness. Green says "smart choice"; gold celebrates the savings. Geist feels 2026 and modern while staying approachable.
- **Brand feeling**: "I'm making intelligent, healthy choices that save me money, and this app makes it easy and delightful."

**Refinement under consideration (within Option A)**:
- User is exploring whether a more muted/pastel sage-green fits better than the current bright `#2ea853`. Reference swatches for comparison: `#70845F` (deep sage/olive) or `#A1A67C` (lighter olive/sage tone).
- Also exploring a pastel cream neutral in place of the current `#f5f1e8` (which is already warm but may not be pastel enough) — reference: `#FFEDD0` (soft cream/peach).
- Two alternate accent tones from the same reference palette are noted as possibilities to compare against the current gold `#f59e0b`: `#DA864D` (warm terracotta/rust) or `#CA643C` (deeper rust/burnt orange).
- **Status**: Open refinement question, not finalized. Goal is to verify whether these more pastel/muted tones better convey the "smart savings, fresh, natural" emotional direction than the currently more saturated colors, before locking in final hex values.
- **Next step**: Update the color-palette Artifact with a visual comparison showing Option A with both the current bright green and the muted-sage variant side by side, so the user can assess directly.

**Alternative Option B — Blue + Green + Gold**

*Emotion: "Trust, growth, optimism, intelligent savings"*

- **Primary**: `#0ea5e9` (Sky Blue) — trust, reliability, stability
- **Secondary**: `#22c55e` (Fresh Green) — savings, growth, health
- **Accent**: `#f59e0b` (Gold) — celebration, value, deals
- **Similar to**: Revolut, Stripe, modern fintech
- **Why not chosen now**: Less grocery-focused; leans toward fintech aesthetic. Kept as option if repositioning toward "financial wellness" in future.

**Alternative Option C — Warm Optimistic**

*Emotion: "Warmth, celebration, ease, approachable confidence"*

- **Primary**: `#d97706` (Amber/Orange) — warmth, celebration, energy
- **Secondary**: `#f5f1e8` (Warm Neutral) — approachability, calm
- **Accent**: `#0ea5e9` (Cool Blue) — confidence, interaction feedback
- **Why not chosen now**: Similar warmth to current palette; Option A feels fresher and more differentiated. Kept as option if team wants to stay in warm tones but add more energy.

**Reference**: Interactive visual palette explorer: [Cenovnik Color Palettes](https://claude.ai/code/artifact/3eb7cb97-f93e-45a9-9cc4-05ffca375159) (shows all three with UI examples, buttons, badges, product cards in context).

---

## Features for Claude Design Brief (Phase 2+)

This section captures the features that need visual design and interaction patterns. It will be exported to Claude Design as part of the design handoff.

### Feature Scope

**Web app design target**: All features currently live in the Cenovnik mobile app (iOS), plus web-specific UX enhancements.

**Current constraints**:
- Shopping lists: Single list per user (not yet multi-list; premium feature planned for future)
- Maps & store discovery: **OpenStreetMap** integration (chosen near-term approach) for exploring nearby markets. Flow: user explores nearby markets on map → selects favorite markets → product search/browsing then shows prices scoped to those favorite markets.
- Real-time updates: Supabase Realtime subscriptions for shared list collaboration

### Feature List (To Be Expanded)

#### Core Features (Already Prototyped/In Build)

1. **Product Browsing & Search** (`/proizvodi`)
   - Product grid with responsive layout (2 cols mobile → 8 cols ultra-wide)
   - Search bar with debounced live results
   - Infinite scroll pagination
   - Product cards with: image, name, price, store availability
   - **List interaction**: Wolt-inspired quantity selector (collapsed badge → expands to minus/plus/trash on tap)
   - **Navbar behavior**: Airbnb-style scroll-collapse (navbar condenses on scroll to prioritize search bar)
   - Filter/sort controls (TBD exact placement; possibly in search bar or sidebar)

2. **Product Detail Page** (`/proizvodi/[id]`)
   - Full product info: image, name, description, category
   - Prices across stores (table or card layout)
   - Store logos and "Shop at X" links
   - Add to list button/control
   - Related products or similar items
   - **Design needed**: Card/modal layout, store comparison table layout

3. **Shopping List Experience** (`/lista` — page or modal UX TBD)
   - **Note**: The format for the authenticated shopping list experience (dedicated page vs. modal drawer) is NOT yet decided. Both remain open options per the earlier "Shopping List / Cart UX" design-question section. The design brief should address both possibilities or explicitly choose one with rationale.
   - View active shopping list items
   - Quantity controls (similar to Wolt pattern; inline adjust or modal)
   - Item price and subtotal
   - **Add to list flow** (from product page): Modal or inline controls
   - **Full list management**: View total, remove items, clear list
   - **Multi-list future**: Selector to pick which list (for now, just the default list; layout should support selector addition)
   - **Real-time sync**: Items update in real-time if shared or edited on mobile
   - **Existing shared-list feature**: Mobile-created lists can be shared via link and opened by anyone (including unauthenticated users) in the browser at `lista/{token}` — already implemented at `app/lista/[token]/page.tsx` (outside the `(authenticated)` route group), rendering via the `SharedListView` component, backed by `app/api/lista/[token]/route.ts`. **Important**: Whichever UX pattern is chosen for the authenticated `/lista` experience (page or modal), it should be designed with awareness of this existing public shared-list view, and visual/interaction pattern consistency between the two should be maintained where practical, so the product doesn't present two completely divergent shopping-list interfaces.
   - **Design needed**: List layout, totals presentation, empty state, and a decision on page vs. modal format

4. **Store/Market Selection** (`/prodavnice`)
   - List of available stores/markets nearby
   - User's preferred stores (favorites/filters)
   - **OpenStreetMap integration**: Show user location and nearby stores on map (see "Product & UX Strategy" section — favoriting markets is a lightweight engagement hook that keeps users browsing)
   - Filter by store type (supermarket, discount, organic, etc.)
   - Toggle store preferences (affects product prices shown in product search and browse)
   - **Design needed**: Map view, store card layout, location permission flow

5. **Settings/Account Page** (`/podesavanja`)
   - User profile info (name, email, avatar)
   - Preferred stores (linked from market selection)
   - Notification preferences (TBD)
   - Sign-out control
   - **Future**: Premium subscription status
   - **Design needed**: Settings card/form layout, toggle switches

#### Navigation & Global Elements

1. **Navbar** (all authenticated pages)
   - Logo/brand mark (left)
   - Nav links: Proizvodi / Lista / Podešavanja (center, on desktop)
   - Account icon / sign-out (right, desktop); hamburger menu (right, mobile)
   - Scroll-collapse behavior: center links hide on scroll, search bar expands (Airbnb pattern)
   - List badge: shows item count in active list (real-time)
   - **Design notes**: Already implemented in code; scroll-behavior animation is Phase 2 Step 5+ enhancement

2. **Search Bar** (primarily on `/proizvodi`, possibly global in navbar)
   - Text input with debounced live results
   - Search results dropdown/modal with product preview
   - Filters/sort options
   - Recent searches or popular searches (TBD)
   - **Design needed**: Dropdown styling, result card layout, filter controls

#### Not Yet Scoped (Future)

- Shared list collaboration (real-time, invite links)
- Premium subscriptions & multi-list feature
- Push notifications for price drops
- Recipe/meal planning (if ever added)
- User reviews or ratings (if ever added)

---

### Design Handoff Checklist

Before exporting to Claude Design, confirm:
- [ ] All feature descriptions include user flow and interaction points
- [ ] Color palette (Option A) applied to component sketches
- [ ] Geist typography locked in (weights: 400, 500, 600, 700 minimum)
- [ ] Responsive breakpoints defined: 320px (mobile), 640px (tablet), 1024px (desktop), 1920px (ultra-wide)
- [ ] Accessibility notes: WCAG AA contrast, keyboard navigation, ARIA labels
- [ ] Micro-interactions documented: cart badge animation, scroll-collapse, quantity selector expand/collapse
- [ ] Icon set choice confirmed (currently lucide-react; visual alignment with Geist typeface)
- [ ] Component library established (shadcn/ui components already integrated; new designs should reference existing controls where possible)

---

## Claude Design Handoff Brief

### Design System Specifications

**Color Palette** (LOCKED):
- **Primary**: `#70845F` (Deep Sage Green) — buttons, links, active states, primary CTAs
- **Secondary**: `#FFEDD0` (Soft Cream/Peach) — backgrounds, card containers, neutral spaces
- **Accent**: `#DA864D` (Warm Terracotta) — highlights, success states, deal badges, secondary CTAs
- **Neutrals**: `#1a1a1a` (ink/text), `#666` (muted text), `#e0e0e0` (borders), `#f8f8f8` (subtle bg)
- **Typography**: Geist (weights: 400, 500, 600, 700 minimum; fallback: system sans-serif)

**Responsive Breakpoints**:
- Mobile: 320px–639px (hamburger menu, full-width components)
- Tablet: 640px–1023px (inline nav, 2-col grids)
- Desktop: 1024px–1919px (nav links visible, 4-col grids)
- Ultra-wide: 1920px+ (8-col grids, centered max-width container ~1280px)

### User Flows & Interaction Points

#### 1. Product Browsing Flow (Core Loop)

**Entry**: User lands on `/proizvodi` or taps "Proizvodi" in navbar.

**Flow**:
1. **Navbar**: Shows logo (left) + nav links (center, hidden on scroll-down) + list badge (right, always visible)
   - On scroll down: nav links fade/slide out, search bar expands to reclaim center space (Airbnb pattern)
   - On scroll up: nav links fade/slide back in, search bar normalizes
   - List badge shows current item count, always clickable to open list view

2. **Search Bar** (primary interaction point):
   - Placeholder text: "Search products, stores, deals..."
   - Debounced ~400ms live results as user types
   - Search dropdown appears below input, showing results (product cards, max 8-10 visible, scroll to see more)
   - Search results show product image (thumb), name, price (highlighted in accent color), store logos

3. **Product Grid**:
   - Infinite scroll: as user scrolls to bottom, load next page (~20 products per page)
   - Each card is clickable (links to product detail page)
   - Quantity badge in top-right corner (see interaction point #4 below)

4. **List Quantity Selector** (Wolt-inspired, friction-reducing interaction):
   - **Collapsed state**: Badge shows quantity number (e.g., "2") in top-right corner
     - If no item in list: no badge visible
     - If item in list: badge visible, rounded pill shape, background color = primary (`#70845F`), text = secondary (`#FFEDD0`)
   - **Interaction**: Tap badge → expands with animation (scale/fade-in, ~200ms)
   - **Expanded state**: Badge expands to reveal minus (−) | number | plus (+) | trash (🗑) buttons in a flex row
     - Minus: tap to decrement, if count reaches 0, item removed from list (badge disappears)
     - Plus: tap to increment, adds 1 to count
     - Trash: tap to remove entirely
   - **Collapse**: Tap outside badge OR tap item card again → badge collapses back to number, smooth animation
   - **Misclick safety**: User can tap minus once to undo accidental increment; no purchase confirmation needed

5. **Continued Browsing**: User scrolls, searches, or taps product cards to explore. Quantity selector stays low-friction for casual adding/adjusting.

---

#### 2. Product Detail Page (`/proizvodi/[id]`)

**Entry**: User taps a product card from grid or search results.

**Flow**:
1. **Header**: Large product image (full width, responsive)
2. **Product Info**: Name, category, description, nutritional info (if available)
3. **Prices Table**: Shows price by store
   - Columns: Store logo | Store name | Price | Availability
   - Prices highlighted in accent color (`#DA864D`)
4. **Add to List**: Button (primary color `#70845F`) appears prominently
   - Tap → adds to default active list
   - If list already has item: updates quantity via quantity selector (same Wolt pattern)
5. **Back/Navigation**: Back arrow or breadcrumb to return to browsing

---

#### 3. Shopping List View (`/lista` — page or modal, TBD)

**Entry**: User taps list badge in navbar OR "Lista" nav link.

**Flow** (if modal):
1. **Modal Overlay**: Semi-transparent overlay behind modal, allows scrolling product grid behind
2. **List Panel**: Right-side or center modal, showing:
   - **Header**: "Your Shopping List" + active list name + close button (X)
   - **List Items**: Each item shows:
     - Product image (thumb)
     - Product name
     - Quantity (same Wolt selector pattern: tap badge to expand/collapse)
     - Price per item + total for that item
     - Delete icon (trash, right-aligned)
   - **List Total**: At bottom, "Total: $XX.XX" (sum of all item totals)
   - **Multi-list Selector** (if multiple lists exist): Dropdown or selector showing active list + option to switch
   - **Clear List Button**: Empties all items (confirmation optional, TBD)
   - **Continue Shopping Button**: Closes modal, returns focus to product grid

**Flow** (if dedicated page `/lista`):
1. **Same content as above**, but as a full page instead of modal
2. **Return to Browse**: Back button or "Continue Shopping" link returns to `/proizvodi`

**Consistency note**: Existing public shared-list view (`lista/{token}`, no login) uses similar layout — maintain visual/interaction parity so users don't feel disoriented switching between authenticated and shared contexts.

---

#### 4. Store/Market Selection (`/prodavnice`)

**Entry**: User taps "Store Preferences" or sees a "Select Nearby Markets" call-to-action.

**Flow**:
1. **Map View** (OpenStreetMap):
   - Shows user's current location (blue dot/marker)
   - Nearby markets/stores displayed as pins (color = primary `#70845F`)
   - Tap marker → opens store card with info (name, type, address, hours)

2. **Store List** (alternative view, scrollable):
   - Toggles between map and list view
   - Each store shows name, type badge (e.g., "Supermarket", "Discount", "Organic"), distance from user
   - Toggle switch next to each store to add/remove from favorites

3. **Interaction**: 
   - Tap store → toggles favorite status (visual feedback: store highlights, color shifts to accent `#DA864D`)
   - Once user selects favorite markets, product prices shown in browse/search are scoped to those markets (lightweight engagement hook)

4. **Confirmation**: "3 markets selected" badge appears in navbar or at top of market selection view

---

#### 5. Navbar Interactions (All Pages)

**Desktop (`≥640px`)**:
- Logo (left, always visible, links to `/`)
- Nav links (center): Proizvodi | Lista | Podešavanja (text + icon, color = primary `#70845F`, hover = accent `#DA864D`)
  - Active link: background = secondary (`#FFEDD0`), text = primary
- List badge (right, always visible): shows item count, tappable
- Account menu (right, after badge): opens dropdown with settings/sign-out options

**Mobile (`<640px`)**:
- Logo (left)
- Hamburger menu icon (right, tap to toggle)
- When hamburger open: dropdown panel slides down, showing nav links + sign-out

**Scroll Collapse** (Airbnb pattern, `/proizvodi` page):
- On scroll down: nav links fade out, search bar expands to center (freed space = ~200px)
- On scroll up: nav links fade back in, search bar normalizes
- List badge always stays visible
- Smooth animation, ~300ms transition

---

#### 6. Edge Cases & Interactions

**Misclick Recovery**:
- Adding item by accident: tap minus button once (in expanded quantity selector) to undo
- No confirmation dialogs anywhere — all actions are reversible

**Empty States**:
- No items in list: "Your list is empty. Start adding products!" + link to "Browse Products"
- No search results: "No products found. Try a different search." + suggestions

**Real-time Updates**:
- If user adds item to list while viewing product detail: badge appears and updates
- List totals update in real-time as user adjusts quantities

**Multi-list Handling** (future, but design for extensibility):
- Default list is active; user can switch via dropdown in list modal
- Adding item while list is not active: prompts to select which list, or defaults to active list

---

### Design Deliverables Needed

1. **Component Library**: Button, Badge, Card, Modal, Navbar, SearchBar, QuantitySelector
2. **Page Templates**: `/proizvodi` (browse + navbar collapse), `/proizvodi/[id]` (detail), `/lista` (list modal or page), `/prodavnice` (map + list)
3. **Responsive Frames**: 320px, 640px, 1024px, 1920px
4. **Interaction Specs**: Animations (scroll-collapse, badge expand/collapse, hover states), transition timings
5. **Accessibility Specs**: Color contrast verification (WCAG AA), keyboard navigation (Tab order, Enter = select, Escape = close modals), ARIA labels
6. **Design System**: Color tokens, typography scale, spacing scale (8px grid), border radius, shadows

---

### Notes for Designer

- **Exploration focus**: Design should invite lingering. Avoid high-contrast urgency — the sage-green + cream + terracotta palette is muted and calming on purpose.
- **Low friction**: Every interaction should feel effortless (Wolt quantity selector, scroll-collapse reveal, easy market toggling).
- **No purchase psychology**: This is NOT an e-commerce design — no "Buy Now", no checkout, no payment-flow affordances. Items go to a personal shopping list only.
- **Consistent patterns**: Reuse the quantity selector everywhere items can be adjusted; reuse card layouts; keep navbar behavior consistent.
- **Responsive-first**: Design mobile (320px) first, then expand. Every breakpoint should feel native, not squeezed.

---

**Last Updated**: 2026-08-30 (Phase 2, Step 3 complete — Design Direction + UX Strategy finalized. Exploration-focused browsing documented as core strategy (casual feed-like browsing for engagement/ad-revenue). Misclick-safety principle formalized. Cart→List terminology corrected throughout (no e-commerce checkout flow; items only go to personal shopping list). OpenStreetMap confirmed as near-term maps approach with favorite-market price-scoping flow. Wolt quantity-selector pattern locked for Phase 2 Step 4. Color Palette Option A (Green + Neutral + Gold) + Geist typography + pastel refinement options documented. Design ready for Claude Design handoff.)
**Author**: Dusan Marjanski
