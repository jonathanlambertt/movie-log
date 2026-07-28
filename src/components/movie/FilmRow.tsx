import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { RatingPill } from '@/components/rating/RatingPill';
import { posterUrl } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

const POSTER_W = 48;
const POSTER_H = 72;

type Props = {
  filmId: number;
  title: string;
  posterPath: string | null;
  /** Release year, already sliced from the release date. */
  year: string | null;
  /** Secondary line: watch date in the diary, date added on the watchlist. */
  dateLabel: string | null;
  /** The user's rating, shown as a pill on the right. null = unrated. */
  rating: number | null;
  /** Optional marker beside the date, e.g. the diary's rewatch indicator. */
  badge?: ReactNode;
  onPress: () => void;
};

// Shared list row for films that live in the database: diary entries and the
// watchlist's list view. Poster, title + year, a date line, and the rating.
export function FilmRow({
  filmId,
  title,
  posterPath,
  year,
  dateLabel,
  rating,
  badge,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const uri = posterUrl(posterPath, 'w185');

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-2 active:bg-surface"
    >
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
        {dateLabel || badge ? (
          <View className="mt-0.5 flex-row items-center gap-2">
            {dateLabel ? (
              <Text className="text-sm text-text-muted">{dateLabel}</Text>
            ) : null}
            {badge}
          </View>
        ) : null}
      </View>

      {rating != null && <RatingPill rating={rating} />}
    </Pressable>
  );
}
