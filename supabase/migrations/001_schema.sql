-- Profiles (extends auth.users)
create table public.profiles (
  id       uuid primary key references auth.users(id) on delete cascade,
  name     text not null,
  role     text not null default 'PLAYER' check (role in ('ADMIN', 'PLAYER')),
  balance  numeric not null default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sessions
create table public.sessions (
  id                uuid primary key default gen_random_uuid(),
  date              timestamptz not null,
  location_name     text not null,
  location_maps_url text,
  courts_booked     int not null check (courts_booked > 0),
  max_capacity      int not null,
  status            text not null default 'UPCOMING' check (status in ('UPCOMING', 'COMPLETED', 'CANCELLED')),
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz default now()
);

-- RSVPs
create table public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  status     text not null check (status in ('IN', 'OUT', 'MAYBE', 'WAITLIST')),
  created_at timestamptz default now(),
  unique (user_id, session_id)
);

-- Expenses (Phase 2 - schema only)
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  payer_id    uuid not null references public.profiles(id) on delete cascade,
  amount      numeric not null,
  description text not null,
  date        timestamptz not null default now(),
  created_at  timestamptz default now()
);

-- Matches (Phase 3 - schema only)
create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references public.sessions(id) on delete cascade,
  team1_p1_id   uuid not null references public.profiles(id),
  team1_p2_id   uuid not null references public.profiles(id),
  team2_p1_id   uuid not null references public.profiles(id),
  team2_p2_id   uuid not null references public.profiles(id),
  team1_score   int not null,
  team2_score   int not null,
  created_at    timestamptz default now()
);
