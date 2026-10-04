-- See README → Database for the run order. Safe to re-run.
-- Reads a shared list by its token; runs as the owner so visitors need no table access.

-- An earlier text-token version (with owner details) makes the call ambiguous.
drop function if exists public.get_shared_list(text);

create or replace function public.get_shared_list(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', l.id,
    'name', l.name,
    'topic', public.shared_list_topic(l.share_token),
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_id', i.product_id,
            'quantity', i.quantity,
            'checked_at', i.checked_at,
            'product_name', p.product_name,
            'has_image', p.has_image,
            'barcode', (
              select min(b.barcode collate "C") from public.barcodes b where b.product_id = i.product_id
            ),
            'min_price', s.min_price
          )
          order by i.created_at
        )
        from public.shopping_list_items i
        left join public.products p on p.id = i.product_id
        left join public.product_price_summary s on s.product_id = i.product_id
        where i.shopping_list_id = l.id
      ),
      '[]'::jsonb
    )
  )
  from public.shopping_lists l
  where l.share_token = p_token;
$$;

revoke all on function public.get_shared_list(uuid) from public;
grant execute on function public.get_shared_list(uuid) to anon, authenticated;
