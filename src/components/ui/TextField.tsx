import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = TextInputProps & {
  label: string;
};

export function TextField({ label, ...inputProps }: Props) {
  const { colors } = useTheme();

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-text-muted">{label}</Text>
      <TextInput
        placeholderTextColor={colors['--color-text-faint']}
        className="h-12 rounded-xl border border-border bg-surface px-4 text-base text-text-primary"
        {...inputProps}
      />
    </View>
  );
}
