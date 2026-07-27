import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { posterUrl, type TmdbMovie } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  movie: TmdbMovie;
  onPress: () => void;
};

export function MovieRow({ movie, onPress }: Props) {
  const { colors } = useTheme();
  const uri = posterUrl(movie.posterPath, 'w185');
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-2 active:bg-surface"
    >
      <View className="h-16 w-11 overflow-hidden rounded bg-surface">
        {uri ? (
          <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
        ) : null}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
          {movie.title}
        </Text>
        {year ? <Text className="text-sm text-text-muted">{year}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors['--color-text-faint']} />
    </Pressable>
  );
}
