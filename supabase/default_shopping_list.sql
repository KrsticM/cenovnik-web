-- One shopping list per user, created together with the account. Safe to re-run.
-- Run after authenticated_shopping_lists.sql. If step 1 fails, a user still has several lists:
-- delete the extra lists (and their items) first, then run this again.

-- 1. A user can have only one list (for now, Standard and Premium alike).
create unique index if not exists shopping_lists_user_id_key
  on public.shopping_lists (user_id);

-- 2. The database creates it, so the app never has to, and two requests can't race into duplicates.
create or replace function public.create_default_shopping_list()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.shopping_lists (user_id, name, created_at, updated_at)
  values (new.id, 'Moja lista', now(), now())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_default_shopping_list() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_shopping_list on auth.users;
create trigger on_auth_user_created_shopping_list
  after insert on auth.users
  for each row execute function public.create_default_shopping_list();

-- 3. Accounts that exist already and have no list yet.
insert into public.shopping_lists (user_id, name, created_at, updated_at)
select u.id, 'Moja lista', now(), now()
from auth.users u
where not exists (select 1 from public.shopping_lists l where l.user_id = u.id);

-- 4. Lists the old web code named "Moja lista za kupovinu" get the name the mobile app uses.
update public.shopping_lists set name = 'Moja lista' where name = 'Moja lista za kupovinu';

-- Checks (read-only). Expect: no rows, no rows, 1, then 0.
-- select user_id, count(*) from public.shopping_lists group by user_id having count(*) > 1;
-- select u.id from auth.users u where not exists (select 1 from public.shopping_lists l where l.user_id = u.id);
-- select count(*) from pg_trigger where tgname = 'on_auth_user_created_shopping_list';
-- select count(*) from public.shopping_lists where name = 'Moja lista za kupovinu';
