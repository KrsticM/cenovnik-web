-- See README → Database for the run order. Safe to re-run.
-- Data-free Broadcast pings on a topic hashed from the share token, so live updates need no
-- table access and only link holders know where to listen.

create or replace function public.shared_list_topic(p_token uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select 'shared-list:' || pg_catalog.md5(p_token::text);
$$;

revoke all on function public.shared_list_topic(uuid) from public;

-- Statement-level: emptying a list sends one ping, not one per item.
create or replace function public.broadcast_shared_items_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform realtime.send('{}'::jsonb, 'changed', public.shared_list_topic(l.share_token), false)
    from public.shopping_lists l
    where l.share_token is not null
      and l.id in (select distinct o.shopping_list_id from old_rows o);
  else
    perform realtime.send('{}'::jsonb, 'changed', public.shared_list_topic(l.share_token), false)
    from public.shopping_lists l
    where l.share_token is not null
      and l.id in (select distinct n.shopping_list_id from new_rows n);
  end if;
  return null;
end;
$$;

revoke all on function public.broadcast_shared_items_change() from public;

drop trigger if exists shopping_list_items_broadcast_insert on public.shopping_list_items;
create trigger shopping_list_items_broadcast_insert
after insert on public.shopping_list_items
referencing new table as new_rows
for each statement execute function public.broadcast_shared_items_change();

drop trigger if exists shopping_list_items_broadcast_update on public.shopping_list_items;
create trigger shopping_list_items_broadcast_update
after update on public.shopping_list_items
referencing new table as new_rows
for each statement execute function public.broadcast_shared_items_change();

drop trigger if exists shopping_list_items_broadcast_delete on public.shopping_list_items;
create trigger shopping_list_items_broadcast_delete
after delete on public.shopping_list_items
referencing old table as old_rows
for each statement execute function public.broadcast_shared_items_change();

create or replace function public.broadcast_shared_list_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.share_token is not null
     and (tg_op = 'DELETE'
          or old.share_token is distinct from new.share_token
          or old.name is distinct from new.name) then
    perform realtime.send('{}'::jsonb, 'changed', public.shared_list_topic(old.share_token), false);
  end if;
  return null;
end;
$$;

revoke all on function public.broadcast_shared_list_change() from public;

drop trigger if exists shopping_lists_broadcast on public.shopping_lists;
create trigger shopping_lists_broadcast
after update or delete on public.shopping_lists
for each row execute function public.broadcast_shared_list_change();
