# eCenovnik web

Puna web verzija eCenovnik aplikacije — web prikaz lista za kupovinu podeljenih iz mobilne aplikacije, plus prikaz proizvoda, upravljanje listama, poređenje cena, i korisnički nalozi.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind v4 + plain CSS (custom properties)
- **Deployment**: Vercel

## Lokalni razvoj

Supabase podešavanja su u lokalnom `.env.local` fajlu (fajl se ne komituje):

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Pokrenite aplikaciju sa:

```bash
npm install
npm run dev
```

Aplikacija će biti dostupna na `http://localhost:3000`.

## Supabase dozvole

Pre prvog javnog korišćenja pokrenite sadržaj fajla
`supabase/public_shopping_lists.sql` u Supabase SQL editoru. Pravila daju
anonimnom korisniku read-only pristup isključivo listama sa aktivnim
`share_token` poljem i proizvodima koji pripadaju tim listama.

## Build & Deployment

```bash
npm run build
```

Aplikacija je postavljena na Vercel. Svaki push na `main` grani se automatski deploy-uje.
