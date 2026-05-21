import { create } from 'zustand'
import type { EncryptedFile, DownloadProgress, ProcessState } from '@/types'
import { listFilesFromDrive, createFolder, deleteFileFromDrive } from '@/core/driveApi'
import { toast } from 'sonner'

interface FileState {
  files: EncryptedFile[]
  status: ProcessState
  uploadProgress: number
  errorMessage: string | null
  downloadProgress: DownloadProgress | null
  isLoadingFiles: boolean
  currentFolderId: string | null
  breadcrumbs: { id: string; name: string }[]
  addFile: (file: EncryptedFile) => void
  setStatus: (status: ProcessState) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  resetState: () => void
  setDownloadProgress: (progress: DownloadProgress | null) => void
  deleteFileAction: (id: string, accessToken: string) => Promise<void>
  fetchFiles: (accessToken: string) => Promise<void>
  createFolderAction: (name: string, accessToken: string) => Promise<void>
  navigateToFolder: (id: string, name: string) => void
  navigateHome: () => void
  navigateToBreadcrumb: (index: number) => void
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  status: 'idle',
  uploadProgress: 0,
  errorMessage: null,
  downloadProgress: null,
  isLoadingFiles: false,
  currentFolderId: null,
  breadcrumbs: [],
  addFile: (file) =>
    set((state) => ({
      files: [file, ...state.files],
    })),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ uploadProgress: progress }),
  setError: (errorMessage) => set({ errorMessage, status: 'error' }),
  resetState: () => set({ status: 'idle', uploadProgress: 0, errorMessage: null }),
  setDownloadProgress: (progress) => set({ downloadProgress: progress }),
  deleteFileAction: async (id: string, accessToken: string) => {
    try {
      await deleteFileFromDrive(id, accessToken)
      set((state) => ({
        files: state.files.filter((f) => f.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error // Re-throw to be handled by the UI
    }
  },
  fetchFiles: async (accessToken: string) => {
    const { currentFolderId } = get()
    set({ isLoadingFiles: true })
    try {
      const driveFiles = await listFilesFromDrive(accessToken, currentFolderId)
      const formattedFiles: EncryptedFile[] = driveFiles.map((f: any) => {
        const isFolder = f.mimeType === 'application/vnd.google-apps.folder'
        return {
          id: f.id,
          name: f.name,
          originalName: isFolder ? f.name : f.name.replace(/\.enc$/, ''),
          size: parseInt(f.size || '0', 10),
          uploadedAt: new Date(f.createdTime),
          isFolder,
        }
      })
      
      // Sort: Folders first, then newest files
      formattedFiles.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1
        if (!a.isFolder && b.isFolder) return 1
        return b.uploadedAt.getTime() - a.uploadedAt.getTime()
      })
      
      set({ files: formattedFiles })
    } catch (error: any) {
      console.error('Failed to fetch files from Google Drive:', error)
      toast.error('Failed to load your secure files.')
    } finally {
      set({ isLoadingFiles: false })
    }
  },
  createFolderAction: async (name: string, accessToken: string) => {
    const { currentFolderId, fetchFiles } = get()
    try {
      await createFolder(name, accessToken, currentFolderId)
      await fetchFiles(accessToken)
      toast.success('Folder created successfully!')
    } catch (error) {
      console.error('Failed to create folder:', error)
      toast.error('Failed to create folder.')
    }
  },
  navigateToFolder: (id: string, name: string) =>
    set((state) => ({
      currentFolderId: id,
      breadcrumbs: [...state.breadcrumbs, { id, name }],
    })),
  navigateHome: () => set({ currentFolderId: null, breadcrumbs: [] }),
  navigateToBreadcrumb: (index: number) =>
    set((state) => {
      const newBreadcrumbs = state.breadcrumbs.slice(0, index + 1)
      return {
        breadcrumbs: newBreadcrumbs,
        currentFolderId: newBreadcrumbs[newBreadcrumbs.length - 1].id,
      }
    }),
}))
