import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { preference, setPreference, colors } = useTheme();
  const options: ThemePreference[] = ['system', 'light', 'dark'];

  // Signing out flips the root session guard, which unmounts this screen and
  // shows the auth stack — no manual navigation needed.
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign out failed', error.message);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center gap-1 px-2 py-2">
        <Pressable onPress={() => router.back()} className="p-1 active:opacity-60">
          <ChevronLeft size={26} color={colors['--color-text-primary']} />
        </Pressable>
        <Text className="text-xl font-bold text-text-primary">Settings</Text>
      </View>

      <View className="gap-5 px-5 pt-2">
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
        <Pressable
          onPress={signOut}
          className="items-center rounded-2xl border border-border bg-surface py-3.5 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-primary">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
