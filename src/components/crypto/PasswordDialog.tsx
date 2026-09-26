import { useId, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter'
import { formatFileSize } from '@/lib/format'
import { MIN_PASSWORD_LENGTH } from '@/lib/passwordStrength'
import {
  LockKey,
  Eye,
  EyeClosed,
  CircleNotch,
  File as FileIcon,
  Info,
} from '@phosphor-icons/react'

interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  fileSize: number
  confirmLabel: string
  onSubmit: (password: string) => void
  isLoading?: boolean
}

export const PasswordDialog = ({
  open,
  onOpenChange,
  fileName,
  fileSize,
  confirmLabel,
  onSubmit,
  isLoading = false,
}: PasswordDialogProps) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touchedConfirm, setTouchedConfirm] = useState(false)
  const confirmId = useId()

  const meetsMinimum = password.length >= MIN_PASSWORD_LENGTH
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const showMismatch = touchedConfirm && confirmPassword.length > 0 && !passwordsMatch
  const canSubmit = meetsMinimum && passwordsMatch && !isLoading

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(password)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return
    if (!next) {
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setTouchedConfirm(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="rounded-md bg-primary/10 p-1.5">
              <LockKey weight="regular" className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            Encrypt &amp; upload
          </DialogTitle>
          <DialogDescription>
            Choose a password. It stays in your browser and is used to derive
            the AES-256-GCM key. Nothing is sent anywhere until the file is
            already encrypted.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <FileIcon weight="regular" className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          </div>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {formatFileSize(fileSize)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="encrypt-password">Password</Label>
            <div className="relative">
              <Input
                id="encrypt-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters…"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSubmit) handleSubmit()
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {showPassword ? (
                  <EyeClosed weight="regular" className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye weight="regular" className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={confirmId}>Confirm password</Label>
            <Input
              id={confirmId}
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter the same password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouchedConfirm(true)}
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={showMismatch}
              aria-describedby={showMismatch ? `${confirmId}-error` : undefined}
              className={showMismatch ? 'border-destructive focus-visible:ring-destructive' : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit) handleSubmit()
              }}
            />
            {showMismatch && (
              <p id={`${confirmId}-error`} className="text-xs text-destructive">
                Passwords don&rsquo;t match yet.
              </p>
            )}
          </div>

          <div className="flex gap-2.5 rounded-md border border-warning/30 bg-warning-bg p-3">
            <Info weight="regular" className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-warning-foreground">
              This password is never stored, transmitted, or logged. If you
              lose it, this file cannot be decrypted by anyone, including us.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="min-w-[150px]">
            {isLoading ? (
              <>
                <CircleNotch weight="bold" className="h-4 w-4 animate-spin" aria-hidden="true" />
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
