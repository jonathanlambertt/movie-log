import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { tmdbApi } from '@/lib/tmdb';

// The user's current rating for a film, independent of watch history.
// null = not rated. RLS scopes the row to the caller.
export function useMyRating(filmId: number) {
  return useQuery({
    queryKey: ['ratings', filmId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('film_id', filmId)
        .maybeSingle();
      if (error) throw error;
      return data?.rating ?? null;
    },
  });
}

// Every rating the user has, keyed by film id — one round trip for a whole
// list instead of a query per row. Shares the ['ratings'] key prefix so the
// rating mutations invalidate it too.
export function useMyRatings() {
  return useQuery({
    queryKey: ['ratings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('film_id, rating');
      if (error) throw error;
      return new Map((data ?? []).map((r) => [r.film_id, r.rating]));
    },
  });
}

type SetRatingInput = {
  userId: string;
  filmId: number;
  rating: number;
};

// Upsert so re-rating a film overwrites in place — ratings is the user's
// current opinion, not an event stream.
//
// Assumes the film is already in the films cache. Callers that can't guarantee
// that should use upsertRating instead.
export async function writeRating({ userId, filmId, rating }: SetRatingInput) {
  const { error } = await supabase.from('ratings').upsert(
    {
      user_id: userId,
      film_id: filmId,
      rating,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,film_id' },
  );
  if (error) throw error;
}

export async function upsertRating(input: SetRatingInput) {
  // Cache the film row first (edge function upserts via service role) so the
  // ratings → films foreign key is satisfied.
  await tmdbApi.movie(input.filmId, { cache: true });
  await writeRating(input);
}

export function useSetRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}

export function useRemoveRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (filmId: number) => {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('film_id', filmId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}
