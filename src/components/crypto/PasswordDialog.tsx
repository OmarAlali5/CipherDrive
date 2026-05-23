import { useState, useMemo } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'

interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  onSubmit: (password: string) => void
  isLoading?: boolean
}

// Password strength criteria definitions
const CRITERIA = [
  {
    id: 'length',
    label: 'At least 8 characters',
    regex: /.{8,}/,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    regex: /[A-Z]/,
  },
  {
    id: 'number',
    label: 'At least one number',
    regex: /[0-9]/,
  },
  {
    id: 'special',
    label: 'At least one special character',
    regex: /[!@#$%^&*(),.?":{}|<>]/,
  },
] as const

export const PasswordDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onSubmit,
  isLoading = false,
}: PasswordDialogProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Derive which criteria pass in real-time
  const criteriaStatus = useMemo(
    () => CRITERIA.map((c) => ({ ...c, passed: c.regex.test(password) })),
    [password],
  )

  const isPasswordValid = criteriaStatus.every((c) => c.passed)

  const handleSubmit = () => {
    if (isPasswordValid && !isLoading) {
      onSubmit(password)
      setPassword('')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      onOpenChange(open)
      if (!open) setPassword('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-(--border)/50 bg-(--background)/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl tracking-tight">
            <div className="rounded-lg bg-(--primary)/10 p-1.5">
              <Lock className="h-5 w-5 text-(--primary)" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base text-(--muted-foreground) mt-2 text-balance">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-5">
          {/* Critical warning */}
          <Alert variant="warning" className="bg-amber-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Warning</AlertTitle>
            <AlertDescription>
              CRITICAL: Your password is NOT stored anywhere on our servers. If you
              forget it, your file CANNOT be recovered by anyone. Please store it securely.
            </AlertDescription>
          </Alert>

          {/* Password input */}
          <div className="space-y-2.5">
            <Label htmlFor="encrypt-password" className="text-sm font-medium">
              Encryption Password
            </Label>
            <div className="relative group">
              <Input
                id="encrypt-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your encryption password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10 h-11 bg-(--muted)/20 border-(--border)/50 focus-visible:ring-(--primary)/30 transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isPasswordValid && !isLoading) {
                    handleSubmit()
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)/70 hover:text-(--foreground) transition-colors p-1 rounded-md hover:bg-(--muted)/50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password strength checklist */}
          <div className="rounded-lg border border-(--border)/40 bg-(--muted)/10 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-(--muted-foreground)/60 mb-1">
              Password Requirements
            </p>
            {criteriaStatus.map((criterion) => (
              <div
                key={criterion.id}
                className="flex items-center gap-2.5"
              >
                {criterion.passed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 transition-colors duration-200" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-500 transition-colors duration-200" />
                )}
                <span
                  className={`text-sm transition-colors duration-200 ${
                    criterion.passed
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  {criterion.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="border-(--border)/50 hover:bg-(--muted)/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isPasswordValid || isLoading}
            className="min-w-[140px] shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
