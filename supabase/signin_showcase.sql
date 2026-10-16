-- See README → Database for the run order. Safe to re-run. Run browse_products.sql first.
-- Products shown behind the sign-in card. The ranking (most-added products of the last 30 days
-- that have a photo and a current price, topped up with deals) is precomputed into
-- public.signin_showcase_cache by refresh_product_price_summary() (browse_products.sql), so a
-- direct call to this function costs a read of at most 32 rows. It runs as the owner so
-- visitors need no table access; the web app also caches the result for a day. The ranking is only
-- as fresh as the daily refresh job (see browse_products.sql): without it the showcase goes stale.

create or replace function public.get_signin_showcase(p_limit integer default 16)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(c.item order by c.rank), '[]'::jsonb)
  from (
    select rank, item
    from public.signin_showcase_cache
    order by rank
    limit least(greatest(p_limit, 1), 32)
  ) c;
$$;

revoke all on function public.get_signin_showcase(integer) from public;
grant execute on function public.get_signin_showcase(integer) to anon, authenticated;
