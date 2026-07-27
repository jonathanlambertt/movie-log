import { Text, View } from 'react-native';

export default function DiaryScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-text-primary">Diary</Text>
      <Text className="text-sm text-text-muted">reverse-chron log list lands here</Text>
    </View>
  );
}
