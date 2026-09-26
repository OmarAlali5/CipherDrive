/**
 * Theme resolution shared between the blocking bootstrap script in
 * index.html (which must run before first paint to avoid a flash of the
 * wrong theme) and the in-app theme store (src/store/themeStore.ts).
 *
 * Preference is one of 'light' | 'dark' | 'system' and is persisted to
 * localStorage. 'system' means "follow the OS", which is also the
 * default for a first-time visitor.
 */

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'cipherdrive-theme'

// Approximate sRGB hex for the --background token in each theme, used
// only for the <meta name="theme-color"> browser-chrome color.
const LIGHT_META_COLOR = '#ffffff'
const DARK_META_COLOR = '#0c1016'

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system'
    ? systemPrefersDark()
      ? 'dark'
      : 'light'
    : preference
}

/** Applies a preference to the DOM: data-theme attribute, color-scheme,
 * and the theme-color meta tags. Safe to call on every change. */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference)
  const root = document.documentElement
  if (preference === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', preference)
  }
  root.style.colorScheme = resolved
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((tag) =>
      tag.setAttribute(
        'content',
        resolved === 'dark' ? DARK_META_COLOR : LIGHT_META_COLOR,
      ),
    )
  return resolved
}

export function setThemePreference(preference: ThemePreference): ResolvedTheme {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Storage may be unavailable (private mode); theme still applies
    // for this page load, it just won't persist.
  }
  return applyTheme(preference)
}
