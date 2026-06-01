-- Weekly court configuration (singleton row)
create table if not exists public.team_config (
  id          int primary key default 1 check (id = 1),
  day_of_week int  not null default 4,   -- 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
  courts      int  not null default 3,
  start_time  text not null default '20:00',
  location_name    text not null default '',
  location_maps_url text,
  updated_at  timestamptz default now()
);

-- Insert default row (Thursday, 3 courts, 8pm)
insert into public.team_config (id, day_of_week, courts, start_time, location_name)
values (1, 3, 3, '20:00', '')
on conflict (id) do nothing;
