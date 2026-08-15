import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { WatchlistGrid } from '@/components/watchlist/WatchlistGrid';
import { useWatchlist } from '@/lib/queries/watchlist';
import { useTheme } from '@/theme/ThemeProvider';

// Same watchlist as the tab, reached from the profile instead — a pushed
// screen with a back button rather than a tab switch.
export default function ProfileWatchlistScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const watchlist = useWatchlist();

  const { refetch } = watchlist;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const openFilm = (filmId: number) =>
    router.push({ pathname: '/movie/[id]', params: { id: String(filmId) } });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-2 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          className="p-1 active:opacity-60"
        >
          <ChevronLeft size={26} color={colors['--color-text-primary']} />
        </Pressable>
        <Text className="text-2xl font-bold text-text-primary">Watchlist</Text>
      </View>

      <WatchlistGrid
        items={watchlist.data}
        loading={watchlist.isLoading}
        onOpenFilm={openFilm}
        onFindSomething={() => router.navigate('/')}
      />
    </SafeAreaView>
  );
}
