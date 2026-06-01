-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.rsvps enable row level security;
alter table public.expenses enable row level security;
alter table public.matches enable row level security;

-- profiles: authenticated users can read all; users can update their own row
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- sessions: authenticated users can read all; only ADMIN can write
create policy "sessions_select" on public.sessions
  for select to authenticated using (true);

create policy "sessions_insert_admin" on public.sessions
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "sessions_update_admin" on public.sessions
  for update to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "sessions_delete_admin" on public.sessions
  for delete to authenticated
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

-- rsvps: authenticated users can read all; users manage their own RSVPs
create policy "rsvps_select" on public.rsvps
  for select to authenticated using (true);

create policy "rsvps_insert_own" on public.rsvps
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "rsvps_update_own" on public.rsvps
  for update to authenticated
  using (auth.uid() = user_id);

create policy "rsvps_delete_own" on public.rsvps
  for delete to authenticated
  using (auth.uid() = user_id);

-- expenses: authenticated users can read all; admin can write
create policy "expenses_select" on public.expenses
  for select to authenticated using (true);

create policy "expenses_insert" on public.expenses
  for insert to authenticated
  with check (auth.uid() = payer_id);

-- matches: authenticated users can read all; admin can write
create policy "matches_select" on public.matches
  for select to authenticated using (true);

create policy "matches_insert_admin" on public.matches
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );
