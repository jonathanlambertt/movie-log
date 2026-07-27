import { Text, View } from 'react-native';

export default function WatchlistScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-text-primary">Watchlist</Text>
      <Text className="text-sm text-text-muted">saved films land here</Text>
    </View>
  );
}
