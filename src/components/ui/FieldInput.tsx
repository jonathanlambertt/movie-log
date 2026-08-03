import * as Haptics from 'expo-haptics';
import { Eye, EyeOff, X, type LucideIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  icon: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  /** Password field: masks the value and swaps clear for a reveal toggle. */
  secure?: boolean;
};

// The app's one text field: a tall pill with a leading icon and a trailing
// action. Search, sign-in and sign-up all render this so the typing surface
// feels identical everywhere.
//
// fontSize is set WITHOUT lineHeight on purpose — Tailwind's text-* sizes
// bundle a lineHeight that drops typed text below the placeholder on iOS.
export function FieldInput({
  icon: Icon,
  value,
  onChangeText,
  secure,
  ...inputProps
}: Props) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [revealed, setRevealed] = useState(false);

  // Clearing keeps focus so the keyboard stays up and the user can retype
  // straight away instead of tapping back into the field.
  const clear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText('');
    inputRef.current?.focus();
  };

  const hasText = value.length > 0;

  return (
    <View className="h-14 flex-row items-center gap-2.5 rounded-xl bg-surface px-4">
      <Icon size={20} color={colors['--color-text-faint']} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors['--color-text-faint']}
        autoCorrect={false}
        selectionColor={colors['--color-text-primary']}
        cursorColor={colors['--color-text-primary']}
        secureTextEntry={secure && !revealed}
        style={{ fontSize: 18, paddingVertical: 0 }}
        className="flex-1 text-text-primary"
        {...inputProps}
      />
      {secure ? (
        hasText ? (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={10}
            className="active:opacity-60"
          >
            {revealed ? (
              <EyeOff size={20} color={colors['--color-text-muted']} />
            ) : (
              <Eye size={20} color={colors['--color-text-muted']} />
            )}
          </Pressable>
        ) : null
      ) : hasText ? (
        <Pressable
          onPress={clear}
          accessibilityRole="button"
          accessibilityLabel="Clear text"
          hitSlop={10}
          className="h-6 w-6 items-center justify-center rounded-full bg-surface-alt active:opacity-60"
        >
          <X size={14} color={colors['--color-text-muted']} />
        </Pressable>
      ) : null}
    </View>
  );
}
