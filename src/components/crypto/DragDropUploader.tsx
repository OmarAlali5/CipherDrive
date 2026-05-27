import { useState, useCallback, useEffect } from 'react'
import { useFileStore } from '@/store/fileStore'
import { useAuthStore } from '@/store/authStore'
import { PasswordDialog } from '@/components/crypto/PasswordDialog'
import { Progress } from '@/components/ui/progress'
import { UploadSimple, File as FileIcon, CircleNotch, WarningCircle } from '@phosphor-icons/react'
import { encryptData, packageEncryptedFile } from '@/core/crypto'
import { uploadFileToDrive } from '@/core/driveApi'
import { getSecureErrorMessage } from '@/lib/errors/errorHandler'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const DragDropUploader = () => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processingFileName, setProcessingFileName] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

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

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = "File exceeds the 500MB limit.";
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    resetState()
    setSelectedFile(file)
    setShowPasswordDialog(true)
  }

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
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    e.target.value = ''
  }, [])

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
      setProcessingFileName(fileToUpload.name)
      setSelectedFile(null)

      // Run encryption and upload asynchronously in the background
      ;(async () => {
        try {
          setStatus('preparing')
          setProgress(0)

          // 1. Read the selected File as an ArrayBuffer
          const fileBuffer = await fileToUpload.arrayBuffer()
          
          // 2. Encrypt the file using the native Web Crypto API engine
          // Note: engine.ts will dispatch 'encrypting' status right before encryption
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
          setTimeout(() => resetState(), 3000)
        } catch (error: any) {
          console.error('Upload Process Error:', error)
          if (error.name === 'DriveApiError' && error.status === 401) {
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

  const getStatusText = () => {
    switch (status) {
      case 'preparing': return 'Preparing encryption...';
      case 'encrypting': return 'Encrypting data...';
      case 'uploading': return `Uploading to Google Drive... (${uploadProgress}%)`;
      case 'finalizing': return 'Finalizing...';
      case 'success': return 'Upload complete!';
      default: return '';
    }
  }

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-xl p-8 sm:p-10 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-2 border-emerald-500 bg-emerald-500/5 scale-[1.02] shadow-xl shadow-emerald-500/10'
            : 'border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-slate-800/60 bg-slate-900/60'
        }`}
      >
        {/* Radial glow behind icon */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)',
          }}
        />

        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
        <label
          htmlFor={isProcessing ? undefined : "file-upload"}
          className={`block relative z-10 ${isProcessing ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-full p-4 transition-all duration-300 ${
                isDragOver
                  ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <UploadSimple weight="duotone" className={`h-8 w-8 ${isDragOver ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                {isDragOver
                  ? 'Drop to encrypt'
                  : 'Drag & drop a file here, or click to select'}
              </p>
              <p className="text-sm text-slate-500 mt-2 font-mono">
                Max 500MB · AES-256-GCM · Zero-knowledge
              </p>
            </div>
          </div>
        </label>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center m-0 z-20 rounded-xl bg-[#020617]/90 backdrop-blur-md">
            <div className="w-full max-w-xs space-y-4 px-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-emerald-500/10 p-2 rounded-lg shrink-0">
                  <FileIcon weight="duotone" className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex flex-col items-start truncate overflow-hidden flex-1">
                  <span className="font-medium truncate w-full text-white text-sm">
                    {status === 'success' ? 'Upload complete' : processingFileName}
                  </span>
                  <span className="text-xs text-emerald-400/80 truncate w-full font-mono">
                    {getStatusText()}
                  </span>
                </div>
                <CircleNotch weight="duotone" className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
              </div>
              <div className="space-y-1.5">
                <Progress value={uploadProgress} className="h-2 w-full" />
              </div>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {status === 'error' && errorMessage && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            <WarningCircle weight="duotone" className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

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
        title="Encrypt & Upload"
        description={`Secure your file "${selectedFile?.name ?? ''}" with an encryption password before uploading.`}
        confirmLabel="Encrypt & Upload"
        isLoading={isProcessing}
        onSubmit={handleEncryptAndUpload}
      />
    </>
  )
}
