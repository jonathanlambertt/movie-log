import { cssInterop } from 'nativewind';
import type { Ref } from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';

import { figtreeFamily } from '@/theme/fonts';

/** Ref type for the fields below — the underlying native TextInput. */
export type TextInputHandle = RNTextInput;

// Typing surfaces in Figtree, matching @/components/ui/Text. See that file for
// why the weight is resolved to a family name here rather than passed through.
function FigtreeTextInput({
  style,
  ...props
}: TextInputProps & { ref?: Ref<TextInputHandle> }) {
  const flat = StyleSheet.flatten(style);

  return (
    <RNTextInput
      {...props}
      style={[
        style,
        {
          fontFamily: flat?.fontFamily ?? figtreeFamily(flat?.fontWeight),
          fontWeight: undefined,
        },
      ]}
    />
  );
}

export const TextInput = cssInterop(FigtreeTextInput, { className: 'style' });
