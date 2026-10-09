-- See README → Database for the run order. Safe to re-run.
-- Products shown behind the sign-in card: the most-added products of the last 30 days that
-- have a photo and a current price, topped up with deals. Runs as the owner so visitors need
-- no table access; the web app caches the result for a day.

create or replace function public.get_signin_showcase(p_limit integer default 16)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with popular as (
    select i.product_id, count(*) as adds
    from public.shopping_list_items i
    where i.created_at > now() - interval '30 days'
    group by i.product_id
  ),
  ranked as (
    select
      p.id,
      p.product_name,
      s.min_price,
      s.regular_price,
      s.is_deal,
      coalesce(pop.adds, 0) as adds
    from public.products p
    join public.product_price_summary s on s.product_id = p.id
    left join popular pop on pop.product_id = p.id
    where p.has_image
      and (pop.product_id is not null or s.is_deal)
    order by coalesce(pop.adds, 0) desc, s.is_deal desc, p.id
    limit least(greatest(p_limit, 1), 32)
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'product_id', r.id,
        'product_name', r.product_name,
        'barcode', (
          select min(b.barcode collate "C") from public.barcodes b where b.product_id = r.id
        ),
        'min_price', r.min_price,
        'regular_price', r.regular_price,
        'is_deal', r.is_deal
      )
      order by r.adds desc, r.is_deal desc, r.id
    ),
    '[]'::jsonb
  )
  from ranked r;
$$;

revoke all on function public.get_signin_showcase(integer) from public;
grant execute on function public.get_signin_showcase(integer) to anon, authenticated;
