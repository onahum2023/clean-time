-- Staging-only bootstrap of the repository's documented whole-state ownership contract.
-- Apply only to the explicitly identified empty staging project, never production.
create table public.user_data (
  user_id uuid primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
revoke all on public.user_data from public, anon, authenticated;
grant select, insert, update on public.user_data to authenticated;
create policy user_data_select_own on public.user_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy user_data_insert_own on public.user_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy user_data_update_own on public.user_data
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
-- Deletion remains the app's encrypted-empty-state operation, not a DELETE grant.
