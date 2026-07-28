-- Standalone ratings: rate a film without logging a watch.
--
-- Design notes:
-- * ratings is MUTABLE — one row per (user, film) holding the user's current
--   opinion. This is deliberately the opposite of logs, which stays an
--   append-only record of watches with its own historical rating per row.
-- * Both write paths keep it current: rating a film upserts here, and saving a
--   log upserts here too. That makes ratings the single source of truth for
--   "your rating", which is why my_film_ratings is dropped below.

create table public.ratings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  film_id bigint not null references public.films (id),
  rating smallint not null check (rating between 1 and 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, film_id)
);

alter table public.ratings enable row level security;

create policy "ratings: read own" on public.ratings
  for select using ((select auth.uid()) = user_id);

create policy "ratings: insert own" on public.ratings
  for insert with check ((select auth.uid()) = user_id);

create policy "ratings: update own" on public.ratings
  for update using ((select auth.uid()) = user_id);

create policy "ratings: delete own" on public.ratings
  for delete using ((select auth.uid()) = user_id);

-- ── Backfill from existing logs ────────────────────────────────────────────
-- Seed each user's current rating from their most recent rated log, using the
-- same "latest log per film" ordering my_film_ratings used.

insert into public.ratings (user_id, film_id, rating, updated_at)
select distinct on (user_id, film_id)
  user_id,
  film_id,
  rating,
  created_at
from public.logs
where rating is not null
order by user_id, film_id, watched_on desc, created_at desc
on conflict (user_id, film_id) do nothing;

-- ── Retire the view ────────────────────────────────────────────────────────
-- ratings now answers "what did I rate this film?" on its own; keeping the
-- view would leave two sources of truth that can disagree.

drop view public.my_film_ratings;
