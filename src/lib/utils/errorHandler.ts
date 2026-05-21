/**
 * Secure Error Handler for CipherDrive
 *
 * Maps complex errors (like Web Crypto failures, network issues, API limits)
 * into secure, user-friendly messages without leaking sensitive information.
 */

export function getSecureErrorMessage(error: any): string {
  if (!error) return 'An unexpected secure operation error occurred.';

  const message = (error.message || error.toString()).toLowerCase();
  const name = error.name;
  const status = error.status;

  // 1. Quota or Size limit
  if (message.includes('quota') || message.includes('size')) {
    return 'File exceeds the 500MB limit.';
  }

  // 2. Cryptographic Failure
  // Web Crypto API throws 'OperationError' on decryption failure (e.g. wrong password or auth tag mismatch).
  // CRITICAL: We do not distinguish between wrong password and corrupted file to prevent padding oracle attacks.
  if (name === 'OperationError') {
    return 'Decryption failed: Incorrect password or corrupted file.';
  }

  // 3. Network or Fetch error
  if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
    return 'Network error: Upload interrupted. Please check your connection.';
  }

  // 4. Authentication Error
  if (status === 401 || status === 403 || message.includes('unauthorized') || message.includes('401')) {
    return 'Authentication failed: Please sign in to Google again.';
  }

  // 5. Default generic error
  return 'An unexpected secure operation error occurred.';
}
