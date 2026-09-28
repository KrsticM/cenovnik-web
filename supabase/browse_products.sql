-- Product browse/search for the web app (Proizvodi page).
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Provides:
--   * browse_products(...)        one page of products with the cheapest price in scope,
--                                 filtered, sorted and keyset-paginated server-side
--   * browse_products_count(...)  the same filters, counted up to 1001 (UI shows "1.000+")
--   * browse_products_matches(...) shared filter step used by both
--   * product_price_summary       cheapest price per product across all markets
--   * refresh_product_price_summary()  call after each daily price import (service role)

-- 1. Extensions (Supabase keeps them in the "extensions" schema) -----------------------------

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- Cleanup from earlier drafts (no-ops if they never existed):
--  * the old expression index depends on f_search_normalize, so drop it before redefining it;
--  * an extra index on the ~7.7M-row current_prices table would slow every daily import.
drop index if exists public.products_name_search_trgm_idx;
drop index if exists public.current_prices_store_product_idx;

-- unaccent() is only STABLE; an IMMUTABLE wrapper lets it back a stored column and index.
-- No SET clause on purpose: SET makes SQL functions non-inlinable (a per-row call with
-- settings save/restore). Every name inside is schema-qualified instead.
create or replace function public.f_search_normalize(value text)
returns text
language sql
immutable
parallel safe
as $$
  select pg_catalog.lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(value, '')));
$$;

-- 2. Indexes -------------------------------------------------------------------------------

-- Normalised name stored once per product (kept in sync automatically on insert/update),
-- so searches don't normalise ~58k names per query. Trigram index for LIKE '%…%'.
alter table public.products
  add column if not exists search_name text
  generated always as (public.f_search_normalize(product_name)) stored;
create index if not exists products_search_name_trgm_idx
  on public.products
  using gin (search_name extensions.gin_trgm_ops);

-- barcodes had no index on product_id, so every "barcodes of this product" lookup
-- (this function and the app's products?select=barcodes(barcode)) scanned the whole table.
create index if not exists barcodes_product_id_idx
  on public.barcodes (product_id);

-- current_prices (~7.7M rows, rewritten by the daily import) already has
-- PK (product_id, store_id) and current_prices_store_id_idx; no extra index there,
-- to keep imports fast.

-- 3. Cheapest price across all markets (refreshed after each import) -------------------------

-- Building this sorts all current_prices rows once; expect it to take a while on first run.
create materialized view if not exists public.product_price_summary as
select distinct on (cp.product_id)
  cp.product_id,
  coalesce(cp.discounted_price, cp.regular_price) as min_price,
  cp.discounted_price is not null as is_deal
from public.current_prices cp
order by
  cp.product_id,
  coalesce(cp.discounted_price, cp.regular_price) asc,
  (cp.discounted_price is not null) desc
with data;

-- Unique index is required for REFRESH ... CONCURRENTLY (readers are never blocked).
create unique index if not exists product_price_summary_product_idx
  on public.product_price_summary (product_id);
create index if not exists product_price_summary_price_idx
  on public.product_price_summary (min_price);

grant select on public.product_price_summary to authenticated;

create or replace function public.refresh_product_price_summary()
returns void
language sql
security definer
set search_path = ''
as $$
  refresh materialized view concurrently public.product_price_summary;
$$;

revoke all on function public.refresh_product_price_summary() from public, anon, authenticated;
grant execute on function public.refresh_product_price_summary() to service_role;

-- 4. Browse / search ------------------------------------------------------------------------
--
-- Scope: p_store_ids = the user's stores ("Samo moji marketi"); null or empty = all markets.
-- Sort:  'relevance' | 'price_asc' | 'price_desc' | 'name'.
--        'relevance' without a query = "Preporučeno": products with an image first,
--        then a stable pseudo-random order per p_seed (so pages never repeat).
-- Keyset pagination: pass the last row's sort_num / sort_text / id as p_after_*.
-- Only products with at least one price in scope are returned.

-- Shared filter step: products with a price in scope that match the query and filters.
create or replace function public.browse_products_matches(
  p_query        text     default null,
  p_store_ids    text[]   default null,
  p_price_min    numeric  default null,
  p_price_max    numeric  default null,
  p_deals_only   boolean  default false
)
returns table (
  id            uuid,
  product_name  text,
  has_image     boolean,
  norm_name     text,
  q             text,
  min_price     numeric,
  is_deal       boolean
)
language sql
stable
security invoker
-- No SET clause: keeps this function inlinable into browse_products / browse_products_count,
-- so their filters, ordering and LIMIT reach the underlying tables.
as $$
  with normalized as (
    select
      nullif(pg_catalog.btrim(pg_catalog.regexp_replace(
        public.f_search_normalize(p_query), '\s+', ' ', 'g')), '') as q
  ),
  params as (
    select
      n.q,
      -- Words of the query; each must appear in the name, in any order.
      pg_catalog.string_to_array(n.q, ' ') as words,
      -- The longest word drives the trigram index; the others are checked on those candidates.
      (select w from pg_catalog.unnest(pg_catalog.string_to_array(n.q, ' ')) w
       order by pg_catalog.length(w) desc limit 1) as anchor,
      pg_catalog.btrim(coalesce(p_query, '')) ~ '^\d{6,}$' as is_barcode,
      coalesce(pg_catalog.array_length(p_store_ids, 1), 0) > 0 as scoped
    from normalized n
  ),
  scoped_prices as (
    -- Hash aggregate (no sort): cheapest price, and whether that cheapest price is a discount.
    select
      cp.product_id,
      min(coalesce(cp.discounted_price, cp.regular_price)) as min_price,
      min(cp.discounted_price) as min_deal_price
    from public.current_prices cp, params
    where params.scoped and cp.store_id = any (p_store_ids)
    group by cp.product_id
  ),
  prices as (
    select
      product_id,
      min_price,
      coalesce(min_deal_price <= min_price, false) as is_deal
    from scoped_prices
    union all
    select s.product_id, s.min_price, s.is_deal
    from public.product_price_summary s, params
    where not params.scoped
  )
  select
    p.id,
    p.product_name,
    p.has_image,
    p.search_name as norm_name,
    params.q,
    pr.min_price,
    pr.is_deal
  from public.products p
  join prices pr on pr.product_id = p.id
  cross join params
  where
    (
      params.q is null
      or (params.is_barcode and exists (
            select 1 from public.barcodes b
            where b.product_id = p.id and b.barcode = trim(p_query)))
      or (not params.is_barcode
          and p.search_name like '%' || params.anchor || '%'
          and not exists (
            select 1 from pg_catalog.unnest(params.words) w
            where p.search_name not like '%' || w || '%'))
    )
    and (p_price_min is null or pr.min_price >= p_price_min)
    and (p_price_max is null or pr.min_price < p_price_max)
    and (not coalesce(p_deals_only, false) or pr.is_deal);
$$;

create or replace function public.browse_products(
  p_query        text     default null,
  p_store_ids    text[]   default null,
  p_price_min    numeric  default null,
  p_price_max    numeric  default null,
  p_deals_only   boolean  default false,
  p_sort         text     default 'relevance',
  p_seed         text     default '',
  p_limit        integer  default 20,
  p_after_num    numeric  default null,
  p_after_text   text     default null,
  p_after_id     uuid     default null
)
returns table (
  id            uuid,
  product_name  text,
  has_image     boolean,
  barcodes      text[],
  min_price     numeric,
  is_deal       boolean,
  sort_num      numeric,
  sort_text     text
)
language sql
stable
security invoker
set search_path = ''
set work_mem = '32MB'
as $$
  with keyed as (
    select
      m.*,
      case p_sort
        when 'price_asc'  then m.min_price
        when 'price_desc' then -m.min_price
        else 0
      end::numeric as k_num,
      case
        when p_sort in ('price_asc', 'price_desc') then ''
        when p_sort = 'name' then m.norm_name
        when m.q is not null then
          -- relevance: name starts with query, then a word starts with it, then contains
          case
            when m.norm_name like m.q || '%' then '0'
            when ' ' || m.norm_name like '% ' || m.q || '%' then '1'
            else '2'
          end || m.norm_name
        else
          -- "Preporučeno": images first, then a stable shuffle for this session
          case when m.has_image then '0' else '1' end || md5(m.id::text || coalesce(p_seed, ''))
      end as k_text
    from public.browse_products_matches(p_query, p_store_ids, p_price_min, p_price_max, p_deals_only) m
  )
  select
    k.id,
    k.product_name,
    k.has_image,
    coalesce(
      (select array_agg(b.barcode order by b.barcode) from public.barcodes b where b.product_id = k.id),
      '{}'
    ) as barcodes,
    k.min_price,
    k.is_deal,
    k.k_num as sort_num,
    k.k_text as sort_text
  from keyed k
  where p_after_id is null
     or (k.k_num, k.k_text, k.id) > (p_after_num, p_after_text, p_after_id)
  order by k.k_num, k.k_text, k.id
  limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

create or replace function public.browse_products_count(
  p_query        text     default null,
  p_store_ids    text[]   default null,
  p_price_min    numeric  default null,
  p_price_max    numeric  default null,
  p_deals_only   boolean  default false
)
returns integer
language sql
stable
security invoker
set search_path = ''
set work_mem = '32MB'
as $$
  -- Stops at 1001 so it is always cheap; the UI shows "1.000+" beyond that.
  select count(*)::integer
  from (
    select 1
    from public.browse_products_matches(p_query, p_store_ids, p_price_min, p_price_max, p_deals_only)
    limit 1001
  ) capped;
$$;

grant execute on function public.browse_products(text, text[], numeric, numeric, boolean, text, text, integer, numeric, text, uuid) to authenticated;
grant execute on function public.browse_products_matches(text, text[], numeric, numeric, boolean) to authenticated;
grant execute on function public.browse_products_count(text, text[], numeric, numeric, boolean) to authenticated;

-- 5. Daily refresh (optional, recommended) ---------------------------------------------------
--
-- The summary must be refreshed after each daily price import. Calling
-- refresh_product_price_summary() through the API can hit the statement timeout on ~7.7M rows,
-- so schedule it inside the database instead. Enable pg_cron (Database → Extensions), then run
-- the block below. pg_cron uses UTC: '0 8 * * *' = 10:00 CEST (summer); in winter (CET) it
-- runs at 09:00 local time.
--
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'refresh-product-price-summary',
--   '0 8 * * *',
--   $$ refresh materialized view concurrently public.product_price_summary $$
-- );
