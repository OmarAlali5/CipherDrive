/**
 * Google Drive REST API interactions for CipherDrive.
 */

import { useAuthStore } from '@/store/authStore'
import { useFileStore } from '@/store/fileStore'
import { toast } from 'sonner'

export interface DriveUploadResponse {
  id: string;
  name: string;
  mimeType: string;
}

/**
 * Global API Error handler checking for 401 Unauthorized
 */
const handleApiError = async (response: Response, context: string) => {
  if (response.status === 401) {
    useAuthStore.getState().logout();
    toast.error('Session expired, please log in again.');
    throw new Error('Unauthorized');
  }
  const errorText = await response.text();
  throw new Error(`Google Drive ${context} failed: ${response.status} - ${errorText}`);
}

/**
 * Uploads a packaged (encrypted) blob to Google Drive using the Resumable Upload Protocol.
 * This is a two-step process to ensure large files or binary blobs are handled correctly.
 *
 * @param fileBlob - The Blob containing the packaged encrypted file data.
 * @param filename - The original filename. The function appends '.enc' to it.
 * @param accessToken - The user's Google OAuth 2.0 access token.
 * @returns A Promise resolving to the Google Drive file metadata response.
 */
export async function uploadFileToDrive(
  fileBlob: Blob,
  filename: string,
  accessToken: string,
  parentId?: string | null
): Promise<DriveUploadResponse> {
  const metadata: any = {
    name: `${filename}.enc`,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  // Step 1: Initiate Resumable Upload
  const fileStore = useFileStore.getState();
  fileStore.setStatus('preparing');

  const initResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    await handleApiError(initResponse, 'upload initialization');
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('Upload initialization failed: No Location header returned from Google Drive.');
  }

  // Step 2: Upload the actual encrypted Blob using XMLHttpRequest for real progress
  fileStore.setStatus('uploading');
  fileStore.setProgress(0);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        fileStore.setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        fileStore.setStatus('finalizing');
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve({ id: 'unknown', name: metadata.name, mimeType: 'application/octet-stream' });
        }
      } else {
        if (xhr.status === 401) {
          useAuthStore.getState().logout();
          toast.error('Session expired, please log in again.');
          reject(new Error('Unauthorized'));
        } else {
          reject(new Error(`Google Drive upload failed: ${xhr.status} - ${xhr.responseText}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fileBlob);
  });
}

/**
 * Downloads a file from Google Drive using its ID.
 *
 * @param fileId - The ID of the file to download.
 * @param accessToken - The user's Google OAuth 2.0 access token.
 * @returns A Promise resolving to the downloaded ArrayBuffer.
 */
export async function downloadFileFromDrive(
  fileId: string,
  accessToken: string
): Promise<ArrayBuffer> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response, 'download');
  }

  return response.arrayBuffer();
}

/**
 * Lists files created by the application from Google Drive.
 *
 * @param accessToken - The user's Google OAuth 2.0 access token.
 * @param parentId - The ID of the folder to list contents from (defaults to 'root').
 * @returns A Promise resolving to an array of Google Drive file metadata objects.
 */
export async function listFilesFromDrive(accessToken: string, parentId?: string | null): Promise<any[]> {
  const q = `trashed=false and '${parentId || 'root'}' in parents`;
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,size,createdTime,mimeType)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    await handleApiError(response, 'list files');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Creates a new folder in Google Drive.
 *
 * @param name - The plaintext name of the folder.
 * @param accessToken - The user's Google OAuth 2.0 access token.
 * @param parentId - The optional ID of the parent folder.
 * @returns A Promise resolving to the created folder metadata.
 */
export async function createFolder(
  name: string,
  accessToken: string,
  parentId?: string | null
): Promise<any> {
  const metadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    await handleApiError(response, 'folder creation');
  }

  return response.json();
}

/**
 * Permanently deletes a file or folder from Google Drive.
 *
 * @param fileId - The ID of the file or folder to delete.
 * @param accessToken - The user's Google OAuth 2.0 access token.
 * @returns A Promise resolving to true if deletion was successful.
 */
export async function deleteFileFromDrive(
  fileId: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    await handleApiError(response, 'deletion');
  }

  return true;
}
