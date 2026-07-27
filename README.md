# movielog

A mobile-first movie logging app — a personal, single-player film diary
(think Letterboxd, minus the social layer). Log films you've watched with a
1–10 rating, keep a watchlist, and see your rating history over time.

Built with Expo + React Native, styled with NativeWind, backed by Supabase,
with movie metadata from TMDB.

> **Status:** MVP in active development. The scaffold (theming, navigation,
> auth, data layer, TMDB proxy, rating input) is in place; feature screens are
> being built out.

## Stack

| Area | Choice |
| --- | --- |
| App | Expo (SDK 57), React Native 0.86, TypeScript |
| Navigation | Expo Router (file-based, custom tab bar) |
| Styling | NativeWind v4 (Tailwind), semantic theme tokens, dark/light |
| Animation | Reanimated 4, Gesture Handler, expo-haptics |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Data fetching | TanStack Query |
| Movie data | TMDB, proxied through a Supabase Edge Function |

## MVP scope

- **Search** films via TMDB (empty state = popular this week)
- **Log** a film: watch date, 1–10 rating, rewatch flag, optional review
- **Diary**: reverse-chron log of watches, grouped by month (append-only —
  a rewatch is a new row, so rating history is preserved)
- **Watchlist**: one-tap toggle from any film
- **Profile**: basic stats (films this year, average rating), theme override
- Your rating shows as a colored pill on films you've logged; community
  average shows in muted text on films you haven't

## Getting started

### Prerequisites

- Node.js 20.19+ (24 recommended — see `.nvmrc`)
- iOS Simulator (Xcode) and/or Android emulator
- A [Supabase](https://supabase.com) project
- A [TMDB](https://www.themoviedb.org/settings/api) API Read Access Token

### 1. Install

```bash
npm install
```

### 2. Environment

Copy the example env and fill in your Supabase project's URL and publishable
(anon) key from **Project Settings → API Keys**:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
```

The TMDB key is **not** stored here — it lives server-side (see below).

### 3. Supabase

Apply the schema and generate types:

```bash
supabase link --project-ref <your-ref>
supabase db push
supabase gen types typescript --linked > src/lib/database.types.ts
```

### 4. TMDB edge function

The TMDB token stays server-side, and the function is the only writer of the
shared `films` cache. Set the secret and deploy:

```bash
supabase secrets set TMDB_API_KEY=<your-tmdb-read-access-token>
supabase functions deploy tmdb
```

### 5. Run

```bash
npm run ios      # or: npm run android
```

## Project structure

```
src/
  app/              # Expo Router routes (file-based)
    (auth)/         #   sign-in / sign-up
    (tabs)/         #   Search, Diary, Watchlist, Profile
    log.tsx         #   log flow (modal sheet)
  components/       # UI, tab bar, rating (scrubber + pill), movie
  lib/              # supabase client, tmdb wrappers, query hooks, db types
  providers/        # session provider
  theme/            # color tokens, ThemeProvider, rating ramp
supabase/
  migrations/       # schema + RLS
  functions/tmdb/   # TMDB proxy (Deno)
```

## Architecture notes

- **Theming**: components use semantic Tailwind tokens (`bg-background`,
  `text-muted`, `primary`…) that resolve to CSS variables injected at runtime
  by `ThemeProvider`, so dark/light switches instantly. Actual hex values live
  only in `src/theme/colors.ts`.
- **Rating colors** are a separate red→amber→green ramp (`src/theme/ratingRamp.ts`),
  never the violet primary.
- **Append-only logs**: the `logs` table is an event stream — rewatches insert
  new rows and never overwrite a rating, preserving history.
- **Row-level security**: every user-data table is scoped to `auth.uid()`; the
  shared `films` cache is read-only to clients and written only by the edge
  function's service role.
- **TMDB key** never ships in the app bundle — all TMDB access goes through the
  authenticated edge function.
