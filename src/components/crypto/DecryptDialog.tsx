import { useEffect, useRef, useState } from 'react'
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
import { LockOpen, Eye, EyeClosed, CircleNotch, WarningCircle } from '@phosphor-icons/react'

interface DecryptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  onSubmit: (password: string) => void
  isLoading?: boolean
  /** Shown inline and keeps the dialog open, so a mistyped password can
   * be corrected without reopening the whole flow. Cleared by the
   * caller the next time the dialog opens. */
  errorMessage?: string | null
}

export const DecryptDialog = ({
  open,
  onOpenChange,
  fileName,
  onSubmit,
  isLoading = false,
  errorMessage = null,
}: DecryptDialogProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (errorMessage) {
      inputRef.current?.select()
    }
  }, [errorMessage])

  const handleSubmit = () => {
    if (password.trim() && !isLoading) {
      onSubmit(password)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return
    if (!next) {
      setPassword('')
      setShowPassword(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="rounded-md bg-primary/10 p-1.5">
              <LockOpen weight="regular" className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            Decrypt &amp; download
          </DialogTitle>
          <DialogDescription>
            Enter the password used to encrypt &ldquo;{fileName}&rdquo; to
            unlock and download it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="decrypt-password">Password</Label>
          <div className="relative">
            <Input
              id="decrypt-password"
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter the encryption password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              autoFocus
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? 'decrypt-error' : undefined}
              className={`pr-10 ${errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password.trim() && !isLoading) handleSubmit()
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
          {errorMessage && (
            <p id="decrypt-error" className="flex items-start gap-1.5 text-xs text-destructive">
              <WarningCircle weight="regular" className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errorMessage}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!password.trim() || isLoading} className="min-w-[150px]">
            {isLoading ? (
              <>
                <CircleNotch weight="bold" className="h-4 w-4 animate-spin" aria-hidden="true" />
                Decrypting…
              </>
            ) : (
              'Decrypt & download'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
