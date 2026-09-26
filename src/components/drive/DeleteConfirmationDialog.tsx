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
import { Warning, CircleNotch } from '@phosphor-icons/react'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  isFolder?: boolean
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

const CONFIRM_WORD = 'DELETE'

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  itemName,
  isFolder = false,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) => {
  const [confirmText, setConfirmText] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (isLoading) return
    if (!next) setConfirmText('')
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    if (confirmText === CONFIRM_WORD) {
      await onConfirm()
      setConfirmText('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Warning weight="regular" className="h-5 w-5" aria-hidden="true" />
            Delete {isFolder ? 'folder' : 'file'}
          </DialogTitle>
          <DialogDescription className="text-balance leading-relaxed">
            You are about to permanently delete &ldquo;{itemName}&rdquo; from
            Google Drive. This cannot be undone.
            {isFolder && ' Everything inside this folder will be deleted too.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirm-delete" className="text-sm font-medium">
            Type <span className="font-semibold text-destructive">{CONFIRM_WORD}</span> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_WORD}
            disabled={isLoading}
            className="border-destructive/40 focus-visible:ring-destructive"
            autoComplete="off"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && confirmText === CONFIRM_WORD && !isLoading) {
                handleConfirm()
              }
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== CONFIRM_WORD || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <CircleNotch weight="bold" className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Confirm delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
