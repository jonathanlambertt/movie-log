import { Alert, Pressable, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useSession } from '@/providers/SessionProvider';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { preference, setPreference } = useTheme();
  const { session } = useSession();
  const options: ThemePreference[] = ['system', 'light', 'dark'];

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign out failed', error.message);
    }
  };

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
      <Text className="text-xl font-bold text-text-primary">Profile</Text>
      <Text className="text-sm text-text-muted">{session?.user.email}</Text>

      <View className="w-full gap-3 rounded-2xl border border-border bg-surface p-4">
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

      <Pressable onPress={signOut} className="active:opacity-70">
        <Text className="text-sm text-primary">Sign out</Text>
      </Pressable>
    </View>
  );
}
