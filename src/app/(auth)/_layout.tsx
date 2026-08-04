import { Stack } from 'expo-router';

import { ThemeOverride } from '@/theme/ThemeProvider';

// Auth screens always render in dark theme, independent of the device's
// light/dark setting — the wordmark and gradient wash are designed for it.
export default function AuthLayout() {
  return (
    <ThemeOverride theme="dark">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </ThemeOverride>
  );
}
