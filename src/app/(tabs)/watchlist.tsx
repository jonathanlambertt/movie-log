import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bookmark, LayoutGrid, List } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilmRow } from '@/components/movie/FilmRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMyRatings } from '@/lib/queries/ratings';
import { useWatchlist } from '@/lib/queries/watchlist';
import { posterUrl } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

type ViewMode = 'grid' | 'list';

const VIEW_MODE_KEY = 'watchlist:viewMode';

// Remembers grid/list across launches. Starts on grid and swaps in the stored
// choice once it loads — a frame of grid beats blocking the whole tab on disk.
function useViewMode() {
  const [mode, setMode] = useState<ViewMode>('grid');

  useEffect(() => {
    AsyncStorage.getItem(VIEW_MODE_KEY).then((stored) => {
      if (stored === 'grid' || stored === 'list') setMode(stored);
    });
  }, []);

  const choose = useCallback((next: ViewMode) => {
    setMode(next);
    AsyncStorage.setItem(VIEW_MODE_KEY, next);
  }, []);

  return [mode, choose] as const;
}

function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const { colors } = useTheme();
  const options: { value: ViewMode; Icon: typeof LayoutGrid; label: string }[] = [
    { value: 'grid', Icon: LayoutGrid, label: 'Grid view' },
    { value: 'list', Icon: List, label: 'List view' },
  ];

  return (
    <View className="flex-row gap-1 rounded-lg bg-surface p-1">
      {options.map(({ value, Icon, label }) => {
        const active = mode === value;
        return (
          <Pressable
            key={value}
            onPress={() => onChange(value)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            className={
              active
                ? 'rounded-md bg-surface-alt px-3 py-1.5'
                : 'rounded-md px-3 py-1.5 active:opacity-60'
            }
          >
            <Icon
              size={18}
              color={
                active ? colors['--color-primary'] : colors['--color-text-faint']
              }
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function addedLabel(iso: string) {
  return `Added ${new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
}

export default function WatchlistScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const watchlist = useWatchlist();
  const ratings = useMyRatings();
  const [mode, setMode] = useViewMode();

  // Refetch when the tab regains focus so changes made elsewhere (e.g. the
  // watchlist toggle on a film's detail screen) show up without a reload.
  const { refetch } = watchlist;
  const refetchRatings = ratings.refetch;
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchRatings();
    }, [refetch, refetchRatings]),
  );

  const openFilm = (filmId: number) =>
    router.push({ pathname: '/movie/[id]', params: { id: String(filmId) } });

  const isEmpty = !watchlist.data?.length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Text className="text-2xl font-bold text-text-primary">Watchlist</Text>
        {isEmpty ? null : <ViewToggle mode={mode} onChange={setMode} />}
      </View>

      {watchlist.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors['--color-text-muted']} />
        </View>
      ) : isEmpty ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          message="Keep track of what you want to watch next — tap the bookmark on any film to save it here."
          actionTitle="Find something to watch"
          onAction={() => router.navigate('/')}
        />
      ) : mode === 'list' ? (
        <FlatList
          // Distinct keys across the two branches: without them React reuses
          // one FlatList instance and mutating numColumns throws an invariant.
          key="list"
          data={watchlist.data}
          keyExtractor={(item) => String(item.film_id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <FilmRow
              filmId={item.film_id}
              title={item.films?.title ?? 'Unknown film'}
              posterPath={item.films?.poster_path ?? null}
              year={item.films?.release_date?.slice(0, 4) ?? null}
              dateLabel={addedLabel(item.created_at)}
              rating={ratings.data?.get(item.film_id) ?? null}
              onPress={() => openFilm(item.film_id)}
            />
          )}
        />
      ) : (
        <FlatList
          key="grid"
          data={watchlist.data}
          keyExtractor={(item) => String(item.film_id)}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const uri = posterUrl(item.films?.poster_path ?? null);
            return (
              <Pressable
                onPress={() => openFilm(item.film_id)}
                className="w-1/3 p-1 active:opacity-80"
              >
                <View className="aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                  {uri ? (
                    <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center p-2">
                      <Text className="text-center text-xs text-text-faint">
                        {item.films?.title}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
