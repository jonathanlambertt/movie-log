import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { posterUrl, type TmdbMovie } from '@/lib/tmdb';

export function PosterCard({ movie }: { movie: TmdbMovie }) {
  const uri = posterUrl(movie.posterPath);

  return (
    <View className="w-1/3 p-1">
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
    </View>
  );
}
