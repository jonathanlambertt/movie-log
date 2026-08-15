// Imported per weight rather than from the package root: the root module
// requires every face it ships, which would drag all seven italics into the
// bundle for nothing.
import { Figtree_300Light } from '@expo-google-fonts/figtree/300Light';
import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { Figtree_800ExtraBold } from '@expo-google-fonts/figtree/800ExtraBold';
import { Figtree_900Black } from '@expo-google-fonts/figtree/900Black';
import type { TextStyle } from 'react-native';

// Figtree is the app's body typeface — everything except the Wordmark, which
// keeps its own display face. iOS can't synthesise weights from a single file,
// so every weight ships as its own face registered under its own family name.
// These keys are the names fontFamily has to be set to, and the map is what
// the root layout hands to useFonts.
export const bodyFonts = {
  Figtree_300Light,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  Figtree_900Black,
};

const FAMILY_BY_WEIGHT = {
  100: 'Figtree_300Light',
  200: 'Figtree_300Light',
  300: 'Figtree_300Light',
  400: 'Figtree_400Regular',
  500: 'Figtree_500Medium',
  600: 'Figtree_600SemiBold',
  700: 'Figtree_700Bold',
  800: 'Figtree_800ExtraBold',
  900: 'Figtree_900Black',
} as const satisfies Record<number, keyof typeof bodyFonts>;

// The CSS keywords Tailwind emits, plus the names iOS accepts directly.
const NAMED_WEIGHTS: Record<string, number> = {
  thin: 100,
  ultralight: 200,
  light: 300,
  normal: 400,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
  black: 900,
};

/**
 * The Figtree family name that renders `weight`. Tailwind's font-* classes and
 * inline styles both express weight as a fontWeight, but with one family per
 * weight it has to be resolved to a family name before reaching the native
 * text view. Weights we don't ship snap to the nearest face.
 */
export function figtreeFamily(weight: TextStyle['fontWeight']): string {
  const numeric =
    weight == null
      ? 400
      : typeof weight === 'number'
        ? weight
        : (NAMED_WEIGHTS[weight] ?? Number(weight));

  if (!Number.isFinite(numeric)) {
    return FAMILY_BY_WEIGHT[400];
  }

  const step = Math.min(900, Math.max(100, Math.round(numeric / 100) * 100));
  return FAMILY_BY_WEIGHT[step as keyof typeof FAMILY_BY_WEIGHT];
}
