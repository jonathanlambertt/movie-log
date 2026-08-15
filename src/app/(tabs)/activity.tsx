import { Bell, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { Text } from '@/components/ui/Text';

// Two feeds share this tab: what people you follow have been watching, and
// what's happened to you. Both are empty until following and notifications
// exist — the copy explains what will land here rather than offering an
// action, since there's nowhere to send the user yet.
type Feed = 'following' | 'you';

const FEEDS: { key: Feed; label: string }[] = [
  { key: 'following', label: 'Following' },
  { key: 'you', label: 'You' },
];

export default function ActivityScreen() {
  const [feed, setFeed] = useState<Feed>('following');

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-4 pb-2 pt-2">
        <Text className="text-2xl font-bold text-text-primary">Activity</Text>
      </View>

      <View className="flex-row gap-2 px-4 pb-2">
        {FEEDS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFeed(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: feed === key }}
            className={
              feed === key
                ? 'rounded-full bg-primary px-4 py-2 active:opacity-80'
                : 'rounded-full bg-surface-alt px-4 py-2 active:opacity-80'
            }
          >
            <Text
              className={
                feed === key
                  ? 'text-sm font-semibold text-on-primary'
                  : 'text-sm text-text-muted'
              }
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {feed === 'following' ? (
        <EmptyState
          icon={Users}
          title="No activity yet"
          message="Once you follow other people, the films they log, rate and review will show up here."
        />
      ) : (
        <EmptyState
          icon={Bell}
          title="Nothing new"
          message="Follows, likes and replies to your reviews will show up here."
        />
      )}
    </SafeAreaView>
  );
}
