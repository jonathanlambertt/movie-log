import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingScrubber } from '@/components/rating/RatingScrubber';
import { useMyRating, useRemoveRating, useSetRating } from '@/lib/queries/ratings';
import { posterUrl } from '@/lib/tmdb';
import { useSession } from '@/providers/SessionProvider';
import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

// Rate a film without logging a watch. Deliberately just the scrubber — no
// date, rewatch or review, since nothing here claims the film was watched.
export default function RateFilm() {
  const { filmId, title, poster, releaseDate } = useLocalSearchParams<{
    filmId: string;
    title: string;
    poster: string;
    releaseDate: string;
  }>();
  const id = Number(filmId);
  const year = releaseDate ? releaseDate.slice(0, 4) : null;

  const router = useRouter();
  const { resolved } = useTheme();
  const { session } = useSession();

  const myRating = useMyRating(id);
  const setRating = useSetRating();
  const removeRating = useRemoveRating();

  // Null until the user scrubs, so the saved rating shows through as the
  // starting value once it loads and a scrub then takes precedence. Derived
  // rather than synced in an effect, which would flash the empty state first.
  const [scrubbed, setScrubbed] = useState<number | null>(null);
  const rating = scrubbed ?? myRating.data ?? null;

  const save = () => {
    if (rating == null || !session) return;
    setRating.mutate(
      { userId: session.user.id, filmId: id, rating },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
        onError: (error) => {
          Alert.alert('Could not save rating', (error as Error).message);
        },
      },
    );
  };

  const remove = () => {
    removeRating.mutate(id, {
      onSuccess: () => router.back(),
      onError: (error) => {
        Alert.alert('Could not remove rating', (error as Error).message);
      },
    });
  };

  const posterUri = poster ? posterUrl(poster, 'w185') : null;
  const ctaColor = rating != null ? ratingColor(rating, resolved) : undefined;
  const pending = setRating.isPending || removeRating.isPending;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Film header */}
        <View className="flex-row items-center gap-3">
          <View className="h-24 w-16 overflow-hidden rounded-lg bg-surface">
            {posterUri ? (
              <Image source={{ uri: posterUri }} style={{ flex: 1 }} contentFit="cover" />
            ) : null}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-text-primary">{title}</Text>
            {year ? <Text className="text-sm text-text-muted">{year}</Text> : null}
          </View>
        </View>

        <RatingScrubber value={rating} onChange={setScrubbed} showConfirm={false} />

        {/* Save */}
        <Pressable
          disabled={rating == null || pending}
          onPress={save}
          style={ctaColor ? { backgroundColor: ctaColor } : undefined}
          className="items-center rounded-xl bg-surface-alt py-3.5"
        >
          {setRating.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={
                rating != null
                  ? 'text-[15px] font-bold text-white'
                  : 'text-[15px] font-bold text-text-faint'
              }
            >
              {rating != null ? `Save rating · ${rating}` : 'Drag to rate'}
            </Text>
          )}
        </Pressable>

        {myRating.data != null ? (
          <Pressable
            onPress={remove}
            disabled={pending}
            className="items-center py-1 active:opacity-60"
          >
            <Text className="text-sm font-semibold text-text-muted">
              Remove rating
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
