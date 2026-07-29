import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { posterUrl } from '@/lib/tmdb';
import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

const POSTER_W = 48;
const POSTER_H = 72;

type Props = {
  filmId: number;
  title: string;
  posterPath: string | null;
  /** Release year, already sliced from the release date. */
  year: string | null;
  /** Day of the month, in a leading rail. The month lives in the section header. */
  day: string | null;
  /** The user's rating, in ramp color under the title. null = unrated. */
  rating: number | null;
  /** Optional marker beside the rating, e.g. the diary's rewatch indicator. */
  badge?: ReactNode;
  onPress: () => void;
};

// A diary entry: day number in a leading rail, then poster, then title with the
// rating beneath it.
//
// The rating is a bare ramp-colored number rather than a filled pill — at one
// per row a wall of saturated chips overwhelmed the list, so the color is kept
// but dialed down to just the glyph.
export function FilmRow({
  filmId,
  title,
  posterPath,
  year,
  day,
  rating,
  badge,
  onPress,
}: Props) {
  const { colors, resolved } = useTheme();
  const uri = posterUrl(posterPath, 'w185');

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-2 active:bg-surface"
    >
      {day ? (
        <Text className="w-7 text-center text-xl font-bold text-text-muted">{day}</Text>
      ) : null}

      {uri ? (
        <Image
          source={{ uri }}
          // Radius on the image itself (not an overflow-hidden wrapper) avoids
          // the thin edge seam corner-clipping leaves. recyclingKey keeps the
          // list from flashing a recycled image while scrolling.
          recyclingKey={String(filmId)}
          style={{
            width: POSTER_W,
            height: POSTER_H,
            borderRadius: 6,
            backgroundColor: colors['--color-surface'],
          }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: POSTER_W, height: POSTER_H, borderRadius: 6 }}
          className="bg-surface"
        />
      )}

      <View className="flex-1">
        <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
          {title}
          {year ? <Text className="font-normal text-text-faint">  {year}</Text> : null}
        </Text>
        {rating != null || badge ? (
          <View className="mt-1 flex-row items-center gap-2">
            {rating != null ? (
              <Text
                style={{ color: ratingColor(rating, resolved) }}
                className="text-sm font-bold"
              >
                {rating}
              </Text>
            ) : null}
            {badge}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
