import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, ChevronRight, Heart, Plus } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingPill } from '@/components/rating/RatingPill';
import { useMovie } from '@/lib/queries/movies';
import { useMyRating } from '@/lib/queries/ratings';
import { useIsWatchlisted, useToggleWatchlist } from '@/lib/queries/watchlist';
import { backdropUrl, posterUrl } from '@/lib/tmdb';
import { useSession } from '@/providers/SessionProvider';
import { useTheme } from '@/theme/ThemeProvider';

function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function MovieDetail() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Number(idParam);

  const router = useRouter();
  const { colors } = useTheme();
  const { session } = useSession();

  const movie = useMovie(id);
  const myRating = useMyRating(id);
  const watchlisted = useIsWatchlisted(id);
  const toggleWatchlist = useToggleWatchlist();

  const onToggleWatchlist = () => {
    if (!session) return;
    toggleWatchlist.mutate({
      userId: session.user.id,
      filmId: id,
      isWatchlisted: watchlisted.data ?? false,
    });
  };

  // Both modals take the same film params, so the detail screen can hand off
  // without either flow needing to refetch the film.
  const filmParams = () =>
    movie.data && {
      filmId: String(movie.data.id),
      title: movie.data.title,
      poster: movie.data.posterPath ?? '',
      releaseDate: movie.data.releaseDate ?? '',
    };

  const openLog = () => {
    const params = filmParams();
    if (!params) return;
    router.push({ pathname: '/log/[filmId]', params });
  };

  const openRate = () => {
    const params = filmParams();
    if (!params) return;
    router.push({ pathname: '/rate/[filmId]', params });
  };

  if (movie.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors['--color-text-muted']} />
      </View>
    );
  }

  if (movie.isError || !movie.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center text-sm text-text-muted">
          Couldn&apos;t load this film.
        </Text>
      </SafeAreaView>
    );
  }

  const film = movie.data;
  const backdrop = backdropUrl(film.backdropPath);
  const poster = posterUrl(film.posterPath, 'w342');
  const year = film.releaseDate ? film.releaseDate.slice(0, 4) : null;
  const runtime = formatRuntime(film.runtime);
  const genres = film.genres?.map((g) => g.name).join(', ') ?? null;
  const isSaved = watchlisted.data ?? false;

  const meta = [year, runtime].filter(Boolean).join(' · ');

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Backdrop */}
        <View className="aspect-video w-full bg-surface">
          {backdrop ? (
            <Image source={{ uri: backdrop }} style={{ flex: 1 }} contentFit="cover" />
          ) : null}
        </View>

        {/* Back button over the backdrop */}
        <SafeAreaView
          edges={['top']}
          className="absolute left-0 right-0 top-0"
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => router.back()}
            className="m-3 h-9 w-9 items-center justify-center rounded-full bg-black/40 active:opacity-70"
          >
            <ChevronLeft size={22} color="#ffffff" />
          </Pressable>
        </SafeAreaView>

        <View className="gap-5 px-5 pt-4">
          {/* Poster + title */}
          <View className="flex-row gap-4">
            <View className="-mt-16 h-36 w-24 overflow-hidden rounded-lg border border-border bg-surface">
              {poster ? (
                <Image source={{ uri: poster }} style={{ flex: 1 }} contentFit="cover" />
              ) : null}
            </View>
            <View className="flex-1 pt-2">
              <Text className="text-2xl font-bold text-text-primary">{film.title}</Text>
              {meta ? <Text className="mt-1 text-sm text-text-muted">{meta}</Text> : null}
              {genres ? (
                <Text className="mt-1 text-sm text-text-faint">{genres}</Text>
              ) : null}
            </View>
          </View>

          {/* Your rating — tap to rate without logging a watch */}
          <Pressable
            onPress={openRate}
            accessibilityRole="button"
            accessibilityLabel={
              myRating.data != null ? 'Change your rating' : 'Rate this film'
            }
            className="flex-row items-center justify-between gap-2 rounded-xl border border-border bg-surface px-5 py-4 active:opacity-70"
          >
            <View className="flex-row items-center gap-2">
              {myRating.data != null ? (
                <>
                  <Text className="text-[17px] font-bold text-text-primary">
                    Your rating
                  </Text>
                  <RatingPill rating={myRating.data} />
                </>
              ) : (
                <>
                  <Heart size={20} color={colors['--color-text-primary']} strokeWidth={2.4} />
                  <Text className="text-[17px] font-bold text-text-primary">
                    Rate this film
                  </Text>
                </>
              )}
            </View>
            <ChevronRight size={18} color={colors['--color-text-faint']} />
          </Pressable>

          {/* Overview */}
          {film.overview ? (
            <Text className="text-[15px] leading-6 text-text-primary">
              {film.overview}
            </Text>
          ) : null}

          {/* Actions */}
          <View className="flex-row gap-3 pt-1">
            <Pressable
              onPress={openLog}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:opacity-90"
            >
              <Plus size={18} color={colors['--color-on-primary']} strokeWidth={2.6} />
              <Text className="text-[15px] font-bold text-on-primary">Log</Text>
            </Pressable>

            <Pressable
              onPress={onToggleWatchlist}
              disabled={watchlisted.isLoading}
              style={isSaved ? { backgroundColor: colors['--color-text-primary'] } : undefined}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-text-primary py-3.5 active:opacity-90"
            >
              <Bookmark
                size={18}
                color={isSaved ? colors['--color-background'] : colors['--color-text-primary']}
                fill={isSaved ? colors['--color-background'] : 'transparent'}
              />
              <Text
                style={{
                  color: isSaved ? colors['--color-background'] : colors['--color-text-primary'],
                }}
                className="text-[15px] font-bold"
              >
                {isSaved ? 'On watchlist' : 'Watchlist'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
