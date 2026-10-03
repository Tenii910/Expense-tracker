-- Custom-category inserts from the app omit user_id. Assign ownership from
-- the authenticated Supabase session; built-in seed rows explicitly pass NULL.
alter table public.categories
  alter column user_id set default auth.uid();