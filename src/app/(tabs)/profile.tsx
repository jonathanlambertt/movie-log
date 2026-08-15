import { useFocusEffect, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Text } from '@/components/ui/Text';
import { useMyProfile } from '@/lib/queries/profile';
import { useSession } from '@/providers/SessionProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { session } = useSession();
  const router = useRouter();

  const profile = useMyProfile();

  // Refresh on focus so editing elsewhere shows up here without a reload.
  const refetchProfile = profile.refetch;
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
    }, [refetchProfile]),
  );

  const editProfile = () => router.push('/edit-profile');
  const viewWatchlist = () => router.push('/profile/watchlist');

  // Only the first paint blocks — isLoading is false for the focus refetches,
  // so a populated profile never flashes a spinner.
  const loading = profile.isLoading;

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
            onViewWatchlist={viewWatchlist}
            fallbackName={session?.user.email ?? null}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
