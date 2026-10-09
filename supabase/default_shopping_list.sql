-- Every account has one default shopping list, created together with the account. Safe to re-run.
-- Run after authenticated_shopping_lists.sql. If step 2 fails, a user still has several lists:
-- delete the extra lists (and their items) first, then run this again.
-- Extra lists (planned for Premium) are inserted with is_default = false.

-- 1. The flag. Existing lists become the default; an insert that does not say otherwise is one too,
--    so an old app build that tries to create a second list is rejected instead of making a duplicate.
alter table public.shopping_lists
  add column if not exists is_default boolean not null default true;

-- 2. One default list per user. (Replaces the plain unique index from an earlier version.)
drop index if exists public.shopping_lists_user_id_key;
create unique index if not exists shopping_lists_one_default_per_user
  on public.shopping_lists (user_id) where is_default;

-- 3. The database creates it, so the app never has to, and two requests can't race into duplicates.
create or replace function public.create_default_shopping_list()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.shopping_lists (user_id, name, is_default, created_at, updated_at)
  values (new.id, 'Moja lista', true, now(), now())
  on conflict (user_id) where is_default do nothing;
  return new;
end;
$$;

revoke all on function public.create_default_shopping_list() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_shopping_list on auth.users;
create trigger on_auth_user_created_shopping_list
  after insert on auth.users
  for each row execute function public.create_default_shopping_list();

-- 4. Accounts that exist already and have no default list yet.
insert into public.shopping_lists (user_id, name, is_default, created_at, updated_at)
select u.id, 'Moja lista', true, now(), now()
from auth.users u
where not exists (select 1 from public.shopping_lists l where l.user_id = u.id and l.is_default);

-- 5. Lists the old web code named "Moja lista za kupovinu" get the name the mobile app uses.
update public.shopping_lists set name = 'Moja lista' where name = 'Moja lista za kupovinu';

-- Checks (read-only). Expect: no rows, no rows, 1, 0, then 0.
-- select user_id, count(*) from public.shopping_lists where is_default group by user_id having count(*) > 1;
-- select u.id from auth.users u where not exists (select 1 from public.shopping_lists l where l.user_id = u.id and l.is_default);
-- select count(*) from pg_trigger where tgname = 'on_auth_user_created_shopping_list';
-- select count(*) from public.shopping_lists where name = 'Moja lista za kupovinu';
-- select count(*) from public.shopping_lists where not is_default;
