import { Search } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

// Shared search field: magnifying-glass icon, larger text, primary caret.
// fontSize is set WITHOUT lineHeight on purpose — Tailwind's text-* sizes
// bundle a lineHeight that drops typed text below the placeholder on iOS.
export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search movies...',
  autoFocus,
}: Props) {
  const { colors } = useTheme();

  return (
    <View className="h-14 flex-row items-center gap-2.5 rounded-xl bg-surface px-4">
      <Search size={20} color={colors['--color-text-faint']} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors['--color-text-faint']}
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
        selectionColor={colors['--color-primary']}
        cursorColor={colors['--color-primary']}
        style={{ fontSize: 18, paddingVertical: 0 }}
        className="flex-1 text-text-primary"
      />
    </View>
  );
}
