import { useFocusEffect, useRouter } from 'expo-router';
import { BookOpen, Repeat } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, SectionList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilmRow } from '@/components/movie/FilmRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';
import { useDiary, type DiaryLog } from '@/lib/queries/logs';
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

// Just the day number — the month and year are already in the section header,
// and the row shows it in a leading rail.
function dayLabel(iso: string) {
  return parseDate(iso).toLocaleDateString(undefined, { day: 'numeric' });
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

      {sections.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your diary is empty"
          message="Log the films you watch to build a history of what you've seen and how you rated it."
          actionTitle="Log your first film"
          onAction={() => router.push('/log')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text className="bg-background px-4 pb-2 pt-5 text-lg font-bold text-text-primary">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <FilmRow
              filmId={item.film_id}
              title={item.films?.title ?? 'Unknown film'}
              posterPath={item.films?.poster_path ?? null}
              year={item.films?.release_date?.slice(0, 4) ?? null}
              day={dayLabel(item.watched_on)}
              rating={item.rating}
              badge={
                item.is_rewatch ? (
                  <View className="flex-row items-center gap-1">
                    <Repeat size={12} color={colors['--color-text-faint']} />
                    <Text className="text-xs text-text-faint">Rewatch</Text>
                  </View>
                ) : null
              }
              onPress={() =>
                router.push({
                  pathname: '/movie/[id]',
                  params: { id: String(item.film_id) },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
