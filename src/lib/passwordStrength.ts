/**
 * A length-first strength heuristic, not a character-class checklist.
 *
 * The previous validator required an uppercase letter, a digit and a
 * symbol, which rejects long, memorable passphrases ("correct horse
 * battery staple") while accepting short, hard-to-remember ones
 * ("Aa1!aaaa"). NIST SP 800-63B and OWASP both recommend favouring
 * length over composition rules for exactly this reason.
 *
 * The only hard requirement is a minimum length. Everything past that
 * is scored to nudge toward a stronger choice, not to block submission.
 */

export const MIN_PASSWORD_LENGTH = 8

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export function scorePassword(password: string): {
  score: number // 0-5
  strength: PasswordStrength
  meetsMinimum: boolean
} {
  if (password.length === 0) {
    return { score: 0, strength: 'empty', meetsMinimum: false }
  }

  let score = 0
  if (password.length >= MIN_PASSWORD_LENGTH) score++
  if (password.length >= 12) score++
  if (password.length >= 20) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const strength: PasswordStrength =
    score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 4 ? 'good' : 'strong'

  return {
    score: Math.min(score, 5),
    strength,
    meetsMinimum: password.length >= MIN_PASSWORD_LENGTH,
  }
}

export const STRENGTH_LABEL: Record<PasswordStrength, string> = {
  empty: '',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
}
