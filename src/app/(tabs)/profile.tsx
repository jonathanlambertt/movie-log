import { useFocusEffect, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatStrip } from '@/components/profile/StatStrip';
import { Text } from '@/components/ui/Text';
import { useProfileStats } from '@/lib/queries/logs';
import { useMyProfile } from '@/lib/queries/profile';
import { useMyRatings } from '@/lib/queries/ratings';
import { useSession } from '@/providers/SessionProvider';
import { useTheme } from '@/theme/ThemeProvider';

// Mean of the user's current ratings. Deliberately from the ratings table rather
// than logs.rating: ratings holds the live opinion, so re-rating a film moves
// this number — with logs.rating it silently didn't.
function averageOf(ratings?: Map<number, number>) {
  if (!ratings || ratings.size === 0) return null;
  let sum = 0;
  for (const rating of ratings.values()) sum += rating;
  return sum / ratings.size;
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { session } = useSession();
  const router = useRouter();

  const profile = useMyProfile();
  const stats = useProfileStats();
  const ratings = useMyRatings();

  // Refresh on focus so logging, rating or editing elsewhere shows up here
  // without a reload.
  const refetchProfile = profile.refetch;
  const refetchStats = stats.refetch;
  const refetchRatings = ratings.refetch;
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchStats();
      refetchRatings();
    }, [refetchProfile, refetchStats, refetchRatings]),
  );

  const editProfile = () => router.push('/edit-profile');

  // Only the first paint blocks — isLoading is false for the focus refetches,
  // so a populated profile never flashes a spinner.
  const loading = profile.isLoading || stats.isLoading || ratings.isLoading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
        <Text className="text-2xl font-bold text-text-primary">Profile</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={8}
          className="p-1 active:opacity-60"
        >
          <Settings size={24} color={colors['--color-text-primary']} />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors['--color-text-muted']} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12, gap: 20 }}>
          <ProfileHeader
            profile={profile.data ?? null}
            onEdit={editProfile}
            fallbackName={session?.user.email ?? null}
          />
          <StatStrip
            films={stats.data?.films ?? 0}
            thisYear={stats.data?.thisYear ?? 0}
            average={averageOf(ratings.data)}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
