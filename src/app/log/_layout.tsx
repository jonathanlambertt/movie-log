import { Stack } from 'expo-router';

// Two-step log flow inside the modal: pick a film (index) → rate & save
// ([filmId]). Presented as a modal by the root layout.
export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
