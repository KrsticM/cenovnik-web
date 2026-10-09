-- Product browse/search for the web app (Proizvodi page).
-- Run once in the Supabase SQL editor. Safe to re-run (idempotent).
--
-- Provides:
--   * browse_products(...)        one page of products with the cheapest price in scope,
--                                 filtered, sorted and keyset-paginated server-side
--   * browse_products_count(...)  the same filters, counted up to 101 (UI shows "100+")
--   * browse_products_matches(...) shared filter step used by both
--   * product_price_summary       cheapest price per product across all markets
--   * product_browse_order        daily shuffled order for "Preporučeno" (stops after one page)
--   * refresh_product_price_summary()  call after each daily price import (service role); refreshes both

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
-- "Naziv A–Ž" walks products in name order and stops after one page.
create index if not exists products_search_name_idx
  on public.products (search_name, id);

create index if not exists barcodes_product_id_idx
  on public.barcodes (product_id);

-- current_prices (~7.7M rows, rewritten by the daily import) already has
-- PK (product_id, store_id) and current_prices_store_id_idx; no extra index there,
-- to keep imports fast.

-- 3. Cheapest price across all markets (refreshed after each import) -------------------------

-- Earlier versions had no regular_price; a materialized view can't gain a column, so rebuild it.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_attribute
    where attrelid = 'public.product_price_summary'::regclass
      and attname = 'regular_price' and not attisdropped
  ) then
    drop materialized view public.product_price_summary;
  end if;
exception when undefined_table then null;
end $$;

-- Building this sorts all current_prices rows once; expect it to take a while on first run.
create materialized view if not exists public.product_price_summary as
select distinct on (cp.product_id)
  cp.product_id,
  coalesce(cp.discounted_price, cp.regular_price) as min_price,
  cp.regular_price,
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

-- 3b. "Preporučeno" order (refreshed with the summary) ------------------------------------------

-- Products with a price, in a daily shuffle: photos first ('0…'), then md5(id + date). Walking
-- this index lets the default view stop after one page instead of pricing every product first;
-- browse_products starts each visit at its own point in it.
create materialized view if not exists public.product_browse_order as
select
  p.id as product_id,
  (case when p.has_image then '0' else '1' end) || md5(p.id::text || current_date::text) as browse_key
from public.products p
join public.product_price_summary s on s.product_id = p.id
with data;

create unique index if not exists product_browse_order_product_idx
  on public.product_browse_order (product_id);
create index if not exists product_browse_order_key_idx
  on public.product_browse_order (browse_key, product_id);

grant select on public.product_browse_order to authenticated;

create or replace function public.refresh_product_price_summary()
returns void
language sql
security definer
set search_path = ''
as $$
  refresh materialized view concurrently public.product_price_summary;
  refresh materialized view concurrently public.product_browse_order;
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

-- The return types gained regular_price; CREATE OR REPLACE can't change a return type.
drop function if exists public.browse_products(text, text[], numeric, numeric, boolean, text, text, integer, numeric, text, uuid);
drop function if exists public.browse_products_matches(text, text[], numeric, numeric, boolean);

-- Products whose name (or barcode) matches the query; all products when there is no query.
-- Prices are not involved, so callers can order and page first and price only what they return.
create or replace function public.browse_products_candidates(p_query text default null)
returns table (
  id            uuid,
  product_name  text,
  has_image     boolean,
  norm_name     text,
  q             text
)
language sql
stable
security invoker
-- No SET clause: keeps this function inlinable into its callers; names are qualified.
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
      pg_catalog.btrim(coalesce(p_query, '')) ~ '^\d{6,}$' as is_barcode
    from normalized n
  )
  select
    p.id,
    p.product_name::text,
    p.has_image,
    p.search_name::text,
    params.q
  from public.products p
  cross join params
  where
    params.q is null
    or (params.is_barcode and exists (
          select 1 from public.barcodes b
          where b.product_id = p.id and b.barcode = pg_catalog.btrim(p_query)))
    or (not params.is_barcode
        and p.search_name like '%' || params.anchor || '%'
        and not exists (
          select 1 from pg_catalog.unnest(params.words) w
          where p.search_name not like '%' || w || '%'));
$$;

-- Shared filter step: products with a price in scope that match the query and filters.
-- Prices every product in scope first, so it is only used where all of them are needed anyway
-- (price sort without a search).
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
  regular_price numeric,
  is_deal       boolean
)
language sql
stable
security invoker
-- No SET clause: keeps this function inlinable into browse_products / browse_products_count,
-- so their filters, ordering and LIMIT reach the underlying tables.
as $$
  with params as (
    select coalesce(pg_catalog.array_length(p_store_ids, 1), 0) > 0 as scoped
  ),
  scoped_prices as (
    -- Ordered like product_price_summary, so scoped and unscoped results agree.
    select
      cp.product_id,
      min(coalesce(cp.discounted_price, cp.regular_price)) as min_price,
      min(cp.discounted_price) as min_deal_price,
      (array_agg(cp.regular_price order by
        coalesce(cp.discounted_price, cp.regular_price), (cp.discounted_price is not null) desc))[1]
        as regular_price
    from public.current_prices cp, params
    where params.scoped and cp.store_id = any (p_store_ids)
    group by cp.product_id
  ),
  prices as (
    select
      product_id,
      min_price,
      regular_price,
      coalesce(min_deal_price <= min_price, false) as is_deal
    from scoped_prices
    union all
    select s.product_id, s.min_price, s.regular_price, s.is_deal
    from public.product_price_summary s, params
    where not params.scoped
  )
  select
    c.id,
    c.product_name,
    c.has_image,
    c.norm_name,
    c.q,
    pr.min_price,
    pr.regular_price,
    pr.is_deal
  from public.browse_products_candidates(p_query) c
  join prices pr on pr.product_id = c.id
  where (p_price_min is null or pr.min_price >= p_price_min)
    and (p_price_max is null or pr.min_price < p_price_max)
    and (not coalesce(p_deals_only, false) or pr.is_deal);
$$;

-- Cheapest price of one product in the user's stores (or across all markets when unscoped).
-- Same rules as the scoped prices in browse_products_matches, but for a single product, so
-- ordered walks can price only the rows they actually return.
create or replace function public.product_price_in_scope(p_product_id uuid, p_store_ids text[])
returns table (min_price numeric, regular_price numeric, is_deal boolean)
language sql
stable
security invoker
-- No SET clause, so it can be inlined into the callers' lateral joins; names are qualified.
as $$
  select
    min(coalesce(cp.discounted_price, cp.regular_price))::numeric,
    ((array_agg(cp.regular_price order by
      coalesce(cp.discounted_price, cp.regular_price), (cp.discounted_price is not null) desc))[1])::numeric,
    coalesce(min(cp.discounted_price) <= min(coalesce(cp.discounted_price, cp.regular_price)), false)
  from public.current_prices cp
  where coalesce(pg_catalog.array_length(p_store_ids, 1), 0) > 0
    and cp.product_id = p_product_id
    and cp.store_id = any (p_store_ids)
  having count(*) > 0
  union all
  select s.min_price::numeric, s.regular_price::numeric, s.is_deal
  from public.product_price_summary s
  where coalesce(pg_catalog.array_length(p_store_ids, 1), 0) = 0
    and s.product_id = p_product_id;
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
  regular_price numeric,
  is_deal       boolean,
  sort_num      numeric,
  sort_text     text
)
language plpgsql
stable
security invoker
set search_path = ''
set work_mem = '32MB'
as $$
#variable_conflict use_column
declare
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 100);
  -- Each visit starts the shuffled list at its own point (from p_seed) and wraps around,
  -- photos first: segment 0 = photos from the start point on, 1 = photos before it,
  -- 2 and 3 = the same for products without a photo. sort_num carries the segment.
  v_start text := md5(coalesce(p_seed, ''));
  v_segment integer;
  v_from text;
  v_to text;
  v_found integer;
  v_total integer := 0;
begin
  -- "Preporučeno" without a search: walk the shuffled order and price only the rows returned,
  -- in the user's own stores, so a page stops after p_limit products.
  if nullif(pg_catalog.btrim(coalesce(p_query, '')), '') is null and coalesce(p_sort, 'relevance') = 'relevance' then
    for v_segment in coalesce(p_after_num, 0)::integer .. 3 loop
      v_from := case v_segment when 0 then '0' || v_start when 1 then '0' when 2 then '1' || v_start else '1' end;
      v_to   := case v_segment when 0 then '1' when 1 then '0' || v_start when 2 then '2' else '1' || v_start end;

      return query
        select
          o.product_id,
          p.product_name::text,
          p.has_image,
          coalesce(
            (select array_agg(b.barcode::text order by b.barcode) from public.barcodes b where b.product_id = o.product_id),
            '{}'
          ),
          pr.min_price,
          pr.regular_price,
          pr.is_deal,
          v_segment::numeric,
          o.browse_key
        from public.product_browse_order o
        join public.products p on p.id = o.product_id
        cross join lateral public.product_price_in_scope(o.product_id, p_store_ids) pr
        where o.browse_key >= v_from and o.browse_key < v_to
          and (p_after_id is null or v_segment <> p_after_num::integer
               or (o.browse_key, o.product_id) > (p_after_text, p_after_id))
          and (p_price_min is null or pr.min_price >= p_price_min)
          and (p_price_max is null or pr.min_price < p_price_max)
          and (not coalesce(p_deals_only, false) or pr.is_deal)
        order by o.browse_key, o.product_id
        limit v_limit - v_total;

      get diagnostics v_found = row_count;
      v_total := v_total + v_found;
      exit when v_total >= v_limit;
    end loop;
    return;
  end if;

  -- Search (relevance or name order), or name order without a search: order the matching
  -- products by name first, then price only the rows returned, in the user's stores.
  if p_sort = 'name' and nullif(pg_catalog.btrim(coalesce(p_query, '')), '') is null then
    return query
      select
        p.id,
        p.product_name::text,
        p.has_image,
        coalesce(
          (select array_agg(b.barcode::text order by b.barcode) from public.barcodes b where b.product_id = p.id),
          '{}'
        ),
        pr.min_price,
        pr.regular_price,
        pr.is_deal,
        0::numeric,
        p.search_name::text
      from public.products p
      cross join lateral public.product_price_in_scope(p.id, p_store_ids) pr
      where (p_after_id is null or (p.search_name, p.id) > (p_after_text, p_after_id))
        and (p_price_min is null or pr.min_price >= p_price_min)
        and (p_price_max is null or pr.min_price < p_price_max)
        and (not coalesce(p_deals_only, false) or pr.is_deal)
      order by p.search_name, p.id
      limit least(greatest(coalesce(p_limit, 20), 1), 100);
    return;
  end if;

  if nullif(pg_catalog.btrim(coalesce(p_query, '')), '') is not null and p_sort in ('relevance', 'name') then
    return query
      with keyed as (
        select
          c.*,
          case
            when p_sort = 'name' then c.norm_name
            -- relevance: name starts with query, then a word starts with it, then contains
            when c.norm_name like c.q || '%' then '0' || c.norm_name
            when ' ' || c.norm_name like '% ' || c.q || '%' then '1' || c.norm_name
            else '2' || c.norm_name
          end as k_text
        from public.browse_products_candidates(p_query) c
      ),
      -- Sorted before pricing (OFFSET 0 keeps it a separate step), so a broad search like "m"
      -- sorts names only and prices just the rows it returns.
      ordered as (
        select * from keyed k
        where p_after_id is null or (k.k_text, k.id) > (p_after_text, p_after_id)
        order by k.k_text, k.id
        offset 0
      )
      select
        k.id,
        k.product_name,
        k.has_image,
        coalesce(
          (select array_agg(b.barcode::text order by b.barcode) from public.barcodes b where b.product_id = k.id),
          '{}'
        ),
        pr.min_price,
        pr.regular_price,
        pr.is_deal,
        0::numeric,
        k.k_text
      from ordered k
      cross join lateral public.product_price_in_scope(k.id, p_store_ids) pr
      where (p_price_min is null or pr.min_price >= p_price_min)
        and (p_price_max is null or pr.min_price < p_price_max)
        and (not coalesce(p_deals_only, false) or pr.is_deal)
      order by k.k_text, k.id
      limit least(greatest(coalesce(p_limit, 20), 1), 100);
    return;
  end if;

  -- Price order with a search: price every match (a search keeps that set small), then sort.
  if nullif(pg_catalog.btrim(coalesce(p_query, '')), '') is not null then
    return query
      with keyed as (
        select
          c.*,
          pr.min_price,
          pr.regular_price,
          pr.is_deal,
          (case when p_sort = 'price_desc' then -pr.min_price else pr.min_price end)::numeric as k_num
        from public.browse_products_candidates(p_query) c
        cross join lateral public.product_price_in_scope(c.id, p_store_ids) pr
        where (p_price_min is null or pr.min_price >= p_price_min)
          and (p_price_max is null or pr.min_price < p_price_max)
          and (not coalesce(p_deals_only, false) or pr.is_deal)
      )
      select
        k.id,
        k.product_name,
        k.has_image,
        coalesce(
          (select array_agg(b.barcode::text order by b.barcode) from public.barcodes b where b.product_id = k.id),
          '{}'
        ),
        k.min_price,
        k.regular_price,
        k.is_deal,
        k.k_num,
        ''::text
      from keyed k
      where p_after_id is null or (k.k_num, '', k.id) > (p_after_num, coalesce(p_after_text, ''), p_after_id)
      order by k.k_num, k.id
      limit least(greatest(coalesce(p_limit, 20), 1), 100);
    return;
  end if;

  -- Price order without a search: every product in scope must be priced, so aggregate once.
  return query
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
        k.product_name::text,
        k.has_image,
        coalesce(
          (select array_agg(b.barcode::text order by b.barcode) from public.barcodes b where b.product_id = k.id),
          '{}'
        ),
        k.min_price::numeric,
        k.regular_price::numeric,
        k.is_deal,
        k.k_num,
        k.k_text
      from keyed k
      where p_after_id is null
         or (k.k_num, k.k_text, k.id) > (p_after_num, p_after_text, p_after_id)
      order by k.k_num, k.k_text, k.id
      limit least(greatest(coalesce(p_limit, 20), 1), 100);
end;
$$;

create or replace function public.browse_products_count(
  p_query        text     default null,
  p_store_ids    text[]   default null,
  p_price_min    numeric  default null,
  p_price_max    numeric  default null,
  p_deals_only   boolean  default false
)
returns integer
language plpgsql
stable
security invoker
set search_path = ''
set work_mem = '32MB'
as $$
begin
  -- Stops at 101 so it is always cheap; the UI shows "100+" beyond that.
  -- Products are checked one by one (index lookups), so the count stops early instead of
  -- pricing everything in scope first.
  if p_price_min is null and p_price_max is null and not coalesce(p_deals_only, false) then
    if coalesce(pg_catalog.array_length(p_store_ids, 1), 0) = 0 then
      return (
        select count(*)::integer
        from (
          select 1
          from public.browse_products_candidates(p_query) c
          join public.product_browse_order o on o.product_id = c.id
          limit 101
        ) capped
      );
    end if;

    -- Only "sold in one of my stores?" matters: answered from the primary key index alone.
    -- A per-product LIMIT 1 lookup keeps this an index probe; a plain EXISTS gets turned into
    -- "read every price row of these stores" first.
    return (
      select count(*)::integer
      from (
        select 1
        from public.browse_products_candidates(p_query) c
        cross join lateral (
          select 1
          from public.current_prices cp
          where cp.product_id = c.id and cp.store_id = any (p_store_ids)
          limit 1
        ) sold
        limit 101
      ) capped
    );
  end if;

  -- Price filters: price products one by one until 101 match.
  return (
    select count(*)::integer
    from (
      select 1
      from public.browse_products_candidates(p_query) c
      cross join lateral public.product_price_in_scope(c.id, p_store_ids) pr
      where (p_price_min is null or pr.min_price >= p_price_min)
        and (p_price_max is null or pr.min_price < p_price_max)
        and (not coalesce(p_deals_only, false) or pr.is_deal)
      limit 101
    ) capped
  );
end;
$$;

grant execute on function public.browse_products(text, text[], numeric, numeric, boolean, text, text, integer, numeric, text, uuid) to authenticated;
grant execute on function public.browse_products_matches(text, text[], numeric, numeric, boolean) to authenticated;
grant execute on function public.browse_products_count(text, text[], numeric, numeric, boolean) to authenticated;
grant execute on function public.product_price_in_scope(uuid, text[]) to authenticated;
grant execute on function public.browse_products_candidates(text) to authenticated;

-- 5. Daily refresh (optional, recommended) ---------------------------------------------------
--
-- The summary and the daily "Preporučeno" order must be refreshed after each daily price import.
-- Calling refresh_product_price_summary() through the API can hit the statement timeout on ~7.7M
-- rows, so schedule it inside the database instead, and have the job call the function (it
-- refreshes both views). Enable pg_cron (Database → Extensions), then run the block below.
-- pg_cron uses UTC: '0 11 * * *' = 12:00 CET (winter), 13:00 CEST (summer). Scheduling with an
-- existing job name replaces that job, so re-running this also fixes an older job that refreshed
-- only product_price_summary.
--
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'refresh-product-price-summary-noon-winter-time',
--   '0 11 * * *',
--   $$ select public.refresh_product_price_summary() $$
-- );
