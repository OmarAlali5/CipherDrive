import { Monitor, Moon, Sun } from '@phosphor-icons/react'
import { useThemeStore } from '@/store/themeStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const

const LABELS = {
  system: 'Match system theme',
  light: 'Light theme',
  dark: 'Dark theme',
} as const

interface ThemeToggleProps {
  className?: string
}

/** Cycles system -> light -> dark -> system on click. The icon always
 * reflects the current preference, not the resolved theme, so "system"
 * stays visibly distinct from an explicit choice. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const preference = useThemeStore((s) => s.preference)
  const cyclePreference = useThemeStore((s) => s.cyclePreference)
  const Icon = ICONS[preference]

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={cyclePreference}
      className={cn('text-muted-foreground hover:text-foreground', className)}
      aria-label={`Theme: ${LABELS[preference]}. Click to change.`}
      title={LABELS[preference]}
    >
      <Icon weight="regular" className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
}
