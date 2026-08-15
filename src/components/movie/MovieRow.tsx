import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { posterUrl, type TmdbMovie } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  movie: TmdbMovie;
  onPress: () => void;
};

const POSTER_W = 64;
const POSTER_H = 96;

export function MovieRow({ movie, onPress }: Props) {
  const { colors } = useTheme();
  const uri = posterUrl(movie.posterPath, 'w185');
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-2.5 active:bg-surface"
    >
      {uri ? (
        <Image
          source={{ uri }}
          // Radius on the image itself (not an overflow-hidden wrapper) avoids
          // the thin edge seam that corner-clipping leaves. recyclingKey keeps
          // FlatList from briefly showing a recycled image's edge while scrolling.
          recyclingKey={String(movie.id)}
          style={{
            width: POSTER_W,
            height: POSTER_H,
            borderRadius: 8,
            backgroundColor: colors['--color-surface'],
          }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: POSTER_W, height: POSTER_H, borderRadius: 8 }}
          className="bg-surface"
        />
      )}
      <View className="flex-1">
        <Text className="text-base font-medium text-text-primary" numberOfLines={2}>
          {movie.title}
        </Text>
        {year ? <Text className="mt-0.5 text-sm text-text-muted">{year}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors['--color-text-faint']} />
    </Pressable>
  );
}
