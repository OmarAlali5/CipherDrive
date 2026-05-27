export interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

export type ProcessState = 'idle' | 'preparing' | 'encrypting' | 'uploading' | 'finalizing' | 'success' | 'error';


export interface EncryptedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  uploadedAt: Date;
  isFolder?: boolean;
}

export interface DownloadProgress {
  fileName: string;
  progress: number;
  status: 'downloading' | 'decrypting' | 'done' | 'error';
}

