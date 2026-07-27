import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { tmdbApi } from '@/lib/tmdb';

// A watchlist entry joined with its cached film row (for the Watchlist tab).
export type WatchlistItem = {
  film_id: number;
  created_at: string;
  films: {
    id: number;
    title: string;
    release_date: string | null;
    poster_path: string | null;
    tmdb_vote_average: number | null;
  } | null;
};

export function useIsWatchlisted(filmId: number) {
  return useQuery({
    queryKey: ['watchlist', 'has', filmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('film_id')
        .eq('film_id', filmId)
        .maybeSingle();
      if (error) throw error;
      return data != null;
    },
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select(
          'film_id, created_at, films(id, title, release_date, poster_path, tmdb_vote_average)',
        )
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as WatchlistItem[];
    },
  });
}

type ToggleInput = {
  userId: string;
  filmId: number;
  isWatchlisted: boolean;
};

export function useToggleWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, filmId, isWatchlisted }: ToggleInput) => {
      if (isWatchlisted) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('film_id', filmId);
        if (error) throw error;
      } else {
        // Cache the film first so the watchlist → films FK is satisfied.
        await tmdbApi.movie(filmId, { cache: true });
        const { error } = await supabase
          .from('watchlist')
          .insert({ user_id: userId, film_id: filmId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}
