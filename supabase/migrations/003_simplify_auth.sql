-- Migration to simplify auth - remove Supabase Auth dependency
-- Users are identified by UUID stored in session tokens

-- Drop the auth.users trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Modify profiles table to not reference auth.users
alter table public.profiles
  drop constraint profiles_id_fkey;

-- Create user_sessions table to store session tokens
create table public.user_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  token        text not null unique,
  created_at   timestamptz default now(),
  expires_at   timestamptz default now() + interval '30 days'
);

-- Create index for token lookups
create index idx_user_sessions_token on public.user_sessions(token);
create index idx_user_sessions_user_id on public.user_sessions(user_id);

-- Disable RLS on user_sessions for now (we'll check token server-side)
alter table public.user_sessions disable row level security;
