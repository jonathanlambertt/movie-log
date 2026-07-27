import { supabase } from './supabase';

// Slim movie shape returned by the tmdb edge function (see
// supabase/functions/tmdb/index.ts — the two must stay in sync).
export type TmdbMovie = {
  id: number;
  title: string;
  releaseDate: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  voteCount: number;
  runtime: number | null;
  genres: { id: number; name: string }[] | null;
};

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(
  path: string | null,
  width: 'w185' | 'w342' | 'w500' = 'w342',
) {
  return path ? `${IMAGE_BASE}/${width}${path}` : null;
}

export function backdropUrl(
  path: string | null,
  width: 'w780' | 'w1280' = 'w780',
) {
  return path ? `${IMAGE_BASE}/${width}${path}` : null;
}

async function invokeTmdb<T>(path: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(`tmdb/${path}`, {
    method: 'GET',
  });
  if (error) {
    throw error;
  }
  return data as T;
}

export const tmdbApi = {
  trending: () => invokeTmdb<{ results: TmdbMovie[] }>('trending'),
  search: (query: string) =>
    invokeTmdb<{ results: TmdbMovie[] }>(
      `search?query=${encodeURIComponent(query)}`,
    ),
  /** cache: true also upserts the films row — call when logging/watchlisting. */
  movie: (id: number, options?: { cache?: boolean }) =>
    invokeTmdb<TmdbMovie>(`movie/${id}${options?.cache ? '?cache=true' : ''}`),
};
