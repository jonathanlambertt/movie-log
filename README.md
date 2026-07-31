# Cinebook

A mobile-first movie logging app — a personal, single-player film diary
(think Letterboxd, minus the social layer). Log films you've watched with a
1–10 rating, keep a watchlist, and see your rating history over time.

The app ships as **Cinebook** — both the home-screen name and the wordmark.
`movielog` survives as the repo, package name, Expo slug, and bundle identifier;
those are identifiers tied to EAS and App Store Connect, so they stay put.

Built with Expo + React Native, styled with NativeWind, backed by Supabase,
with movie metadata from TMDB.

> **Status:** MVP feature-complete and in polish. Auth, search, movie detail,
> the log flow, diary, watchlist, profile stats, and settings all work, and EAS
> build profiles are configured for on-device testing; remaining work is
> refinement (see Not yet wired below).

## Stack

| Area | Choice |
| --- | --- |
| App | Expo (SDK 57), React Native 0.86, TypeScript |
| Navigation | Expo Router (file-based, custom tab bar) |
| Styling | NativeWind v4 (Tailwind), semantic theme tokens, dark/light |
| Type | Vadelma Medium (expo-font) for the Cinebook wordmark |
| Animation | Reanimated 4, Gesture Handler, expo-haptics |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Data fetching | TanStack Query |
| Movie data | TMDB, proxied through a Supabase Edge Function |
| Builds | EAS Build (dev client, internal-distribution preview, production) |
| OTA | EAS Update (expo-updates), runtime version tied to `version` |

## MVP scope

- **Auth**: email/password sign-in and sign-up, with friendly handling of
  already-registered emails and pending email confirmation
- **Search** films via TMDB (empty state = popular this week)
- **Rate** any film without logging a watch — tap the rating row on film detail
- **Log** a film: watch date, 1–10 rating, rewatch flag, optional review
- **Diary**: reverse-chron log of watches, grouped by month (append-only —
  a rewatch is a new row, so rating history is preserved)
- **Watchlist**: one-tap toggle from any film, shown as a four-column poster grid
- **Profile**: identity (initials avatar, display name, `@username`, a short
  bio) above a three-up stat strip — distinct films, films this year, and average
  rating (tinted with the rating ramp)
- **Edit profile** (modal from the button under your bio): display name,
  username, and a 240-char bio, all stored on the `profiles` row
- **Settings** (gear on Profile): account email, appearance override —
  system / light / dark — and sign out
- Your rating shows as a colored pill on the movie detail screen and diary rows

### Not yet wired

- Rating pills on the poster grids (search and watchlist) — the grids show bare
  posters
- Community average is hidden in the UI for now (the data still flows from TMDB)
- Avatars are initials only — `profiles.avatar_url` has no upload path yet (that
  needs an image picker plus a Storage bucket, so a new native build)
- Profiles are readable only by their owner (`profiles: read own`), so usernames
  aren't public and there's no way to view someone else's profile yet. The
  profile components all take a profile + stats object as props, so the screen
  itself is ready for it

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

## Device builds (EAS)

`eas.json` defines three profiles:

| Profile | What it is |
| --- | --- |
| `development` | Dev client, internal distribution — for running the JS bundle on a real device |
| `preview` | Internal-distribution release build, auto-incrementing version |
| `production` | Store build, auto-incrementing version |

Each profile pulls its `EXPO_PUBLIC_*` values from the matching **EAS
environment** (`development` / `preview` / `production`) rather than the local
`.env`, so those variables have to exist server-side before a build:

```bash
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value https://<your-ref>.supabase.co
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <your-publishable-key>

eas build --profile preview --platform ios
```

Version numbers come from EAS (`appVersionSource: "remote"`), not `app.json`.

### Over-the-air updates

JS-only changes don't need a rebuild — each build profile subscribes to the
channel of the same name:

```bash
eas update --channel preview --platform ios --message "what changed" --environment preview
```

`--environment` is required as of SDK 55+. The project is iOS-only
(`"platforms": ["ios"]` in `app.json`); re-adding Android means restoring the
`android` block with its `package` and putting `"android"` back in `platforms`.

`runtimeVersion` follows the `appVersion` policy, so bumping `version` in
`app.json` requires a new native build before updates flow again. Adding a
native module always requires one — as does changing anything baked into the
binary at build time, including the app `name`, icon, and splash screen.

## Project structure

```
src/
  app/              # Expo Router routes (file-based)
    (auth)/         #   sign-in / sign-up
    (tabs)/         #   Search, Diary, Watchlist, Profile
    movie/[id].tsx  #   film detail (rate, log, watchlist toggle)
    log/            #   log flow (modal): index = pick film, [filmId] = rate & save
    rate/[filmId]   #   rate a film (modal) without logging a watch
    settings.tsx    #   appearance override + sign out
  components/       # UI, tab bar, rating (scrubber + pill), movie (rows, poster)
  lib/              # supabase client, tmdb wrappers, query hooks, db types
  providers/        # session provider
  theme/            # color tokens, ThemeProvider, rating ramp
assets/
  fonts/            # Vadelma-Medium.otf (wordmark)
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
- **Ratings vs logs**: `ratings` is the mutable counterpart — one row per
  (user, film) holding your *current* opinion, so you can rate a film you
  haven't logged. Saving a log writes both: the log keeps its own historical
  rating for the diary, while `ratings` stays the single source of truth for
  the "your rating" pill.
- **Row-level security**: every user-data table is scoped to `auth.uid()`; the
  shared `films` cache is read-only to clients and written only by the edge
  function's service role.
- **TMDB key** never ships in the app bundle — all TMDB access goes through the
  authenticated edge function.
- **Fonts**: the root layout blocks render until `Vadelma-Medium` is loaded, so
  the wordmark never flashes in a fallback face.
- **Auth routing** is declarative: `Stack.Protected` guards on the session mean
  signing in or out swaps the stack automatically — no imperative navigation.
