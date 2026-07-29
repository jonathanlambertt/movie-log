import { Text, View } from 'react-native';

import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  films: number;
  thisYear: number;
  average: number | null;
};

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Text
        style={color ? { color } : undefined}
        className="text-2xl font-bold text-text-primary"
      >
        {value}
      </Text>
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  );
}

// Three numbers on one line, no card chrome — the bordered boxes this replaces
// made the profile read like a debug panel.
//
// Only the average is tinted, and only ever with the rating ramp; the other two
// are plain text so the colored one means something.
export function StatStrip({ films, thisYear, average }: Props) {
  const { resolved } = useTheme();
  const averageColor =
    average != null ? ratingColor(Math.round(average), resolved) : undefined;

  return (
    <View className="flex-row items-start border-t border-border pt-4">
      <Stat value={String(films)} label={films === 1 ? 'Film' : 'Films'} />
      <Stat value={String(thisYear)} label="This year" />
      <Stat
        value={average != null ? average.toFixed(1) : '—'}
        label="Avg rating"
        color={averageColor}
      />
    </View>
  );
}
