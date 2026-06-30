-- ============================================================================
-- One & Done Fantasy Golf — Supabase schema
-- ----------------------------------------------------------------------------
-- Design notes:
--   * A PROFILE is the permanent person (1:1 with a Supabase Auth user).
--   * A SEASON is one year (2026, 2027, ...). It owns its own schedule.
--   * A TOURNAMENT belongs to exactly one season (you pick ~20 events/yr).
--   * A SEASON_ENTRY is one person's participation in one season. This is what
--     "signing up for 2027" creates. Per-person history lives here, so prior
--     years are never touched when a new season starts.
--   * A PICK links an entry to a tournament + a golfer, and carries points.
--   * GOLFERS are shared across all seasons, keyed by ESPN athlete id, so
--     scoring matches by id (not by name string). aliases[] catches legacy
--     spellings from the old spreadsheet.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles  (one row per human; id mirrors auth.users.id)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key,
  name        text not null,
  email       text not null unique,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- golfers  (shared pool, keyed by ESPN athlete id)
-- ---------------------------------------------------------------------------
create table public.golfers (
  espn_id     text primary key,             -- from /id/####/ in ESPN urls
  name        text not null,                -- canonical display name (ESPN)
  country     text,
  world_rank  int,                          -- refreshed weekly, nullable
  aliases     text[] not null default '{}', -- legacy / alternate spellings
  active      boolean not null default true,
  updated_at  timestamptz not null default now()
);
create index on public.golfers using gin (aliases);

-- ---------------------------------------------------------------------------
-- seasons
-- ---------------------------------------------------------------------------
create table public.seasons (
  id          uuid primary key default gen_random_uuid(),
  year        int not null unique,
  name        text not null,
  status      text not null default 'draft'
              check (status in ('draft','active','complete')),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tournaments  (per-season schedule, built manually each year)
-- ---------------------------------------------------------------------------
create table public.tournaments (
  id            uuid primary key default gen_random_uuid(),
  season_id     uuid not null references public.seasons(id) on delete cascade,
  ordinal       int not null,               -- display order within season
  name          text not null,
  course        text,
  date_label    text,                       -- human label e.g. "Apr 9-12"
  espn_event_id text,                        -- ESPN tournamentId for scoring
  is_major      boolean not null default false, -- triggers LIV point-borrowing
  picks_open    boolean not null default false, -- visible on League Picks
  lock_at       timestamptz,                -- picks freeze at tee-off (optional)
  scored        boolean not null default false,
  unique (season_id, ordinal)
);

-- ---------------------------------------------------------------------------
-- season_entries  (one person's participation in one season)
-- ---------------------------------------------------------------------------
create table public.season_entries (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references public.seasons(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  status      text not null default 'active'
              check (status in ('active','withdrawn')),
  joined_at   timestamptz not null default now(),
  unique (season_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- picks
-- ---------------------------------------------------------------------------
create table public.picks (
  id            uuid primary key default gen_random_uuid(),
  entry_id      uuid not null references public.season_entries(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  golfer_espn_id text references public.golfers(espn_id),
  golfer_name   text not null,              -- snapshot of name at pick time
  points        int,                        -- null until scored
  finish_pos    text,                       -- e.g. "T5" (recorded at scoring)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- one pick per entry per tournament
  unique (entry_id, tournament_id),
  -- ONE AND DONE: a golfer can't be used twice by the same entry in a season
  unique (entry_id, golfer_espn_id)
);
create index on public.picks (tournament_id);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.profiles       enable row level security;
alter table public.golfers        enable row level security;
alter table public.seasons        enable row level security;
alter table public.tournaments    enable row level security;
alter table public.season_entries enable row level security;
alter table public.picks          enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles: a user sees/edits their own row; admins see all
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin());

-- reference data: everyone signed in can read; only admins write
create policy golfers_read on public.golfers for select using (auth.role() = 'authenticated');
create policy golfers_admin on public.golfers for all using (public.is_admin());
create policy seasons_read on public.seasons for select using (auth.role() = 'authenticated');
create policy seasons_admin on public.seasons for all using (public.is_admin());
create policy tournaments_read on public.tournaments for select using (auth.role() = 'authenticated');
create policy tournaments_admin on public.tournaments for all using (public.is_admin());

-- entries: read all (needed for the leaderboard); a user manages their own;
-- admins manage anyone (add/withdraw/remove).
create policy entries_read on public.season_entries for select using (auth.role() = 'authenticated');
create policy entries_self on public.season_entries
  for all using (profile_id = auth.uid());
create policy entries_admin on public.season_entries
  for all using (public.is_admin());

-- picks: visibility is the tricky one. A user always sees their own picks.
-- Everyone sees others' picks ONLY for tournaments whose picks_open = true
-- (i.e. after tee-off) — this enforces "no peeking before the event starts".
create policy picks_owner on public.picks
  for select using (
    exists (select 1 from public.season_entries e
            where e.id = picks.entry_id and e.profile_id = auth.uid())
  );
create policy picks_visible_after_open on public.picks
  for select using (
    exists (select 1 from public.tournaments t
            where t.id = picks.tournament_id and t.picks_open = true)
  );
-- a user writes their own picks (app also checks lock_at / status before save)
create policy picks_write_own on public.picks
  for all using (
    exists (select 1 from public.season_entries e
            where e.id = picks.entry_id and e.profile_id = auth.uid()
              and e.status = 'active')
  );
-- admins can read and override any pick (manual scoring fixes)
create policy picks_admin on public.picks for all using (public.is_admin());

-- ===========================================================================
-- Auto-create a profile when a new auth user signs up
-- ===========================================================================
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
