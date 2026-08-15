import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import { useWatchlist } from '@/lib/queries/watchlist';
import { posterUrl } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

export default function WatchlistScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const watchlist = useWatchlist();

  // Refetch when the tab regains focus so changes made elsewhere (e.g. the
  // watchlist toggle on a film's detail screen) show up without a reload.
  const { refetch } = watchlist;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const openFilm = (filmId: number) =>
    router.push({ pathname: '/movie/[id]', params: { id: String(filmId) } });

  const isEmpty = !watchlist.data?.length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-4 pb-2 pt-2">
        <Text className="text-2xl font-bold text-text-primary">Watchlist</Text>
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
      ) : (
        <FlatList
          data={watchlist.data}
          keyExtractor={(item) => String(item.film_id)}
          numColumns={4}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const uri = posterUrl(item.films?.poster_path ?? null);
            return (
              <Pressable
                onPress={() => openFilm(item.film_id)}
                className="w-1/4 p-1 active:opacity-80"
              >
                <View className="aspect-[2/3] overflow-hidden rounded-lg bg-surface">
                  {uri ? (
                    <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center p-2">
                      <Text className="text-center text-[10px] text-text-faint">
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
