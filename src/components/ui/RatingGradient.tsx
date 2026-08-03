import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// Fixed, theme-independent anchor colors — same ramp shape as the rating
// scrubber (red → amber → green → teal), but hardcoded rather than resolved
// per-theme so the wash looks identical in light and dark mode.
const ANCHORS: ReadonlyArray<readonly [value: number, color: string]> = [
  [1, 'rgb(229, 72, 77)'],
  [5, 'rgb(245, 165, 36)'],
  [8, 'rgb(70, 193, 126)'],
  [10, 'rgb(52, 199, 149)'],
];
const OPACITY = 0.45;

// Soft diagonal wash of the rating ramp, used behind the auth screens.
export function RatingGradient() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="ramp" x1="0" y1="0" x2="1" y2="1">
          {ANCHORS.map(([value, color]) => (
            <Stop key={value} offset={(value - 1) / 9} stopColor={color} />
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
