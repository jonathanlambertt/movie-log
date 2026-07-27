import { useQuery } from '@tanstack/react-query';

import { tmdbApi } from '@/lib/tmdb';

export function useTrending() {
  return useQuery({
    queryKey: ['tmdb', 'trending'],
    queryFn: tmdbApi.trending,
    staleTime: 30 * 60 * 1000, // "popular this week" doesn't need to be fresher
  });
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['tmdb', 'movie', id],
    queryFn: () => tmdbApi.movie(id),
    staleTime: 60 * 60 * 1000, // details rarely change
  });
}

export function useMovieSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['tmdb', 'search', trimmed],
    queryFn: () => tmdbApi.search(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 5 * 60 * 1000,
    // Keep showing the previous results while the next keystroke's query
    // loads, so the grid doesn't flash empty on every character.
    placeholderData: (previous) => previous,
  });
}
