-- movielog initial schema
--
-- Design notes:
-- * logs is an append-only event table: a rewatch INSERTS a new row so
--   rating history is preserved over time. Users may edit/delete their own
--   rows to fix mistakes, but the app never overwrites a rating on rewatch.
-- * films is a shared cache of TMDB metadata written only by the tmdb edge
--   function using the service role. There are deliberately no client write
--   policies on it.

-- ── profiles: 1:1 with auth.users, auto-created on signup ──────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "profiles: update own" on public.profiles
  for update using ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── films: shared TMDB cache, PK = TMDB movie id ───────────────────────────

create table public.films (
  id bigint primary key,
  title text not null,
  release_date date,
  poster_path text,
  backdrop_path text,
  runtime int,
  overview text,
  genres jsonb,
  tmdb_vote_average numeric(3, 1),
  tmdb_vote_count int,
  cached_at timestamptz not null default now()
);

alter table public.films enable row level security;

create policy "films: authenticated read" on public.films
  for select to authenticated using (true);

-- ── logs: the diary. Append-only event stream of watches ───────────────────

create table public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  film_id bigint not null references public.films (id),
  watched_on date not null default current_date,
  rating smallint check (rating between 1 and 10),
  is_rewatch boolean not null default false,
  review text,
  created_at timestamptz not null default now()
);

create index logs_user_watched_on_idx on public.logs (user_id, watched_on desc);
create index logs_user_film_idx on public.logs (user_id, film_id);

alter table public.logs enable row level security;

create policy "logs: read own" on public.logs
  for select using ((select auth.uid()) = user_id);

create policy "logs: insert own" on public.logs
  for insert with check ((select auth.uid()) = user_id);

create policy "logs: update own" on public.logs
  for update using ((select auth.uid()) = user_id);

create policy "logs: delete own" on public.logs
  for delete using ((select auth.uid()) = user_id);

-- ── watchlist: one row per saved film ──────────────────────────────────────

create table public.watchlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  film_id bigint not null references public.films (id),
  created_at timestamptz not null default now(),
  primary key (user_id, film_id)
);

alter table public.watchlist enable row level security;

create policy "watchlist: read own" on public.watchlist
  for select using ((select auth.uid()) = user_id);

create policy "watchlist: insert own" on public.watchlist
  for insert with check ((select auth.uid()) = user_id);

create policy "watchlist: delete own" on public.watchlist
  for delete using ((select auth.uid()) = user_id);

-- ── my_film_ratings: latest rating per film for the "my rating" pill ───────
-- security_invoker makes the view run under the caller's RLS, so it only
-- ever returns the requesting user's own logs.

create view public.my_film_ratings
with (security_invoker = true) as
select distinct on (user_id, film_id)
  user_id,
  film_id,
  id as log_id,
  rating,
  watched_on
from public.logs
order by user_id, film_id, watched_on desc, created_at desc;
