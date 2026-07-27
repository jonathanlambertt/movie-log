// TMDB proxy. Runs on Supabase Edge Functions (Deno).
//
// Why a proxy at all: the TMDB token stays server-side (never in the app
// bundle), responses are normalized to a slim shape, and this function is
// the ONLY writer of the shared `films` cache table — clients have no write
// policies on it. JWT verification is on by default, so only signed-in app
// users can call this.
//
// Routes (relative to /tmdb):
//   GET /trending            → popular-this-week grid
//   GET /search?query=...    → movie search
//   GET /movie/:id[?cache=true] → details; cache=true upserts the films row

import { createClient } from 'npm:@supabase/supabase-js@2';

const TMDB_BASE = 'https://api.themoviedb.org/3';

const tmdbToken = Deno.env.get('TMDB_API_KEY');

// Service-role client for films cache writes (bypasses RLS by design).
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// deno-lint-ignore no-explicit-any
function slim(movie: any) {
  return {
    id: movie.id,
    title: movie.title,
    releaseDate: movie.release_date || null,
    posterPath: movie.poster_path ?? null,
    backdropPath: movie.backdrop_path ?? null,
    overview: movie.overview ?? '',
    voteAverage: movie.vote_average ?? 0,
    voteCount: movie.vote_count ?? 0,
    runtime: movie.runtime ?? null,
    genres: movie.genres ?? null,
  };
}

async function tmdb(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tmdbToken}` },
  });
  if (!res.ok) {
    throw new Error(`TMDB responded ${res.status} for ${path}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    // pathname is /tmdb/<route...>
    const route = url.pathname.split('/').filter(Boolean).slice(1);

    if (route[0] === 'trending') {
      const data = await tmdb('/trending/movie/week');
      // deno-lint-ignore no-explicit-any
      return Response.json({ results: data.results.map((m: any) => slim(m)) });
    }

    if (route[0] === 'search') {
      const query = url.searchParams.get('query')?.trim() ?? '';
      if (!query) {
        return Response.json({ results: [] });
      }
      const data = await tmdb('/search/movie', { query });
      // deno-lint-ignore no-explicit-any
      return Response.json({ results: data.results.map((m: any) => slim(m)) });
    }

    if (route[0] === 'movie' && route[1]) {
      const movie = await tmdb(`/movie/${encodeURIComponent(route[1])}`);

      // cache-on-entry: called with ?cache=true when a film is logged or
      // watchlisted, so diary/watchlist can render without TMDB.
      if (url.searchParams.get('cache') === 'true') {
        const { error } = await admin.from('films').upsert({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date || null,
          poster_path: movie.poster_path ?? null,
          backdrop_path: movie.backdrop_path ?? null,
          runtime: movie.runtime ?? null,
          overview: movie.overview ?? '',
          genres: movie.genres ?? null,
          tmdb_vote_average: movie.vote_average ?? null,
          tmdb_vote_count: movie.vote_count ?? null,
          cached_at: new Date().toISOString(),
        });
        if (error) {
          throw error;
        }
      }

      return Response.json(slim(movie));
    }

    return Response.json({ error: 'not found' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
});
