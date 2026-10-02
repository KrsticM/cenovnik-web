-- Shared "bought" ticks on shopping list items. Run once in the Supabase SQL editor; safe to re-run.
--
-- A tick belongs to the item, so everyone with the share link (and the owner) sees the same state
-- live through the existing realtime subscriptions. Ticks stay until someone unticks them or the
-- owner clears bought items. Concurrent taps: the last write wins.

alter table public.shopping_list_items
  add column if not exists checked_at timestamptz;

-- Visitors have no account and can't write to the tables. This function only changes checked_at,
-- and only on an item of a list whose share link is active. Setting (not toggling) makes queued
-- offline taps safe to replay.
create or replace function public.set_shared_item_checked(
  p_token      text,
  p_product_id uuid,
  p_checked    boolean
)
returns timestamptz
language sql
volatile
security definer
set search_path = ''
as $$
  update public.shopping_list_items i
  set checked_at = case when p_checked then coalesce(i.checked_at, pg_catalog.now()) else null end
  from public.shopping_lists l
  where l.id = i.shopping_list_id
    and l.share_token is not null
    and l.share_token::text = p_token
    and i.product_id = p_product_id
  returning i.checked_at;
$$;

revoke all on function public.set_shared_item_checked(text, uuid, boolean) from public;
grant execute on function public.set_shared_item_checked(text, uuid, boolean) to anon, authenticated;
