import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { ratingColor } from '@/theme/ratingRamp';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  rating: number;
  size?: 'sm' | 'md';
};

// My rating as a colored pill — the visual currency shown on films I've
// logged. Background is the rating ramp color (never the primary token).
export function RatingPill({ rating, size = 'md' }: Props) {
  const { resolved } = useTheme();
  const bg = ratingColor(rating, resolved);

  const box = size === 'sm' ? 'h-5 min-w-5 px-1.5' : 'h-7 min-w-7 px-2';
  const text = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View
      style={{ backgroundColor: bg }}
      className={`items-center justify-center rounded-md ${box}`}
    >
      <Text style={{ color: '#ffffff' }} className={`font-bold ${text}`}>
        {rating}
      </Text>
    </View>
  );
}
