// Single source of truth for color values. Components never use these
// directly — they use semantic Tailwind classes (bg-background, text-muted…)
// which resolve to the CSS variables ThemeProvider injects from this map.
export const themes = {
  light: {
    '--color-background': '#ffffff',
    '--color-surface': '#f4f4f5', // zinc-100
    '--color-surface-alt': '#e4e4e7', // zinc-200
    '--color-border': '#d4d4d8', // zinc-300
    '--color-text-primary': '#18181b', // zinc-900
    '--color-text-muted': '#52525b', // zinc-600
    '--color-text-faint': '#a1a1aa', // zinc-400
    '--color-primary': '#8b5cf6', // violet-500
    '--color-on-primary': '#ffffff',
  },
  dark: {
    '--color-background': '#09090b', // zinc-950
    '--color-surface': '#18181b', // zinc-900
    '--color-surface-alt': '#27272a', // zinc-800
    '--color-border': '#3f3f46', // zinc-700
    '--color-text-primary': '#fafafa', // zinc-50
    '--color-text-muted': '#a1a1aa', // zinc-400
    '--color-text-faint': '#71717a', // zinc-500
    '--color-primary': '#a78bfa', // violet-400
    '--color-on-primary': '#18181b', // dark text: white fails contrast on violet-400
  },
} as const;

export type ThemeName = keyof typeof themes;
