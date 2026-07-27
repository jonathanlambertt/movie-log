import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { Repeat } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingPill } from '@/components/rating/RatingPill';
import { useDiary, type DiaryLog } from '@/lib/queries/logs';
import { posterUrl } from '@/lib/tmdb';
import { useTheme } from '@/theme/ThemeProvider';

// Parse a 'YYYY-MM-DD' as local midnight (avoids the UTC off-by-one that
// new Date('2026-07-21') would introduce).
function parseDate(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

function monthTitle(iso: string) {
  return parseDate(iso).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function dayLabel(iso: string) {
  return parseDate(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
  });
}

// Logs arrive sorted newest-first, so a sequential pass yields month sections
// already in reverse-chron order.
function groupByMonth(logs: DiaryLog[]) {
  const sections: { title: string; data: DiaryLog[] }[] = [];
  for (const log of logs) {
    const title = monthTitle(log.watched_on);
    const last = sections[sections.length - 1];
    if (last && last.title === title) {
      last.data.push(log);
    } else {
      sections.push({ title, data: [log] });
    }
  }
  return sections;
}

export default function DiaryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const diary = useDiary();

  // Refresh when the tab regains focus so newly logged films appear without
  // a reload.
  const { refetch } = diary;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (diary.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors['--color-text-muted']} />
      </View>
    );
  }

  const sections = groupByMonth(diary.data ?? []);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <Text className="px-4 pb-2 pt-2 text-2xl font-bold text-text-primary">
        Diary
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text className="px-8 pt-16 text-center text-sm text-text-faint">
            No films logged yet. Tap the + to log your first.
          </Text>
        }
        renderSectionHeader={({ section }) => (
          <Text className="bg-background px-4 pb-1 pt-4 text-sm font-semibold text-text-muted">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const uri = posterUrl(item.films?.poster_path ?? null, 'w185');
          const year = item.films?.release_date
            ? item.films.release_date.slice(0, 4)
            : null;
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/movie/[id]',
                  params: { id: String(item.film_id) },
                })
              }
              className="flex-row items-center gap-3 px-4 py-2 active:bg-surface"
            >
              <View className="h-16 w-11 overflow-hidden rounded bg-surface">
                {uri ? (
                  <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" />
                ) : null}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-text-primary" numberOfLines={1}>
                  {item.films?.title ?? 'Unknown film'}
                  {year ? (
                    <Text className="font-normal text-text-faint">  {year}</Text>
                  ) : null}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-2">
                  <Text className="text-sm text-text-muted">
                    {dayLabel(item.watched_on)}
                  </Text>
                  {item.is_rewatch && (
                    <View className="flex-row items-center gap-1">
                      <Repeat size={12} color={colors['--color-text-faint']} />
                      <Text className="text-xs text-text-faint">Rewatch</Text>
                    </View>
                  )}
                </View>
              </View>
              {item.rating != null && <RatingPill rating={item.rating} />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
