import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingScrubber } from '@/components/rating/RatingScrubber';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { useCreateLog, useHasLoggedFilm } from '@/lib/queries/logs';
import { posterUrl } from '@/lib/tmdb';
import { useSession } from '@/providers/SessionProvider';
import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatWatched(date: Date) {
  const today = startOfDay(new Date());
  const diff = Math.round(
    (startOfDay(date).getTime() - today.getTime()) / 86_400_000,
  );
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Step 2 of the log flow: rate the picked film and save. The rating is
// required; date defaults to today; rewatch defaults on if already logged.
export default function LogRateFilm() {
  const { filmId, title, poster, releaseDate } = useLocalSearchParams<{
    filmId: string;
    title: string;
    poster: string;
    releaseDate: string;
  }>();
  const id = Number(filmId);
  const year = releaseDate ? releaseDate.slice(0, 4) : null;

  const router = useRouter();
  const { resolved, colors } = useTheme();
  const { session } = useSession();

  const [rating, setRating] = useState<number | null>(null);
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [rewatch, setRewatch] = useState(false);
  const [review, setReview] = useState('');

  const hasLogged = useHasLoggedFilm(id);
  const createLog = useCreateLog();

  // Default the rewatch toggle on once we know they've logged it before.
  useEffect(() => {
    if (hasLogged.data) setRewatch(true);
  }, [hasLogged.data]);

  const isToday = toISODate(date) === toISODate(startOfDay(new Date()));
  const shiftDay = (delta: number) => {
    setDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return startOfDay(next);
    });
  };

  const save = () => {
    if (rating == null || !session) return;
    createLog.mutate(
      {
        userId: session.user.id,
        filmId: id,
        watchedOn: toISODate(date),
        rating,
        isRewatch: rewatch,
        review: review.trim() || null,
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.dismissAll();
        },
        onError: (error) => {
          Alert.alert('Could not log film', (error as Error).message);
        },
      },
    );
  };

  const posterUri = poster ? posterUrl(poster, 'w185') : null;
  const ctaColor = rating != null ? ratingColor(rating, resolved) : undefined;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Rating */}
          <RatingScrubber value={rating} onChange={setRating} showConfirm={false} />

          {/* Watched date */}
          <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <Text className="text-text-muted">Watched</Text>
            <View className="flex-row items-center gap-5">
              <Pressable onPress={() => shiftDay(-1)} className="active:opacity-60">
                <ChevronLeft size={20} color={colors['--color-text-primary']} />
              </Pressable>
              <Text className="min-w-[92px] text-center font-medium text-text-primary">
                {formatWatched(date)}
              </Text>
              <Pressable
                onPress={() => shiftDay(1)}
                disabled={isToday}
                className="active:opacity-60"
              >
                <ChevronRight
                  size={20}
                  color={isToday ? colors['--color-text-faint'] : colors['--color-text-primary']}
                />
              </Pressable>
            </View>
          </View>

          {/* Rewatch */}
          <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <Text className="text-text-muted">Rewatch</Text>
            <Switch
              value={rewatch}
              onValueChange={setRewatch}
              trackColor={{ true: colors['--color-primary'] }}
            />
          </View>

          {/* Review */}
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="Add a review (optional)"
            placeholderTextColor={colors['--color-text-faint']}
            multiline
            textAlignVertical="top"
            className="min-h-[88px] rounded-xl border border-border bg-surface p-4 text-base text-text-primary"
          />

          {/* Save */}
          <Pressable
            disabled={rating == null || createLog.isPending}
            onPress={save}
            style={ctaColor ? { backgroundColor: ctaColor } : undefined}
            className="items-center rounded-xl bg-surface-alt py-3.5"
          >
            {createLog.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text
                className={
                  rating != null
                    ? 'text-[15px] font-bold text-white'
                    : 'text-[15px] font-bold text-text-faint'
                }
              >
                {rating != null ? `Log film · ${rating}` : 'Rate to log'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
