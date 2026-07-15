# eCenovnik web

Web prikaz lista za kupovinu podeljenih iz eCenovnik mobilne aplikacije.

Podeljeni linkovi koriste rutu:

```text
https://www.ecenovnik.app/lista/:shareToken
```

## Lokalni razvoj

Supabase podešavanja su u lokalnom `.env.local` fajlu (fajl se ne komituje):

```text
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Pokrenite aplikaciju sa:

```bash
npm install
npm run dev
```

## Supabase dozvole

Pre prvog javnog korišćenja pokrenite sadržaj fajla
`supabase/public_shopping_lists.sql` u Supabase SQL editoru. Pravila daju
anonimnom korisniku read-only pristup isključivo listama sa aktivnim
`share_token` poljem i proizvodima koji pripadaju tim listama.

## Provera

```bash
npm run build
```
