import { Image } from 'expo-image';
import { Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
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
  /** The user's rating, shown as a scored chip under the title. null = unrated. */
  rating: number | null;
  /** Optional marker beside the rating, e.g. the diary's rewatch indicator. */
  badge?: ReactNode;
  onPress: () => void;
};

// A diary entry: day number in a leading rail, then poster, then title with the
// rating beneath it.
//
// The rating chip reads as a score rather than a stray number: a filled star
// marks it as MY rating, and the "/10" gives the bare digit a scale. Text stays
// in the primary token so it's legible at any value — the ramp color rides on
// the star alone. (Earlier passes colored the digit itself, which is hard to
// read at the low end, and a fully ramp-filled pill made a wall of saturation
// one row after another.)
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
          <View className="mt-1.5 flex-row items-center gap-2">
            {rating != null ? (
              // surface-alt, not surface: the row's active state is bg-surface,
              // which would swallow the chip on press.
              <View className="flex-row items-baseline gap-1 rounded-md bg-surface-alt py-0.5 pl-1.5 pr-2">
                <Star
                  size={11}
                  color={ratingColor(rating, resolved)}
                  fill={ratingColor(rating, resolved)}
                  // Baseline alignment works on the text, not the SVG box, so
                  // nudge the star down onto the digits' baseline.
                  style={{ alignSelf: 'center', marginTop: 1 }}
                />
                <Text className="text-sm font-bold text-text-primary">{rating}</Text>
                <Text className="text-[11px] font-medium text-text-faint">/10</Text>
              </View>
            ) : null}
            {badge}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
