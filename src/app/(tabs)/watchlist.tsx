import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWatchlist } from '@/lib/queries/watchlist';
import { posterUrl } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

export default function WatchlistScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const watchlist = useWatchlist();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <Text className="px-4 pb-2 pt-2 text-2xl font-bold text-text-primary">
        Watchlist
      </Text>

      {watchlist.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors['--color-text-muted']} />
        </View>
      ) : (
        <FlatList
          data={watchlist.data}
          keyExtractor={(item) => String(item.film_id)}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text className="px-8 pt-16 text-center text-sm text-text-faint">
              No saved films yet. Tap the bookmark on any film to add it here.
            </Text>
          }
          renderItem={({ item }) => {
            const uri = posterUrl(item.films?.poster_path ?? null);
            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/movie/[id]',
                    params: { id: String(item.film_id) },
                  })
                }
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
