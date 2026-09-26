import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useFileStore } from '@/store/fileStore'
import { useAuthStore } from '@/store/authStore'
import { PasswordDialog } from '@/components/crypto/PasswordDialog'
import { Progress } from '@/components/ui/progress'
import { IndeterminateBar } from '@/components/ui/IndeterminateBar'
import { Button } from '@/components/ui/button'
import { UploadSimple, File as FileIcon, CircleNotch, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { encryptData, packageEncryptedFile } from '@/core/crypto'
import { uploadFileToDrive, isUnauthorizedError } from '@/core/driveApi'
import { getSecureErrorMessage } from '@/lib/errors/errorHandler'
import { formatFileSize } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const STATUS_TEXT: Record<string, string> = {
  preparing: 'Reading file…',
  encrypting: 'Encrypting locally (AES-256-GCM)…',
  finalizing: 'Finalizing…',
  success: 'Upload complete',
}

export const DragDropUploader = () => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processingFile, setProcessingFile] = useState<{ name: string; size: number } | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  // Reduced-motion visitors still get every state change (nothing is
  // skipped), just without the sliding/fading transition between them.
  const fadeDuration = prefersReducedMotion ? 0 : 0.2

  const {
    status,
    uploadProgress,
    errorMessage,
    addFile,
    setStatus,
    setProgress,
    setError,
    resetState,
    currentFolderId,
    fetchFiles,
  } = useFileStore()

  const { accessToken } = useAuthStore()

  // Reset state on unmount
  useEffect(() => {
    return () => resetState()
  }, [resetState])

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = "File exceeds the 500MB limit.";
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      resetState()
      setSelectedFile(file)
      setShowPasswordDialog(true)
    },
    [resetState, setError],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    e.target.value = ''
  }, [handleFile])

  const handleEncryptAndUpload = useCallback(
    (password: string) => {
      if (!selectedFile) return
      if (!accessToken) {
        toast.error('Not authenticated with Google. Please log in.')
        return
      }

      // Close dialog immediately to prevent blocking the UI
      setShowPasswordDialog(false)
      const fileToUpload = selectedFile
      setProcessingFile({ name: fileToUpload.name, size: fileToUpload.size })
      setSelectedFile(null)

      // Run encryption and upload asynchronously in the background
      ;(async () => {
        try {
          setStatus('preparing')
          setProgress(0)

          // 1. Read the selected File as an ArrayBuffer
          const fileBuffer = await fileToUpload.arrayBuffer()

          // 2. Encrypt the file using the native Web Crypto API
          setStatus('encrypting')
          const { encryptedBuffer, salt, iv } = await encryptData(fileBuffer, password)

          // 3. Package the outputs into a single Blob [Version + Salt + IV + EncryptedData]
          const packagedBlob = packageEncryptedFile(salt, iv, encryptedBuffer)

          // 4. Upload to Google Drive directly from the browser
          setStatus('uploading')
          const driveResponse = await uploadFileToDrive(
            packagedBlob,
            fileToUpload.name,
            accessToken,
            currentFolderId,
            (progress) => setProgress(progress)
          )

          setStatus('success')
          setProgress(100)

          // 5. Update the local Zustand store with the actual Drive file ID
          addFile({
            id: driveResponse.id,
            name: driveResponse.name,
            originalName: fileToUpload.name,
            size: packagedBlob.size,
            uploadedAt: new Date(),
          })

          // 6. Refresh the file list from Drive to stay in sync
          if (accessToken) {
            fetchFiles(accessToken)
          }

          toast.success('File encrypted and uploaded securely!')
          setTimeout(() => resetState(), 2500)
        } catch (error) {
          console.error('Upload Process Error:', error)
          if (isUnauthorizedError(error)) {
            useAuthStore.getState().logout()
            toast.error('Session expired, please log in again.')
            resetState()
            return
          }
          const secureMsg = getSecureErrorMessage(error)
          setError(secureMsg)
          toast.error(secureMsg)
        }
      })();
    },
    [selectedFile, accessToken, addFile, setStatus, setProgress, setError, resetState, currentFolderId, fetchFiles],
  )

  const isProcessing = status !== 'idle' && status !== 'error'
  const isSuccess = status === 'success'

  return (
    <>
      <label
        htmlFor="file-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative block overflow-hidden rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200 sm:p-10',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40',
          isProcessing ? 'cursor-default' : 'cursor-pointer',
        )}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />

        {/* Idle content and the processing overlay occupy the same
            space and cross-fade — the dropzone never jumps in height. */}
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            {!isProcessing ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: fadeDuration }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  className={cn(
                    'rounded-full p-3.5 transition-colors',
                    isDragOver ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                  )}
                >
                  <UploadSimple weight="regular" className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">
                    {isDragOver ? 'Drop to encrypt' : 'Drag & drop a file, or click to select'}
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                    Max 500&nbsp;MB · AES-256-GCM · PBKDF2-SHA256 (600,000 rounds)
                  </p>
                </div>
              </motion.div>
            ) : (
              processingFile && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fadeDuration }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex w-full max-w-xs items-center gap-3 text-sm">
                    <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                      <FileIcon weight="regular" className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium text-foreground">
                        {processingFile.name}
                      </p>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={status}
                          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
                          transition={{ duration: fadeDuration }}
                          className="truncate font-mono text-xs text-muted-foreground"
                          aria-live="polite"
                        >
                          {status === 'uploading'
                            ? `Uploading to Google Drive… ${uploadProgress}%`
                            : STATUS_TEXT[status] ?? ''}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      {isSuccess ? (
                        <motion.span
                          key="done"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
                          className="flex shrink-0 items-center gap-1.5"
                        >
                          <CheckCircle weight="fill" className="h-5 w-5 text-primary" aria-hidden="true" />
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatFileSize(processingFile.size)}
                          </span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="spinner"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: fadeDuration }}
                          className="shrink-0"
                        >
                          <CircleNotch weight="bold" className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Stages with no real percentage (reading the file,
                      running PBKDF2 + AES-GCM) get an honest indeterminate
                      bar instead of a fabricated one. Only the upload
                      itself has a real byte-progress number. */}
                  {status === 'uploading' || isSuccess ? (
                    <Progress value={isSuccess ? 100 : uploadProgress} className="w-full max-w-xs" />
                  ) : (
                    <IndeterminateBar label={STATUS_TEXT[status] ?? 'Working'} className="w-full max-w-xs" />
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Error state */}
        <AnimatePresence initial={false}>
          {status === 'error' && errorMessage && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
              transition={{ duration: fadeDuration }}
              className="mt-6 flex items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <WarningCircle weight="regular" className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  resetState()
                }}
                className="ml-1 h-auto shrink-0 px-2 py-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Try again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      {selectedFile && (
        <PasswordDialog
          open={showPasswordDialog}
          onOpenChange={(open) => {
            if (!isProcessing) {
              setShowPasswordDialog(open)
              if (!open) {
                setSelectedFile(null)
                resetState()
              }
            }
          }}
          fileName={selectedFile.name}
          fileSize={selectedFile.size}
          confirmLabel="Encrypt & upload"
          isLoading={isProcessing}
          onSubmit={handleEncryptAndUpload}
        />
      )}
    </>
  )
}
