-- Run once in the Supabase SQL editor for the eCenovnik project.
-- Anonymous visitors can only read lists whose share_token is enabled,
-- plus the products and barcodes referenced by those lists.

grant usage on schema public to anon;
grant select on table public.shopping_lists to anon;
grant select on table public.shopping_list_items to anon;
grant select on table public.products to anon;
grant select on table public.barcodes to anon;

alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.products enable row level security;
alter table public.barcodes enable row level security;

drop policy if exists "Public can read shared shopping lists" on public.shopping_lists;
create policy "Public can read shared shopping lists"
on public.shopping_lists for select to anon
using (share_token is not null);

drop policy if exists "Public can read items on shared lists" on public.shopping_list_items;
create policy "Public can read items on shared lists"
on public.shopping_list_items for select to anon
using (
  exists (
    select 1 from public.shopping_lists
    where shopping_lists.id = shopping_list_items.shopping_list_id
      and shopping_lists.share_token is not null
  )
);

drop policy if exists "Public can read products on shared lists" on public.products;
create policy "Public can read products on shared lists"
on public.products for select to anon
using (
  exists (
    select 1
    from public.shopping_list_items
    join public.shopping_lists on shopping_lists.id = shopping_list_items.shopping_list_id
    where shopping_list_items.product_id = products.id
      and shopping_lists.share_token is not null
  )
);

drop policy if exists "Public can read barcodes on shared lists" on public.barcodes;
create policy "Public can read barcodes on shared lists"
on public.barcodes for select to anon
using (
  exists (
    select 1
    from public.shopping_list_items
    join public.shopping_lists on shopping_lists.id = shopping_list_items.shopping_list_id
    where shopping_list_items.product_id = barcodes.product_id
      and shopping_lists.share_token is not null
  )
);
