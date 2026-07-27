import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SessionProvider, useSession } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

import '../global.css';

const queryClient = new QueryClient();

function RootNavigator() {
  const { session, loading } = useSession();

  // Wait for the persisted session to load so a signed-in user never sees
  // a flash of the sign-in screen at launch.
  if (loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Transparent so ThemeProvider's bg-background shows through —
        // prevents a white flash behind screens during dark-mode transitions.
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="log" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Vadelma-Medium': require('../../assets/fonts/Vadelma-Medium.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
