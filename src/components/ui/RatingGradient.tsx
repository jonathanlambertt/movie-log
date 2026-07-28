import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

// The ramp's anchor ratings. Mapped onto 0–1 so the gradient runs the full
// scrubber range: 1 (red) → 5 (amber) → 8 (green) → 10 (teal).
const ANCHORS = [1, 5, 8, 10];
const OPACITY = 0.2;

// Soft diagonal wash of the rating ramp, used behind the auth screens.
export function RatingGradient() {
  const { resolved } = useTheme();

  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="ramp" x1="0" y1="0" x2="1" y2="1">
          {ANCHORS.map((value) => (
            <Stop
              key={value}
              offset={(value - 1) / 9}
              stopColor={ratingColor(value, resolved)}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#ramp)"
        opacity={OPACITY}
      />
    </Svg>
  );
}
