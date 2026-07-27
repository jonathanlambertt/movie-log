import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ratingColor, RATING_WORDS } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

const COUNT = 10;
const TRACK_PADDING = 16; // matches the track's px-4, so ticks map to touch x

type Props = {
  /** Controlled rating for live preview; null = empty (no default). */
  value: number | null;
  /** Fires on every detent change while scrubbing (parent preview state). */
  onChange: (value: number) => void;
  /** Fires when the confirm button is pressed — wire to the save mutation. */
  onConfirm?: (value: number) => void;
};

// The signature input: a 1–10 integer ruler. Drag/tap to scrub, snapping to
// the nearest detent; each change fires a selection haptic and pulses the big
// number. Starts empty. Honors reduce-motion. See spec in the rating ramp.
export function RatingScrubber({ value, onChange, onConfirm }: Props) {
  const { resolved, colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const [rating, setRating] = useState<number | null>(value);
  // Mirror of `rating` for synchronous comparison inside setSnapped, so the
  // change check and side effects live outside the state updater (which must
  // stay pure — calling the parent's onChange in it triggers a React warning).
  const ratingRef = useRef<number | null>(value);
  const trackWidth = useSharedValue(0);
  const numberScale = useSharedValue(1);

  // Sync if the parent changes value externally.
  useEffect(() => {
    ratingRef.current = value;
    setRating(value);
  }, [value]);

  const color =
    rating != null ? ratingColor(rating, resolved) : colors['--color-text-faint'];
  const inactiveTick = colors['--color-surface-alt'];

  const setSnapped = useCallback(
    (next: number) => {
      if (next === ratingRef.current) return;
      ratingRef.current = next;
      Haptics.selectionAsync();
      if (!reducedMotion) {
        numberScale.value = withSequence(
          withTiming(1.03, { duration: 70 }),
          withSpring(1, { damping: 18, stiffness: 200 }),
        );
      }
      setRating(next);
      onChange(next);
    },
    [onChange, reducedMotion, numberScale],
  );

  const valueFromX = (x: number) => {
    'worklet';
    const usable = trackWidth.value - TRACK_PADDING * 2;
    if (usable <= 0) return;
    const t = Math.min(1, Math.max(0, (x - TRACK_PADDING) / usable));
    const next = Math.max(1, Math.min(10, Math.round(1 + t * 9)));
    runOnJS(setSnapped)(next);
  };

  const pan = Gesture.Pan()
    .onBegin((e) => valueFromX(e.x))
    .onUpdate((e) => valueFromX(e.x));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
  };

  const adjust = (delta: number) => {
    const base = rating ?? (delta > 0 ? 0 : 2);
    setSnapped(Math.max(1, Math.min(10, base + delta)));
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Rating out of 10"
      accessibilityValue={{ min: 1, max: 10, now: rating ?? undefined }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment') adjust(1);
        if (e.nativeEvent.actionName === 'decrement') adjust(-1);
      }}
    >
      {/* Big number + one-word descriptor */}
      <View className="min-h-[116px] items-center">
        <Animated.Text
          style={[numberStyle, { color }]}
          className="text-[76px] font-extrabold leading-none tabular-nums"
        >
          {rating ?? '—'}
        </Animated.Text>
        <Text style={{ color }} className="mt-2 text-xl font-semibold">
          {rating ? RATING_WORDS[rating] : 'drag the ruler'}
        </Text>
      </View>

      {/* Scrubber track */}
      <GestureDetector gesture={pan}>
        <View
          onLayout={onLayout}
          className="overflow-hidden rounded-2xl border border-border bg-background px-4 pb-2 pt-4"
        >
          <View className="flex-row items-end justify-between">
            {Array.from({ length: COUNT }, (_, i) => {
              const n = i + 1;
              const active = rating != null && n <= rating;
              const current = n === rating;
              return (
                <View key={n} className="w-5 items-center gap-1.5">
                  <View
                    style={{
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      backgroundColor: active ? color : inactiveTick,
                    }}
                  />
                  <Text
                    style={current ? { color } : undefined}
                    className={
                      current
                        ? 'text-[10.5px] font-bold'
                        : 'text-[10.5px] text-text-faint'
                    }
                  >
                    {n}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </GestureDetector>

      {/* Confirm */}
      <Pressable
        disabled={rating == null}
        onPress={() => rating != null && onConfirm?.(rating)}
        style={rating != null ? { backgroundColor: color } : undefined}
        className="mt-5 items-center rounded-xl bg-surface-alt py-3.5"
      >
        <Text
          className={
            rating != null
              ? 'text-[15px] font-bold text-white'
              : 'text-[15px] font-bold text-text-faint'
          }
        >
          {rating != null ? `Log film · ${rating}` : 'Rate to log'}
        </Text>
      </Pressable>
    </View>
  );
}
