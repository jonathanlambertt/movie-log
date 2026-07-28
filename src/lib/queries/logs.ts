import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { writeRating } from '@/lib/queries/ratings';
import { supabase } from '@/lib/supabase';
import { tmdbApi } from '@/lib/tmdb';

// Has the current user logged this film before? Used to default the rewatch
// toggle. RLS scopes the count to the user's own logs automatically.
export function useHasLoggedFilm(filmId: number) {
  return useQuery({
    queryKey: ['logs', 'hasLogged', filmId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('logs')
        .select('id', { count: 'exact', head: true })
        .eq('film_id', filmId);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
  });
}

// A diary entry: one log joined with its cached film row.
export type DiaryLog = {
  id: string;
  rating: number | null;
  watched_on: string;
  is_rewatch: boolean;
  review: string | null;
  film_id: number;
  films: {
    id: number;
    title: string;
    release_date: string | null;
    poster_path: string | null;
  } | null;
};

// Reverse-chron list of every log (append-only — one row per watch, including
// rewatches), joined with film data for display.
export function useDiary() {
  return useQuery({
    queryKey: ['logs', 'diary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select(
          'id, rating, watched_on, is_rewatch, review, film_id, films(id, title, release_date, poster_path)',
        )
        .order('watched_on', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DiaryLog[];
    },
  });
}

// Basic profile stats. Aggregated client-side — fine for one user's logs, and
// it shares the ['logs'] key so it refreshes whenever a log is created.
export function useProfileStats() {
  return useQuery({
    queryKey: ['logs', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('logs').select('rating, watched_on');
      if (error) throw error;
      const logs = data ?? [];
      const year = String(new Date().getFullYear());
      const thisYear = logs.filter((l) => l.watched_on.startsWith(year)).length;
      const rated = logs.filter((l): l is { rating: number; watched_on: string } => l.rating != null);
      const average =
        rated.length > 0
          ? rated.reduce((sum, l) => sum + l.rating, 0) / rated.length
          : null;
      return { total: logs.length, thisYear, average };
    },
  });
}

type CreateLogInput = {
  userId: string;
  filmId: number;
  watchedOn: string; // YYYY-MM-DD
  rating: number;
  isRewatch: boolean;
  review: string | null;
};

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLogInput) => {
      // Cache the film row first (edge function upserts via service role) so
      // the logs → films foreign key is satisfied and the diary can render
      // without TMDB.
      await tmdbApi.movie(input.filmId, { cache: true });

      const { error } = await supabase.from('logs').insert({
        user_id: input.userId,
        film_id: input.filmId,
        watched_on: input.watchedOn,
        rating: input.rating,
        is_rewatch: input.isRewatch,
        review: input.review,
      });
      if (error) throw error;

      // The watch you just logged is your newest opinion, so it becomes the
      // current rating too. The log keeps its own rating for diary history.
      // The film was cached above, so this skips the TMDB round trip.
      await writeRating({
        userId: input.userId,
        filmId: input.filmId,
        rating: input.rating,
      });
    },
    onSuccess: () => {
      // Refresh anything reading logs (diary, stats, rewatch checks) plus the
      // rating pill, which now reads the ratings table.
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}
