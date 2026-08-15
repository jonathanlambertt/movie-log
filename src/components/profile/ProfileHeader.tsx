import { Bookmark, ChevronRight, Pencil, Share2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Text } from "@/components/ui/Text";
import type { Profile } from "@/lib/queries/profile";
import { useTheme } from "@/theme/ThemeProvider";

type Props = {
  profile: Profile | null;
  /** Shows the edit button. Omit when rendering someone else's profile. */
  onEdit?: () => void;
  /** Shows the watchlist button. Omit when rendering someone else's profile. */
  onViewWatchlist?: () => void;
  /** Last-resort label when the profile row has no display name. */
  fallbackName?: string | null;
};

// Identity block: avatar, name, handle, bio. Takes a profile as a prop rather
// than reading the session, so a future /user/[username] route can render
// somebody else's with no changes.
export function ProfileHeader({
  profile,
  onEdit,
  onViewWatchlist,
  fallbackName,
}: Props) {
  const { colors } = useTheme();
  const name = profile?.display_name?.trim() || null;
  const bio = profile?.bio?.trim() || null;
  const username = profile?.username?.trim() || null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-4">
        <Avatar name={name} fallback={fallbackName} size={64} />
        <View className="flex-1 gap-0.5">
          <Text
            className="text-2xl font-bold text-text-primary"
            numberOfLines={1}
          >
            {name ?? "Your profile"}
          </Text>
          {username ? (
            <Text className="text-medium text-text-muted">@{username}</Text>
          ) : null}
        </View>
      </View>

      {bio ? (
        <Text className="text-base leading-5 text-text-muted">{bio}</Text>
      ) : null}

      {/* Own-profile only. Outlined pills rather than the full-width primary
          Button — this is a quiet affordance, not the screen's action. Share
          is purely decorative for now — no share flow wired up yet. */}
      {onEdit ? (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 self-start rounded-full border border-border px-6 py-2.5 active:opacity-60"
          >
            <Pencil size={16} color={colors["--color-text-muted"]} />
            <Text className="text-base font-semibold text-text-primary">
              Edit profile
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 self-start rounded-full border border-border px-6 py-2.5 active:opacity-60"
          >
            <Share2 size={16} color={colors["--color-text-muted"]} />
            <Text className="text-base font-semibold text-text-primary">
              Share profile
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* A row, not a pill — this opens a whole screen, so it reads as
          navigation rather than a quiet affordance like edit/share. */}
      {onViewWatchlist ? (
        <Pressable
          onPress={onViewWatchlist}
          accessibilityRole="button"
          className="mt-4 flex-row items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 active:opacity-70"
        >
          <View className="flex-row items-center gap-2.5">
            <Bookmark size={18} color={colors["--color-text-muted"]} />
            <Text className="text-base font-semibold text-text-primary">
              Watchlist
            </Text>
          </View>
          <ChevronRight size={18} color={colors["--color-text-faint"]} />
        </Pressable>
      ) : null}
    </View>
  );
}
