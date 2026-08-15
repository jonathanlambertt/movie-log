import { cssInterop } from 'nativewind';
import { Text as RNText, StyleSheet, type TextProps } from 'react-native';

import { figtreeFamily } from '@/theme/fonts';

// The app's text primitive: React Native's Text, rendered in Figtree. Import
// this instead of Text from 'react-native' everywhere except the Wordmark,
// which has its own display face.
function FigtreeText({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style);

  return (
    <RNText
      {...props}
      style={[
        style,
        {
          // Each Figtree weight is registered as its own family, so a
          // fontWeight — from a font-* class or an inline style — has to be
          // translated into a family name, then dropped: leaving it set makes
          // iOS lay synthetic bold on top of an already-bold face.
          fontFamily: flat?.fontFamily ?? figtreeFamily(flat?.fontWeight),
          fontWeight: undefined,
        },
      ]}
    />
  );
}

// cssInterop folds className into the style prop before FigtreeText runs, so
// the weight from a font-* class is visible to the lookup above. Without it
// className would resolve further down, inside RNText, where it's too late.
export const Text = cssInterop(FigtreeText, { className: 'style' });
