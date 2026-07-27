import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileStats } from '@/lib/queries/logs';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/providers/SessionProvider';
import { ratingColor } from '@/theme/ratingRamp';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

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
  const { preference, resolved, setPreference } = useTheme();
  const { session } = useSession();
  const stats = useProfileStats();
  const options: ThemePreference[] = ['system', 'light', 'dark'];

  const displayName =
    (session?.user.user_metadata?.display_name as string | undefined) ?? null;

  const average = stats.data?.average ?? null;
  const averageColor =
    average != null ? ratingColor(Math.round(average), resolved) : undefined;

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign out failed', error.message);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Identity */}
        <View className="gap-1 pt-2">
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

        {/* Appearance */}
        <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
          <Text className="font-semibold text-text-primary">Appearance</Text>
          <View className="flex-row gap-2">
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => setPreference(option)}
                className={
                  option === preference
                    ? 'rounded-full bg-primary px-4 py-2'
                    : 'rounded-full bg-surface-alt px-4 py-2'
                }
              >
                <Text
                  className={
                    option === preference
                      ? 'font-semibold text-on-primary'
                      : 'text-text-muted'
                  }
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <Pressable onPress={signOut} className="items-center py-2 active:opacity-70">
          <Text className="text-sm text-primary">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
