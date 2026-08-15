import { Image } from 'expo-image';
import { Bookmark } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import type { WatchlistItem } from '@/lib/queries/watchlist';
import { posterUrl } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  items: WatchlistItem[] | undefined;
  loading: boolean;
  onOpenFilm: (filmId: number) => void;
  onFindSomething: () => void;
};

// Poster grid for a saved-films list. Kept separate from its screen so a
// future public profile can render someone else's watchlist the same way.
export function WatchlistGrid({ items, loading, onOpenFilm, onFindSomething }: Props) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors['--color-text-muted']} />
      </View>
    );
  }

  if (!items?.length) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing saved yet"
        message="Keep track of what you want to watch next — tap the bookmark on any film to save it here."
        actionTitle="Find something to watch"
        onAction={onFindSomething}
      />
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.film_id)}
      numColumns={4}
      contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
      renderItem={({ item }) => {
        const uri = posterUrl(item.films?.poster_path ?? null);
        return (
          <Pressable
            onPress={() => onOpenFilm(item.film_id)}
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
  );
}
