import { useRouter } from 'expo-router';
import { AtSign, User, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { FieldInput } from '@/components/ui/FieldInput';
import { useMyProfile, useUpdateProfile } from '@/lib/queries/profile';
import { useSession } from '@/providers/SessionProvider';
import { useTheme } from '@/theme/ThemeProvider';

const BIO_LIMIT = 240;

// Empty input means "clear the column", not "an empty string" — keeps
// display_name/username/bio genuinely null so the UI's null checks work.
function orNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { session } = useSession();
  const profile = useMyProfile();
  const updateProfile = useUpdateProfile();

  // Seeded once from the loaded profile. The modal only opens from Settings,
  // which mounts after the profile query has resolved, so there's nothing to
  // sync afterwards.
  const [displayName, setDisplayName] = useState(profile.data?.display_name ?? '');
  const [username, setUsername] = useState(profile.data?.username ?? '');
  const [bio, setBio] = useState(profile.data?.bio ?? '');

  const save = () => {
    if (!session) return;
    updateProfile.mutate(
      {
        userId: session.user.id,
        displayName: orNull(displayName),
        username: orNull(username),
        bio: orNull(bio),
      },
      {
        onSuccess: () => router.back(),
        onError: (error) => {
          Alert.alert('Could not save profile', (error as Error).message);
        },
      },
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-xl font-bold text-text-primary">Edit profile</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          className="p-1 active:opacity-60"
        >
          <X size={24} color={colors['--color-text-primary']} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1.5">
            <FieldInput
              icon={User}
              placeholder="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
            <FieldInput
              icon={AtSign}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              returnKeyType="next"
            />
          </View>

          {/* Not FieldInput: that's a fixed h-14 single-line pill. Styled to
              match it instead, and fontSize is set without lineHeight for the
              same reason FieldInput does (Tailwind text-* sizes bundle a
              lineHeight that misplaces typed text on iOS). */}
          <View className="gap-1.5">
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="A line or two about what you watch"
              placeholderTextColor={colors['--color-text-faint']}
              multiline
              maxLength={BIO_LIMIT}
              textAlignVertical="top"
              selectionColor={colors['--color-primary']}
              style={{ fontSize: 18 }}
              className="min-h-24 rounded-xl bg-surface px-4 py-3 text-text-primary"
            />
            <Text className="text-right text-xs text-text-faint">
              {bio.length}/{BIO_LIMIT}
            </Text>
          </View>

          <Button
            title="Save"
            onPress={save}
            loading={updateProfile.isPending}
            disabled={profile.isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
