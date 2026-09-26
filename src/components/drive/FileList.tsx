import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useFileStore } from '@/store/fileStore'
import { useAuthStore } from '@/store/authStore'
import { DecryptDialog } from '@/components/crypto/DecryptDialog'
import { DeleteConfirmationDialog } from '@/components/drive/DeleteConfirmationDialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { File as FileIcon, DownloadSimple, LockKey, CircleNotch, CheckCircle, Trash, Folder, CaretRight, FolderPlus, Shield } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { downloadFileFromDrive } from '@/core/driveApi'
import { unpackageEncryptedFile, decryptData } from '@/core/crypto'
import { formatFileSize, formatDate } from '@/lib/format'
import { getSecureErrorMessage } from '@/lib/errors/errorHandler'
import { listItem } from '@/lib/motionVariants'
import { cn } from '@/lib/utils'

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4" aria-hidden="true">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export const FileList = () => {
  const {
    files,
    setDownloadProgress,
    downloadProgress,
    deleteFileAction,
    isLoadingFiles,
    fetchFiles,
    currentFolderId,
    breadcrumbs,
    createFolderAction,
    navigateToFolder,
    navigateHome,
    navigateToBreadcrumb,
  } = useFileStore()
  const { accessToken } = useAuthStore()
  const prefersReducedMotion = useReducedMotion()

  const [downloadFile, setDownloadFile] = useState<{
    id: string
    name: string
    originalName: string
  } | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [decryptError, setDecryptError] = useState<string | null>(null)

  // Folder Creation State
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; isFolder: boolean } | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (accessToken) {
      fetchFiles(accessToken)
    }
  }, [accessToken, fetchFiles, currentFolderId])

  const handleDecryptAndDownload = (password: string) => {
    if (!downloadFile) return
    if (!accessToken) {
      toast.error('Not authenticated with Google. Please log in.')
      return
    }

    const fileToProcess = downloadFile
    setDecryptError(null)

    ;(async () => {
      setIsProcessing(true)
      setProgress(0)

      try {
        setDownloadProgress({
          fileName: fileToProcess.originalName,
          progress: 10,
          status: 'downloading',
        })

        // 1. Download file from Google Drive
        const encryptedBuffer = await downloadFileFromDrive(fileToProcess.id, accessToken)
        setProgress(50)

        setDownloadProgress({
          fileName: fileToProcess.originalName,
          progress: 50,
          status: 'decrypting',
        })

        // 2. Unpackage the salt, IV, and ciphertext
        const { salt, iv, encryptedData } = unpackageEncryptedFile(encryptedBuffer)

        // 3. Decrypt the file using the native Web Crypto API
        const decryptedBuffer = await decryptData(encryptedData, password, salt, iv)
        setProgress(90)

        // 4. Trigger download in the browser
        const blob = new Blob([decryptedBuffer], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileToProcess.originalName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setProgress(100)
        setDownloadProgress({
          fileName: fileToProcess.originalName,
          progress: 100,
          status: 'done',
        })

        toast.success('File decrypted and downloaded', {
          description: fileToProcess.originalName,
          icon: <CheckCircle weight="regular" className="h-4 w-4 text-primary" />
        })
        setShowPasswordDialog(false)
        setDownloadFile(null)
      } catch (error) {
        console.error('Decryption/Download Error:', error)
        // Keep the dialog open so a mistyped password can be retried
        // without restarting the whole flow.
        setDecryptError(getSecureErrorMessage(error))
        setDownloadProgress(null)
      } finally {
        setIsProcessing(false)
        setProgress(0)
      }
    })()
  }

  const handleDownloadClick = (
    id: string,
    name: string,
    originalName: string,
  ) => {
    setDownloadFile({ id, name, originalName })
    setDecryptError(null)
    setShowPasswordDialog(true)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !accessToken) return
    setIsCreatingFolder(true)
    try {
      await createFolderAction(newFolderName.trim(), accessToken)
      setNewFolderName('')
      setShowNewFolderDialog(false)
    } catch {
      // createFolderAction already surfaces a toast; keep the dialog
      // open with the typed name so the user doesn't have to retype it.
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteClick = (id: string, name: string, isFolder: boolean) => {
    setDeleteTarget({ id, name, isFolder })
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !accessToken) return
    setIsDeleting(true)
    try {
      await deleteFileAction(deleteTarget.id, accessToken)
      toast.success('Successfully deleted', {
        description: deleteTarget.name,
      })
      setShowDeleteDialog(false)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete', {
        description: 'An error occurred while deleting from Google Drive.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto text-sm text-muted-foreground">
        <button onClick={navigateHome} className="shrink-0 rounded font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Home
        </button>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={b.id}>
            <CaretRight weight="bold" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className="max-w-[150px] shrink-0 truncate rounded font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {b.name}
            </button>
          </React.Fragment>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowNewFolderDialog(true)}
        className="shrink-0"
      >
        <FolderPlus weight="regular" className="h-4 w-4" aria-hidden="true" />
        New folder
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      {toolbar}

      {/* Skeletons only on the very first fetch. fetchFiles() also runs
          right after every successful upload to re-sync with Drive —
          gating this on `files.length === 0` keeps that refresh from
          wiping the list (and the new row's entrance animation) every
          time a file is added. */}
      {isLoadingFiles && files.length === 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="divide-y divide-border">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        </div>
      ) : files.length === 0 ? (
        /* ─── Empty State ─── */
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Shield weight="regular" className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {currentFolderId ? 'This folder is empty' : 'Your vault is empty'}
          </p>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Use the upload area above to encrypt your first file, or create a
            folder to organize your vault.
          </p>
          <Button onClick={() => setShowNewFolderDialog(true)} variant="outline" className="mt-6">
            <FolderPlus weight="regular" className="h-4 w-4" aria-hidden="true" />
            New folder
          </Button>
        </div>
      ) : (
        /* ─── File List ─── */
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
            <LockKey weight="regular" className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">Encrypted files</span>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
              {files.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {files.map((file) => (
              <motion.li
                key={file.id}
                layout={!prefersReducedMotion}
                {...(!prefersReducedMotion
                  ? { variants: listItem, initial: 'hidden', animate: 'visible', exit: 'exit' }
                  : {})}
                className="group flex flex-col gap-3 px-5 py-3.5 transition-colors hover:bg-accent/50 focus-within:bg-accent/50 sm:flex-row sm:items-center"
              >
                {file.isFolder ? (
                  <button
                    type="button"
                    onClick={() => navigateToFolder(file.id, file.name)}
                    className="flex min-w-0 flex-1 items-center gap-4 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
                      <Folder weight="regular" className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="mt-0.5 font-mono-tabular text-xs text-muted-foreground">
                        {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
                      <FileIcon weight="regular" className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{file.originalName}</p>
                      <div className="mt-0.5 flex items-center gap-2.5 font-mono-tabular text-xs text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5">{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    'flex shrink-0 items-center gap-1 self-end transition-opacity sm:self-auto',
                    'sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
                  )}
                >
                  {file.isFolder ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToFolder(file.id, file.name)}
                    >
                      Open
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDownloadClick(
                          file.id,
                          file.name,
                          file.originalName,
                        )
                      }
                    >
                      <DownloadSimple weight="regular" className="h-4 w-4" aria-hidden="true" />
                      Decrypt
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteClick(file.id, file.isFolder ? file.name : file.originalName, !!file.isFolder)}
                    aria-label={`Delete ${file.isFolder ? file.name : file.originalName}`}
                  >
                    <Trash weight="regular" className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {/* Download Progress */}
      {isProcessing && downloadProgress && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-3 truncate">
              <div className="rounded-lg bg-primary/10 p-2">
                <DownloadSimple weight="regular" className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col items-start">
                <span className="truncate font-medium text-foreground">{downloadProgress.fileName}</span>
                <span className="font-mono text-xs text-muted-foreground" aria-live="polite">
                  {progress < 60 ? 'Downloading…' : 'Decrypting…'}
                </span>
              </div>
            </div>
            <CircleNotch weight="bold" className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <Progress value={progress} />
            <div className="flex justify-between font-mono-tabular text-xs text-muted-foreground">
              <span>{progress}%</span>
              <span>{progress === 100 ? 'Complete' : 'Processing'}</span>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={(open) => !isCreatingFolder && setShowNewFolderDialog(open)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
            <DialogDescription>
              Folder names are stored as plain text on Google Drive for
              navigation. They are not encrypted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder name</Label>
            <Input
              id="folderName"
              placeholder="e.g. Invoices 2026"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder()
                }
              }}
              disabled={isCreatingFolder}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)} disabled={isCreatingFolder}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || isCreatingFolder}>
              {isCreatingFolder && <CircleNotch weight="bold" className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Create folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DecryptDialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          if (!isProcessing) {
            setShowPasswordDialog(open)
            if (!open) {
              setDownloadFile(null)
              setDecryptError(null)
            }
          }
        }}
        fileName={downloadFile?.originalName ?? ''}
        onSubmit={handleDecryptAndDownload}
        isLoading={isProcessing}
        errorMessage={decryptError}
      />

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setShowDeleteDialog(open)
            if (!open) setDeleteTarget(null)
          }
        }}
        itemName={deleteTarget?.name ?? ''}
        isFolder={deleteTarget?.isFolder}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
