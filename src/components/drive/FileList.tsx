import React, { useState, useEffect } from 'react'
import { useFileStore } from '@/store/fileStore'
import { useAuthStore } from '@/store/authStore'
import { DecryptDialog } from '@/components/crypto/DecryptDialog'
import { DeleteConfirmationDialog } from '@/components/drive/DeleteConfirmationDialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { File as FileIcon, Download, Shield, Lock, Loader2, CheckCircle2, Trash2, Folder, ChevronRight, FolderPlus } from 'lucide-react'
import { toast } from 'sonner'
import { downloadFileFromDrive } from '@/core/driveApi'
import { unpackageEncryptedFile, decryptData } from '@/core/crypto'

const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

  const [downloadFile, setDownloadFile] = useState<{
    id: string
    name: string
    originalName: string
  } | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  
  // Folder Creation State
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
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
    setShowPasswordDialog(false)
    setDownloadFile(null)

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

        toast.success('File decrypted and downloaded successfully!', {
          description: fileToProcess.originalName,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        })
      } catch (error: any) {
        console.error('Decryption/Download Error:', error)
        toast.error('Decryption failed: Incorrect password or corrupted file.')
        setDownloadProgress({
          fileName: fileToProcess.originalName,
          progress: 0,
          status: 'error',
        })
      } finally {
        setTimeout(() => {
          setIsProcessing(false)
          setProgress(0)
          setDownloadProgress(null)
        }, 3000)
      }
    })()
  }

  const handleDownloadClick = (
    id: string,
    name: string,
    originalName: string,
  ) => {
    setDownloadFile({ id, name, originalName })
    setShowPasswordDialog(true)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !accessToken) return
    setIsCreatingFolder(true)
    await createFolderAction(newFolderName.trim(), accessToken)
    setNewFolderName('')
    setShowNewFolderDialog(false)
    setIsCreatingFolder(false)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name })
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
    } catch (error) {
      toast.error('Failed to delete', {
        description: 'An error occurred while deleting from Google Drive.',
      })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (isLoadingFiles) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-slate-800 bg-[#020617]/40">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-6" />
        <p className="text-xl font-semibold text-white tracking-tight">
          Syncing Vault
        </p>
        <p className="text-base text-slate-500 mt-2 max-w-sm">
          Securely fetching your encrypted files from Google Drive...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Folder Action */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto pb-2">
          <button onClick={navigateHome} className="hover:text-white font-medium transition-colors shrink-0">
            Home
          </button>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={b.id}>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-700" />
              <button
                onClick={() => navigateToBreadcrumb(i)}
                className="hover:text-white font-medium transition-colors shrink-0 truncate max-w-[150px]"
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
          className="shrink-0 border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white transition-all"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      {files.length === 0 ? (
        /* ─── Empty State ─── */
        <div
          className="flex flex-col items-center justify-center py-20 text-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/30"
          style={{
            animation: 'subtle-border-pulse 3s ease-in-out infinite',
          }}
        >
          <div className="relative mb-6">
            <div
              className="absolute -inset-3 rounded-full opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              }}
            />
            <div className="relative rounded-full bg-[#020617] p-6 border border-slate-800 text-slate-600">
              <Shield className="h-12 w-12" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xl font-semibold text-white tracking-tight">
            {currentFolderId ? 'This folder is empty' : 'Vault is empty'}
          </p>
          <p className="text-base text-slate-500 mt-2 max-w-sm">
            Use the drag and drop area above to upload your first file, or create a new folder.
          </p>
          <div className="mt-8">
            <Button
              onClick={() => setShowNewFolderDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Create First Folder
            </Button>
          </div>
        </div>
      ) : (
        /* ─── File List ─── */
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800/60 bg-[#020617]/40">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Encrypted Files</span>
            <span className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-400">
              {files.length}
            </span>
          </div>
          <div className="divide-y divide-slate-800/50">
            {files.map((file) => (
              <div
                key={file.id}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors duration-200"
              >
                <div
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                  onClick={() => file.isFolder && navigateToFolder(file.id, file.name)}
                >
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {file.isFolder ? (
                      <Folder className="h-5 w-5 text-emerald-400 fill-emerald-500/10" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-white group-hover:text-emerald-300 transition-colors">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      {!file.isFolder && (
                        <span className="font-mono font-medium bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {formatSize(file.size)}
                        </span>
                      )}
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                  {file.isFolder ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => navigateToFolder(file.id, file.name)}
                    >
                      Open
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10"
                      onClick={() =>
                        handleDownloadClick(
                          file.id,
                          file.name,
                          file.originalName,
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Decrypt
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    onClick={() => handleDeleteClick(file.id, file.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Progress */}
      {isProcessing && (
        <div className="mt-4 space-y-3 rounded-xl bg-[#020617]/80 backdrop-blur-md p-4 border border-slate-800">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-3 truncate">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <Download className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex flex-col items-start truncate">
                <span className="font-medium truncate text-white">{downloadProgress?.fileName ?? 'Processing file...'}</span>
                <span className="text-xs text-slate-500 font-mono">
                  {progress < 60 ? 'Downloading...' : 'Decrypting...'}
                </span>
              </div>
            </div>
            <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
          </div>
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2 w-full" />
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>{progress}%</span>
              <span>{progress === 100 ? 'Complete' : 'Processing'}</span>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Folder names are stored in plaintext for easy navigation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
              {isCreatingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DecryptDialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open)
          if (!open) setDownloadFile(null)
        }}
        description={`Enter the password you originally used to encrypt "${downloadFile?.originalName ?? ''}" to unlock and download it.`}
        onSubmit={handleDecryptAndDownload}
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
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
