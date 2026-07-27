import { useFocusEffect, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStats } from '@/lib/queries/logs';
import { useSession } from '@/providers/SessionProvider';
import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View className="flex-1 items-center gap-1 rounded-2xl border border-border bg-surface py-4">
      <Text
        style={color ? { color } : undefined}
        className="text-3xl font-bold text-text-primary"
      >
        {value}
      </Text>
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { resolved, colors } = useTheme();
  const { session } = useSession();
  const stats = useProfileStats();
  const router = useRouter();

  // Refresh stats when the tab regains focus so they reflect newly logged films.
  const { refetch } = stats;
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const displayName =
    (session?.user.user_metadata?.display_name as string | undefined) ?? null;

  const average = stats.data?.average ?? null;
  const averageColor =
    average != null ? ratingColor(Math.round(average), resolved) : undefined;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Top bar with settings */}
        <View className="flex-row justify-end">
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
            className="p-1 active:opacity-60"
          >
            <Settings size={24} color={colors['--color-text-primary']} />
          </Pressable>
        </View>

        {/* Identity */}
        <View className="gap-1">
          {displayName ? (
            <Text className="text-2xl font-bold text-text-primary">{displayName}</Text>
          ) : null}
          <Text className="text-sm text-text-muted">{session?.user.email}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3">
          <StatCard value={String(stats.data?.thisYear ?? 0)} label="This year" />
          <StatCard value={String(stats.data?.total ?? 0)} label="Films logged" />
          <StatCard
            value={average != null ? average.toFixed(1) : '—'}
            label="Avg rating"
            color={averageColor}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
