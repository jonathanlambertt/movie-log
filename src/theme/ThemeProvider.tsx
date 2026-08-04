import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme, View } from 'react-native';

import { themes, type ThemeName } from './colors';

export type ThemePreference = 'system' | ThemeName;

const STORAGE_KEY = 'movielog.themePreference';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ThemeName;
  /** Raw values of the active theme, for props that can't use className (icons, navigators). */
  colors: (typeof themes)[ThemeName];
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setHydrated(true);
    });
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  // RN can report 'unspecified'; treat anything but explicit light as dark.
  const resolved: ThemeName =
    preference === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : preference;

  // Hold rendering one frame until the stored preference loads, so a user
  // with a manual override never sees a flash of the wrong theme at launch.
  if (!hydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ preference, resolved, colors: themes[resolved], setPreference }}
    >
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <View style={vars(themes[resolved])} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Pins a subtree to one theme regardless of system/user preference. Overrides
// both the CSS variables (for className-based colors) and the useTheme()
// colors object (for the icon/cursor/placeholder colors FieldInput and
// Button read directly) so nothing in the subtree leaks the resolved theme.
export function ThemeOverride({
  theme,
  children,
}: PropsWithChildren<{ theme: ThemeName }>) {
  const { setPreference } = useTheme();
  return (
    <ThemeContext.Provider
      value={{ preference: theme, resolved: theme, colors: themes[theme], setPreference }}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={vars(themes[theme])} className="flex-1 bg-background">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
