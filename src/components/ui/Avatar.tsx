import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

type Props = {
  /** Display name, when the user has set one. */
  name?: string | null;
  /** Used when there's no name — an email works, only its first letter shows. */
  fallback?: string | null;
  size?: number;
};

// Up to two initials: "Ada Lovelace" → "AL", "cinephile" → "C". Falls back to
// the first character of `fallback` (an email), then to a dash so the circle is
// never empty.
function initialsFrom(name?: string | null, fallback?: string | null) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  const first = (fallback ?? '').trim()[0];
  return first ? first.toUpperCase() : '—';
}

// Initials on a primary-tinted circle. There is deliberately no per-user color:
// hex values live only in theme/colors.ts, so a hash-to-color scheme would mean
// inventing palette entries outside it. Real images land here once
// profiles.avatar_url has an upload path.
export function Avatar({ name, fallback, size = 64 }: Props) {
  const initials = initialsFrom(name, fallback);

  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-primary"
    >
      <Text
        // Scaled to the circle rather than a Tailwind text size so one
        // component serves both a 64pt profile header and smaller uses later.
        style={{ fontSize: size * 0.38 }}
        className="font-bold text-on-primary"
      >
        {initials}
      </Text>
    </View>
  );
}
