import { Text } from 'react-native';

// Custom title font, bundled from assets/fonts and loaded via useFonts in the
// root layout. The string must match the key registered there.
const TITLE_FONT = 'Vadelma-Medium';

export function Wordmark({ size = 35 }: { size?: number }) {
  return (
    <Text
      style={{ fontFamily: TITLE_FONT, fontSize: size, letterSpacing: 0.5 }}
      className="text-text-primary"
    >
      Cinebook
    </Text>
  );
}
