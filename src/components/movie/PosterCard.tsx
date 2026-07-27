import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { posterUrl, type TmdbMovie } from '@/lib/tmdb';

export function PosterCard({
  movie,
  onPress,
}: {
  movie: TmdbMovie;
  onPress?: () => void;
}) {
  const uri = posterUrl(movie.posterPath);

  return (
    <Pressable onPress={onPress} className="w-1/3 p-1 active:opacity-80">
      <View className="aspect-[2/3] overflow-hidden rounded-lg bg-surface">
        {uri ? (
          <Image
            source={{ uri }}
            style={{ flex: 1 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-2">
            <Text className="text-center text-xs text-text-faint">
              {movie.title}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
