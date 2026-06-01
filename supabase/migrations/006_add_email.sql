-- Add email column to profiles for email-based login
alter table public.profiles
  add column if not exists email text unique;
