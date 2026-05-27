/**
 * Google Drive REST API interactions for CipherDrive.
 * Pure utility functions with no side effects or store couplings.
 */

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
}

export class DriveApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'DriveApiError';
    this.status = status;
  }
}

const handleApiError = async (response: Response, context: string) => {
  if (response.status === 401) {
    throw new DriveApiError('Unauthorized', 401);
  }
  const errorText = await response.text();
  throw new DriveApiError(`Google Drive ${context} failed: ${response.status} - ${errorText}`, response.status);
}

/**
 * Uploads a packaged (encrypted) blob to Google Drive using the Resumable Upload Protocol.
 *
 * @param fileBlob - The Blob containing the packaged encrypted file data.
 * @param filename - The original filename. The function appends '.enc' to it.
 * @param accessToken - The user's Google OAuth 2.0 access token.
 * @param parentId - The optional ID of the parent folder.
 * @param onProgress - Optional callback for upload progress percentage (0-100).
 * @returns A Promise resolving to the Google Drive file metadata response.
 */
export async function uploadFileToDrive(
  fileBlob: Blob,
  filename: string,
  accessToken: string,
  parentId?: string | null,
  onProgress?: (progress: number) => void
): Promise<DriveFileMetadata> {
  const metadata: { name: string; parents?: string[] } = {
    name: `${filename}.enc`,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as DriveFileMetadata);
        } catch (e) {
          resolve({ id: 'unknown', name: metadata.name, mimeType: 'application/octet-stream' });
        }
      } else {
        if (xhr.status === 401) {
          reject(new DriveApiError('Unauthorized', 401));
        } else {
          reject(new DriveApiError(`Google Drive upload failed: ${xhr.status} - ${xhr.responseText}`, xhr.status));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fileBlob);
  });
}

/**
 * Downloads a file from Google Drive using its ID.
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
 */
export async function listFilesFromDrive(accessToken: string, parentId?: string | null): Promise<DriveFileMetadata[]> {
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
  return data.files as DriveFileMetadata[] || [];
}

/**
 * Creates a new folder in Google Drive.
 */
export async function createFolder(
  name: string,
  accessToken: string,
  parentId?: string | null
): Promise<DriveFileMetadata> {
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
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

  return response.json() as Promise<DriveFileMetadata>;
}

/**
 * Permanently deletes a file or folder from Google Drive.
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
