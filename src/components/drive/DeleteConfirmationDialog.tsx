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
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) => {
  const [confirmText, setConfirmText] = useState('')

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setConfirmText('') // Reset input when closed
      }
    }
  }

  const handleConfirm = async () => {
    if (confirmText === 'DELETE') {
      await onConfirm()
      setConfirmText('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-(--destructive)">
            <Warning weight="duotone" className="h-5 w-5" />
            Delete Item
          </DialogTitle>
          <DialogDescription className="text-balance leading-relaxed">
            You are about to permanently delete <strong>"{itemName}"</strong> from Google Drive. 
            This action is irreversible and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="font-medium text-sm">
              Please type <span className="font-bold text-(--destructive)">DELETE</span> to confirm:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isLoading}
              className="border-(--destructive)/30 focus-visible:ring-(--destructive)"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== 'DELETE' || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <CircleNotch weight="duotone" className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
