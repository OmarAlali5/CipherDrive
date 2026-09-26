import { scorePassword, STRENGTH_LABEL } from '@/lib/passwordStrength'
import { cn } from '@/lib/utils'

const SEGMENT_COLOR: Record<string, string> = {
  weak: 'bg-destructive',
  fair: 'bg-warning',
  good: 'bg-primary/70',
  strong: 'bg-primary',
}

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { score, strength } = scorePassword(password)
  const filled = Math.max(1, Math.ceil((score / 5) * 4))

  return (
    <div className="space-y-1.5" aria-hidden={password.length === 0}>
      <div className="flex gap-1" role="presentation">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full bg-muted transition-colors motion-reduce:transition-none',
              password.length > 0 && i < filled && SEGMENT_COLOR[strength],
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {password.length > 0 ? `${STRENGTH_LABEL[strength]} password` : ' '}
      </p>
    </div>
  )
}
