import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  icon: LucideIcon;
  title: string;
  message: string;
  actionTitle: string;
  onAction: () => void;
};

// Full-screen empty state for a list tab. The icon should be the same glyph the
// feature uses elsewhere (tab bar, toggles) so the state doubles as a hint for
// how rows get here.
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionTitle,
  onAction,
}: Props) {
  const { colors } = useTheme();

  return (
    // Layout lives on the inner View so the styling doesn't depend on
    // NativeWind's interop with Reanimated's Animated.View.
    <Animated.View entering={FadeInDown.duration(400)} style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center gap-4 px-10 pb-16">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
          <Icon size={34} color={colors['--color-primary']} />
        </View>

        <View className="gap-1.5">
          <Text className="text-center text-lg font-bold text-text-primary">
            {title}
          </Text>
          <Text className="text-center text-sm leading-5 text-text-muted">
            {message}
          </Text>
        </View>

        <View className="w-60 pt-1">
          <Button title={actionTitle} onPress={onAction} />
        </View>
      </View>
    </Animated.View>
  );
}
