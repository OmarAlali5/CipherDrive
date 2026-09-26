import { create } from 'zustand'
import {
  applyTheme,
  getStoredPreference,
  resolveTheme,
  setThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '@/lib/theme'

interface ThemeState {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  /** Cycles system -> light -> dark -> system. */
  cyclePreference: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: getStoredPreference(),
  resolvedTheme: resolveTheme(getStoredPreference()),
  setPreference: (preference) => {
    const resolvedTheme = setThemePreference(preference)
    set({ preference, resolvedTheme })
  },
  cyclePreference: () => {
    const order: ThemePreference[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(get().preference) + 1) % order.length]
    get().setPreference(next)
  },
}))

// Keep the resolved theme in sync when the OS preference changes while
// the user has left the "system" option selected.
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const { preference } = useThemeStore.getState()
      if (preference !== 'system') return
      const resolvedTheme = applyTheme('system')
      useThemeStore.setState({ resolvedTheme })
    })
}
