import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RatingScrubber } from '@/components/rating/RatingScrubber';

// TEMPORARY scrubber test harness — replaced by the real log flow (search →
// pick film → rate → save) in the next step. onConfirm stands in for the save.
export default function LogModal() {
  const [rating, setRating] = useState<number | null>(null);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-8 px-6">
        <Text className="text-center text-xl font-bold text-text-primary">
          How was it?
        </Text>

        <RatingScrubber
          value={rating}
          onChange={setRating}
          onConfirm={(v) => {
            Alert.alert('Would log', `Rating: ${v}`, [
              { text: 'OK', onPress: () => router.back() },
            ]);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
