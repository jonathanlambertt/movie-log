import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import {
  Bookmark,
  BookOpen,
  Plus,
  Search,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";

const ICONS: Record<string, LucideIcon> = {
  index: Search,
  diary: BookOpen,
  watchlist: Bookmark,
  profile: User,
};

// The raised "+" needs to overflow above the bar, which the default
// tabBarButton can't do — hence this fully custom bar. The button sits
// absolutely positioned inside a fixed-width center slot between the
// Diary and Watchlist tabs.
export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const openLogFlow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/log");
  };

  return (
    <View
      className="flex-row bg-background"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        const Icon = ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Fragment key={route.key}>
            {/* Center slot with the raised log button, between Diary and Watchlist */}
            {index === 2 && (
              <View className="w-20 items-center">
                <Pressable
                  onPress={openLogFlow}
                  accessibilityLabel="Log a film"
                  className="absolute -top-4 h-14 w-14 items-center justify-center rounded-full border-background bg-primary active:opacity-90"
                >
                  <Plus
                    size={26}
                    color={colors["--color-on-primary"]}
                    strokeWidth={2.6}
                  />
                </Pressable>
              </View>
            )}
            <Pressable
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              className="flex-1 items-center gap-1 pb-1 pt-2"
            >
              <Icon
                size={24}
                color={
                  isFocused
                    ? colors["--color-text-primary"]
                    : colors["--color-text-faint"]
                }
                strokeWidth={isFocused ? 2.4 : 1.8}
              />
              <Text
                className={
                  isFocused
                    ? "text-[10px] font-semibold text-text-primary"
                    : "text-[10px] text-text-faint"
                }
              >
                {label}
              </Text>
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}
