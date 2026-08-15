import { Pressable, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import type { Profile } from '@/lib/queries/profile';

type Props = {
  profile: Profile | null;
  /** Shows the edit button. Omit when rendering someone else's profile. */
  onEdit?: () => void;
  /** Last-resort label when the profile row has no display name. */
  fallbackName?: string | null;
};

// Identity block: avatar, name, handle, bio. Takes a profile as a prop rather
// than reading the session, so a future /user/[username] route can render
// somebody else's with no changes.
export function ProfileHeader({ profile, onEdit, fallbackName }: Props) {
  const name = profile?.display_name?.trim() || null;
  const bio = profile?.bio?.trim() || null;
  const username = profile?.username?.trim() || null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-4">
        <Avatar name={name} fallback={fallbackName} size={64} />
        <View className="flex-1 gap-0.5">
          <Text className="text-2xl font-bold text-text-primary" numberOfLines={1}>
            {name ?? 'Your profile'}
          </Text>
          {username ? (
            <Text className="text-sm text-text-muted">@{username}</Text>
          ) : null}
        </View>
      </View>

      {bio ? <Text className="text-base leading-5 text-text-muted">{bio}</Text> : null}

      {/* Own-profile only. A compact outlined pill rather than the full-width
          primary Button — this is a quiet affordance, not the screen's action. */}
      {onEdit ? (
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          className="self-start rounded-full border border-border px-4 py-1.5 active:opacity-60"
        >
          <Text className="text-sm font-semibold text-text-primary">Edit profile</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
