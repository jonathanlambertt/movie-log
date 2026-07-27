import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, loading, disabled }: Props) {
  const { colors } = useTheme();
  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      className={`h-12 items-center justify-center rounded-xl bg-primary active:opacity-90 ${
        isDisabled ? 'opacity-50' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={colors['--color-on-primary']} />
      ) : (
        <Text className="text-base font-semibold text-on-primary">{title}</Text>
      )}
    </Pressable>
  );
}
