-- profiles.bio: a short self-description shown on the profile screen.
--
-- The length cap is a backstop only — the editor enforces the same limit with
-- maxLength, so hitting this check means something bypassed the UI.
--
-- No new policies: "profiles: read own" and "profiles: update own" from the
-- initial schema already cover this column.

alter table public.profiles
  add column bio text check (char_length(bio) <= 240);
