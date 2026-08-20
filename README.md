# eCenovnik web

Web verzija eCenovnik aplikacije sa parittetom funkcionalnosti sa mobilnom aplikacijom. Korisnici mogu pregledati proizvode, kreirat i upravljati listama za kupovinu, deliti liste, i porediti cene na različitim prodavnicama — sve u realnom vremenu.

## Status

✅ **Phase 1 (Auth)**: Email OTP sign-in fully implemented and tested end-to-end  
✅ **Phase 1 (Routing & Lists)**: Auth middleware, shared list page sa Realtime sinhronizacijom  
⏳ **Phase 2 (Product Browsing)**: Product grid, search, detail page  
⏳ **OAuth Setup Blocker**: Google Web Client ID and Apple Services ID must be configured in Supabase dashboard before OAuth flows work

Za detalje, pogledajte `CLAUDE.md` i `CONTEXT.md`.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Backend**: Supabase (PostgreSQL, Auth, Realtime sa postgres_changes listeners)
- **Styling**: Tailwind CSS v4 + CSS Modules (DRY, component-scoped)
- **Deployment**: Vercel (auto-deploy na push na `main`)
- **State Management**: React Context (AuthContext, future: TanStack Query za data fetching)

## Karakteristike

✅ **Autentifikacija**: Email OTP + OAuth (Google, Apple) — Supabase Auth  
✅ **Deljene liste**: Stranica `/lista/[token]` sa Realtime sinhronizacijom — WebSocket push updates  
✅ **Navbar**: Fixed sticky header sa brand logo i sign-out dugme (za authentificirane korisnike)  
✅ **Responsive Design**: Mobile-first layout (320px–1920px) — CSS Modules + Tailwind  
⏳ **Product Browsing**: Grid, search, filter po prodavnicama (Phase 2)  
⏳ **Shopping Lists**: Kreiranje, uređivanje, brisanje, poređenje cena (Phase 3)  
⏳ **Settings**: Upravljanje korisničkim naloglom i preferencama (Phase 4)

## Lokalni razvoj

### Setup

Supabase podešavanja:
```bash
# .env.local (ne komitovati)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Pokretanje

```bash
npm install
npm run dev
```

Aplikacija će biti dostupna na `http://localhost:3000`.

**Autentifikacija**: Koristi `/prijava` za login. Kada se uloguješ, vidiš `/proizvodi` placeholder (Phase 2 će biti product grid).  
**Deljene liste**: Koristi `/lista/{share_token}` (dostupno bez autentifikacije, ako je token validan).

## Supabase RLS politike

Pre prvog javnog korišćenja pokrenite:
```sql
-- supabase/public_shopping_lists.sql
-- Daje anonimnom korisniku read-only pristup deljenim listama
```

Pokrenite kroz Supabase SQL editor. Politike osiguravaju da unauthentificirani korisnici mogu videti samo liste sa `share_token` poljem.

## Build & Deployment

### Production Build

```bash
npm run build  # Proverava TypeScript i kreira optimizovani build
npm run dev    # Pokreće dev server sa hot reload
```

### Deployment

Aplikacija je hostovana na Vercel. Svaki push na `main` grani se automatski deploy-uje na `web.ecenovnik.app`.

**Branch deployments**: Push na drugi branch → Vercel kreira preview URL (npr. `lista-za-kupovinu-auto-refresh--cenovnik-web.vercel.app`).

## Arhitektura

**Client**: Next.js 16 sa App Router (React Server Components + Client Components)  
**Database**: Supabase PostgreSQL sa Realtime pubsub (`postgres_changes`)  
**Auth**: Supabase Auth (email OTP, OAuth)  
**RLS**: Row-Level Security politike na `shopping_lists`, `shopping_list_items`, `products`  

Nema API gateway-a — klijent direktno koristi Supabase client biblioteke sa RLS zaštitom.

## Development Notes

Pogledajte `CLAUDE.md` za:
- Detaljnu roadmap (6 faza do launchanja)
- Arhitekturalne odluke
- Component guidelines (CSS Modules, dumb components, SRP)
- Development preferences (commit message style, responsive design requirements)
