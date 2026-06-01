-- Update RLS policies to work without Supabase Auth
-- Security is now handled server-side via session token validation

-- Drop old policies that reference auth.uid()
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "sessions_select" on public.sessions;
drop policy if exists "sessions_insert_admin" on public.sessions;
drop policy if exists "sessions_update_admin" on public.sessions;
drop policy if exists "sessions_delete_admin" on public.sessions;
drop policy if exists "rsvps_select" on public.rsvps;
drop policy if exists "rsvps_insert_own" on public.rsvps;
drop policy if exists "rsvps_update_own" on public.rsvps;
drop policy if exists "rsvps_delete_own" on public.rsvps;
drop policy if exists "expenses_select" on public.expenses;
drop policy if exists "expenses_insert" on public.expenses;
drop policy if exists "matches_select" on public.matches;
drop policy if exists "matches_insert_admin" on public.matches;

-- Disable RLS on all tables - security is handled server-side
alter table public.profiles disable row level security;
alter table public.sessions disable row level security;
alter table public.rsvps disable row level security;
alter table public.expenses disable row level security;
alter table public.matches disable row level security;
