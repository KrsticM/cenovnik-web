-- Verification checks for supabase/browse_products.sql.
-- Run each numbered block on its own in the Supabase SQL editor and compare with "Expect".
-- Read-only: nothing here changes data (block 9 uses a transaction that is rolled back).

-- 1. Everything was created -------------------------------------------------------------------
-- Expect: 5 functions, 1 materialized view, 4 indexes, 2 extensions.
select 'function' as kind, proname as name from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('f_search_normalize', 'browse_products', 'browse_products_matches',
                  'browse_products_count', 'refresh_product_price_summary')
union all
select 'matview', matviewname from pg_matviews where schemaname = 'public' and matviewname = 'product_price_summary'
union all
select 'index', indexname from pg_indexes
where schemaname = 'public'
  and indexname in ('products_search_name_trgm_idx', 'barcodes_product_id_idx',
                    'product_price_summary_product_idx', 'product_price_summary_price_idx')
union all
select 'extension', extname from pg_extension where extname in ('pg_trgm', 'unaccent')
order by 1, 2;

-- 2. Diacritics normalisation ----------------------------------------------------------------
-- Expect: čokolada šljiva ćevapi đak žito → "cokolada sljiva cevapi dak zito"
select public.f_search_normalize('ČOKOLADA Šljiva ćevapi Đak žito') as normalized;

-- 3. Cheapest-price summary matches the raw prices ----------------------------------------
-- Compares 200 random products (re-run for another sample) instead of all ~7.7M price rows.
-- Expect: summary_rows ≈ number of products that have any price; sampled = 200; mismatches = 0.
with sample as (
  select product_id, min_price
  from public.product_price_summary
  order by random()
  limit 200
),
compared as (
  select
    s.product_id,
    s.min_price,
    (select min(coalesce(cp.discounted_price, cp.regular_price))
     from public.current_prices cp
     where cp.product_id = s.product_id) as raw_min
  from sample s
)
select
  (select count(*) from public.product_price_summary) as summary_rows,
  count(*) as sampled,
  count(*) filter (where min_price <> raw_min) as mismatches
from compared;

-- 4. Search: diacritics, relevance order, barcode ----------------------------------------
-- 4a. Expect: "Čokolada…" names although typed without č; names starting with the query first.
select product_name, min_price, is_deal, sort_text
from public.browse_products(p_query => 'cokolada', p_limit => 10);

-- 4b. Multi-word: expect names containing "moja" and later "kravica".
select product_name, min_price
from public.browse_products(p_query => 'moja kravica', p_limit => 10);

-- 4c. Barcode: expect exactly the product with this barcode (takes one existing barcode).
select b.barcode, bp.product_name
from (select barcode from public.barcodes limit 1) b
cross join lateral public.browse_products(p_query => b.barcode) bp;

-- 5. Filters are applied to every row -------------------------------------------------------
-- Expect: violations = 0 for each filter.
select
  (select count(*) from public.browse_products(p_price_min => 200, p_price_max => 500, p_limit => 100)
     where min_price < 200 or min_price >= 500) as price_range_violations,
  (select count(*) from public.browse_products(p_deals_only => true, p_limit => 100)
     where not is_deal) as deals_only_violations;

-- 6. Sorts ------------------------------------------------------------------------------------
-- Expect: price_asc ascending, price_desc descending, name alphabetical (ignoring diacritics).
select 'price_asc' as sort, product_name, min_price from public.browse_products(p_sort => 'price_asc', p_limit => 5)
union all
select 'price_desc', product_name, min_price from public.browse_products(p_sort => 'price_desc', p_limit => 5)
union all
select 'name', product_name, min_price from public.browse_products(p_sort => 'name', p_limit => 5);

-- 7. Keyset pagination: page 2 continues page 1 with no overlap ---------------------------
-- Expect: overlap = 0 and page2_rows = 20 (for a query with more than 40 results).
with page1 as (
  select * from public.browse_products(p_query => 'mleko', p_sort => 'price_asc', p_limit => 20)
),
last_row as (
  select sort_num, sort_text, id from page1 order by sort_num desc, sort_text desc, id desc limit 1
),
page2 as (
  select p.* from last_row l
  cross join lateral public.browse_products(
    p_query => 'mleko', p_sort => 'price_asc', p_limit => 20,
    p_after_num => l.sort_num, p_after_text => l.sort_text, p_after_id => l.id) p
)
select
  (select count(*) from page2) as page2_rows,
  (select count(*) from page1 join page2 using (id)) as overlap,
  (select max(min_price) from page1) as page1_max_price,
  (select min(min_price) from page2) as page2_min_price;  -- expect page2_min_price >= page1_max_price

-- 8. "My markets" scope and capped counts --------------------------------------------------
-- Uses the stores of the user with the most favourite stores.
-- Expect: my_markets prices >= all_markets price for the same product (a subset can't be cheaper),
--         counts are numbers <= 1001.
with me as (
  select array_agg(store_id) as store_ids from public.user_stores
  where user_id = (select user_id from public.user_stores group by user_id order by count(*) desc limit 1)
)
select
  (select count(*) from public.browse_products(p_store_ids => me.store_ids, p_limit => 100) mine
     join public.product_price_summary s on s.product_id = mine.id
     where mine.min_price < s.min_price) as cheaper_than_all_markets_violations,
  public.browse_products_count(p_store_ids => me.store_ids) as my_markets_count,
  public.browse_products_count() as all_markets_count,
  public.browse_products_count(p_query => 'mleko') as mleko_count
from me;

-- 9. As the app runs it: authenticated role, 8 s timeout -------------------------------------
-- The SQL editor only shows the last statement's output, so run 9a–9d one at a time.
-- Read "Execution Time" at the bottom of each plan.
-- Expect: search and count < 100 ms; browse and "my markets" < 500 ms; no temp read/written.

-- 9a. "Preporučeno" (default browse), all markets
begin;
set local role authenticated;
set local statement_timeout = '8s';
explain (analyze, buffers) select * from public.browse_products(p_limit => 20);
rollback;

-- 9b. Search with diacritics-insensitive match
begin;
set local role authenticated;
set local statement_timeout = '8s';
explain (analyze, buffers) select * from public.browse_products(p_query => 'cokolada', p_limit => 20);
rollback;

-- 9c. "Samo moji marketi" (real favourite stores of the user with the most stores), price sort
-- user_stores is RLS-protected (own rows only), so read the store ids as postgres *before*
-- switching role, and pass them in the way the app does.
begin;
select set_config('checks.store_ids',
  (select array_agg(store_id)::text from public.user_stores
   where user_id = (select user_id from public.user_stores group by user_id order by count(*) desc limit 1)),
  true) as store_ids_used;
set local role authenticated;
set local statement_timeout = '8s';
explain (analyze, buffers) select * from public.browse_products(
  p_store_ids => current_setting('checks.store_ids')::text[],
  p_sort => 'price_asc', p_limit => 20);
rollback;

-- 9d. Worst-case capped count (a single letter matches almost everything)
begin;
set local role authenticated;
set local statement_timeout = '8s';
explain (analyze, buffers) select public.browse_products_count(p_query => 'a');
rollback;

-- 10. The search index is actually used ----------------------------------------------------
-- Expect: the plan mentions "products_search_name_trgm_idx" (Bitmap Index Scan).
explain
select id from public.products
where search_name like '%cokolada%';

-- 11. Refresh is locked down ---------------------------------------------------------------
-- Expect: "permission denied for function refresh_product_price_summary".
begin;
set local role authenticated;
select public.refresh_product_price_summary();
rollback;

-- 12. Word order doesn't matter ---------------------------------------------------------------
-- Expect: the three counts are equal, and only_in_one = 0 (same products for every word order).
with a as (select id from public.browse_products_matches(p_query => 'plazma keks')),
     b as (select id from public.browse_products_matches(p_query => 'keks plazma')),
     c as (select id from public.browse_products_matches(p_query => 'Keks   PLAZMA'))
select
  (select count(*) from a) as plazma_keks,
  (select count(*) from b) as keks_plazma,
  (select count(*) from c) as keks_plazma_messy,
  (select count(*) from ((table a except table b) union all (table b except table a)) d) as only_in_one;
