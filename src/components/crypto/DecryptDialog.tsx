import { useState } from 'react'
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
import { LockOpen, Eye, EyeClosed, CircleNotch } from '@phosphor-icons/react'

interface DecryptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  onSubmit: (password: string) => void
  isLoading?: boolean
}

export const DecryptDialog = ({
  open,
  onOpenChange,
  title = "Decrypt & Download",
  description = "Enter the password you originally used to encrypt this file to unlock and download it.",
  confirmLabel = "Decrypt & Download",
  onSubmit,
  isLoading = false,
}: DecryptDialogProps) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = () => {
    if (password.trim()) {
      onSubmit(password)
      setPassword('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-(--border)/50 bg-(--background)/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-xl tracking-tight">
            <div className="rounded-lg bg-emerald-500/10 p-1.5">
              <LockOpen weight="duotone" className="h-5 w-5 text-emerald-500" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-base text-(--muted-foreground) mt-2 text-balance">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-5">
          <div className="space-y-2.5">
            <Label htmlFor="decrypt-password" className="text-sm font-medium">Encryption Password</Label>
            <div className="relative group">
              <Input
                id="decrypt-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your encryption password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10 h-11 bg-(--muted)/20 border-(--border)/50 focus-visible:ring-emerald-500/30 transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim() && !isLoading) {
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
                  <EyeClosed weight="duotone" className="h-4 w-4" />
                ) : (
                  <Eye weight="duotone" className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-(--border)/50 hover:bg-(--muted)/50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!password.trim() || isLoading} 
            className="min-w-[140px] shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isLoading ? (
              <>
                <CircleNotch weight="duotone" className="mr-2 h-4 w-4 animate-spin" />
                Decrypting...
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
