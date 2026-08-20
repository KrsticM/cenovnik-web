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
   - Track key events (search, add to cart, share list)

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
- `products`: id, name, barcode, category, image_url, created_at
- `retailers`: id, name, logo_url, url
- `product_prices`: product_id, retailer_id, price, last_updated
- `auth.users`: Supabase managed (email, uid, etc.)
- `user_stores`: user_id, store_id (many-to-many user preferences)
- `shopping_lists`: id, user_id, name, created_at, updated_at
- `shopping_list_items`: id, list_id, product_id, quantity, added_at
- `share_tokens`: id, list_id, token, created_at, expires_at
- `app_config`: min_version, store_urls (version gating)

**New for web** (optional):
- None initially; reuse mobile schema
- Consider `web_sessions` table if adding analytics
- Consider `feature_flags` table for A/B testing

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

### Phase 2: Core Product Browsing ⏳
- [ ] Product service layer (Supabase queries)
- [ ] Home/products page with grid
- [ ] Search with infinite scroll
- [ ] Product detail page
- [ ] Store selection UI
- [ ] Styling & responsive design
- **Target Start**: 2026-08-20
- **Target End**: 2026-09-02
- **Prerequisites**: ✅ Phase 1 auth (email OTP) complete, ✅ Realtime subscriptions working, ⏳ OAuth needs Supabase provider config (Google Web Client ID + Apple Services ID — external setup, not code)

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
- **Code style**: Use CSS modules for components (not inline Tailwind); follow Uncle Bob's DRY principle
- **Component structure**: Each component gets its own folder with .tsx and .module.css
- **Architecture**: Industry-standard patterns (composition over inheritance, single responsibility)
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

**Last Updated**: 2026-08-18 (Phase 1, Step 9 — SharedListView refactoring & architecture polish, complete)
**Author**: Dusan Marjanski
