import type { ThemeName } from './colors';

// Per-theme rating ramp: red → amber → green. Light mode uses darker stops
// for contrast against white. Deliberately SEPARATE from the violet primary
// token — never use primary for ratings, nor these ramp colors for
// buttons/links elsewhere in the app.
//
// Stops are [value, [r, g, b]]; intermediate values are linearly interpolated.
type Stop = readonly [number, readonly [number, number, number]];

const RAMP: Record<ThemeName, readonly Stop[]> = {
  dark: [
    [1, [229, 72, 77]],
    [5, [245, 165, 36]],
    [8, [70, 193, 126]],
    [10, [52, 199, 149]],
  ],
  light: [
    [1, [220, 38, 38]],
    [5, [217, 119, 6]],
    [8, [22, 163, 74]],
    [10, [5, 150, 105]],
  ],
};

export function ratingColor(value: number, theme: ThemeName): string {
  const stops = RAMP[theme];
  const v = Math.min(10, Math.max(1, value));

  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (v >= stops[i][0] && v <= stops[i + 1][0]) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const t = lower[0] === upper[0] ? 0 : (v - lower[0]) / (upper[0] - lower[0]);
  const [r, g, b] = lower[1].map((c, i) => Math.round(c + (upper[1][i] - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
}

// One-word descriptor shown under the big number in the scrubber.
export const RATING_WORDS: Record<number, string> = {
  1: 'Awful',
  2: 'Bad',
  3: 'Weak',
  4: 'Meh',
  5: 'Okay',
  6: 'Decent',
  7: 'Good',
  8: 'Great',
  9: 'Superb',
  10: 'Masterpiece',
};
