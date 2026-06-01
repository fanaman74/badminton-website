-- Run this in Supabase SQL Editor
-- Creates the user_sessions table needed for invite-code auth

-- Step 1: Remove auth.users FK from profiles (if it still exists)
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

-- Step 2: Drop the old auth trigger (if it still exists)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Step 3: Create user_sessions table
create table if not exists public.user_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  token      text not null unique,
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '30 days'
);

create index if not exists idx_user_sessions_token on public.user_sessions(token);
create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);
