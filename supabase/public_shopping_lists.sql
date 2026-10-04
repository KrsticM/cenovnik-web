-- Run LAST (README → Database): older app versions stop working. Safe to re-run.
-- Visitors get no direct table access; they use get_shared_list and set_shared_item_checked.

grant usage on schema public to anon;

alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.products enable row level security;
alter table public.barcodes enable row level security;

drop policy if exists "Public can read shared shopping lists" on public.shopping_lists;
drop policy if exists "Public can read items on shared lists" on public.shopping_list_items;
drop policy if exists "Public can read products on shared lists" on public.products;
drop policy if exists "Public can read barcodes on shared lists" on public.barcodes;

revoke select on table public.shopping_lists from anon;
revoke select on table public.shopping_list_items from anon;
revoke select on table public.products from anon;
revoke select on table public.barcodes from anon;
revoke select on public.product_price_summary from anon;

drop function if exists public.is_shared_list(uuid);
