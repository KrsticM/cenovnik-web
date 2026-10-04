-- See README → Database for the run order. Safe to re-run.
-- Shared "bought" ticks; the last write wins.

alter table public.shopping_list_items
  add column if not exists checked_at timestamptz;

-- Earlier version took the token as text.
drop function if exists public.set_shared_item_checked(text, uuid, boolean);

-- Sets rather than toggles, so replaying queued offline taps is safe. P0002 = link or item gone.
create or replace function public.set_shared_item_checked(
  p_token      uuid,
  p_product_id uuid,
  p_checked    boolean
)
returns timestamptz
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_checked_at timestamptz;
begin
  update public.shopping_list_items i
  set checked_at = case when p_checked then coalesce(i.checked_at, pg_catalog.now()) else null end
  from public.shopping_lists l
  where l.id = i.shopping_list_id
    and l.share_token = p_token
    and i.product_id = p_product_id
  returning i.checked_at into v_checked_at;

  if not found then
    raise exception 'Shared list item not found' using errcode = 'P0002';
  end if;
  return v_checked_at;
end;
$$;

revoke all on function public.set_shared_item_checked(uuid, uuid, boolean) from public;
grant execute on function public.set_shared_item_checked(uuid, uuid, boolean) to anon, authenticated;
