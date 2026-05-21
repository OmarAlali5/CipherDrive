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

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'encrypting' | 'uploading' | 'done' | 'error';
}

export interface DownloadProgress {
  fileName: string;
  progress: number;
  status: 'downloading' | 'decrypting' | 'done' | 'error';
}

export interface CryptoPayload {
  salt: string;
  iv: string;
  authTag: string;
  encryptedChunks: number;
}
