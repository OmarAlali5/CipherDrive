/**
 * AES-GCM Encryption / Decryption Engine
 *
 * This module is the single entry point for encrypting and decrypting
 * file data in CipherDrive. It combines:
 *   - The KDF Abstraction Layer (password → CryptoKey)
 *   - The Versioned Binary Format (header + salt + iv + ciphertext)
 *
 * All new files are encrypted as CDRV2 (PBKDF2, 600K iterations).
 * Legacy CDRV1 files (100K iterations) are decrypted transparently
 * because the version header drives KDF parameter selection.
 */

import { deriveKey, getKdfConfigForVersion } from '@/lib/crypto/kdf';
import { packEncryptedFile, unpackEncryptedFile } from '@/lib/crypto/format';
import { useFileStore } from '@/store/fileStore';


/** The version string stamped on every newly encrypted file. */
const CURRENT_VERSION = 'CDRV2';

/**
 * Encrypts an ArrayBuffer using AES-256-GCM and returns a single
 * packed buffer in the versioned CipherDrive format.
 *
 * Steps:
 *   1. Generate a random 16-byte salt and 12-byte IV.
 *   2. Derive an AES-256-GCM key via the KDF layer (CDRV2 config).
 *   3. Encrypt the plaintext — AES-GCM appends the auth tag automatically.
 *   4. Pack [VERSION][SALT][IV][CIPHERTEXT+TAG] into one ArrayBuffer.
 *
 * @param data     - The plaintext file data.
 * @param password - The user's password (exists only in RAM).
 * @returns A packed ArrayBuffer ready for upload / storage.
 */
export async function encryptFile(
  data: ArrayBuffer,
  password: string,
): Promise<ArrayBuffer> {
  // 16-byte random salt for key derivation
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  // 12-byte random IV — the recommended size for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive key using the current version's KDF parameters
  const kdfConfig = getKdfConfigForVersion(CURRENT_VERSION);
  const key = await deriveKey(password, salt, kdfConfig);

  // Dispatch state change right before encryption
  useFileStore.getState().setStatus('encrypting');

  // AES-GCM encrypt; the returned buffer contains ciphertext + 16-byte auth tag
  const ciphertextAndTag = new Uint8Array(
    await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      data,
    ),
  );

  // Pack everything into the versioned binary format
  return packEncryptedFile(CURRENT_VERSION, salt, iv, ciphertextAndTag);
}

/**
 * Decrypts a CipherDrive versioned encrypted buffer back to plaintext.
 *
 * Steps:
 *   1. Unpack the buffer to extract version, salt, IV, and ciphertext+tag.
 *   2. Look up the KDF config for the extracted version (handles migration).
 *   3. Derive the AES-GCM key using the version-specific parameters.
 *   4. Decrypt and verify the authentication tag.
 *
 * @param encryptedBuffer - The packed CipherDrive encrypted buffer.
 * @param password        - The user's password.
 * @returns The decrypted plaintext ArrayBuffer.
 *
 * @throws {Error} If the version is unrecognized, the password is wrong,
 *                 or the data has been tampered with (auth tag mismatch).
 */
export async function decryptFile(
  encryptedBuffer: ArrayBuffer,
  password: string,
): Promise<ArrayBuffer> {
  // Unpack the versioned binary format
  const { version, salt, iv, ciphertextAndTag } =
    unpackEncryptedFile(encryptedBuffer);

  // Retrieve the correct KDF settings for this file's version.
  // Why this matters: CDRV1 used 100K iterations, CDRV2 uses 600K.
  // Using the wrong iteration count would derive the wrong key and
  // cause decryption to fail with an auth tag mismatch error.
  const kdfConfig = getKdfConfigForVersion(version);
  const key = await deriveKey(password, salt, kdfConfig);

  // Decrypt — AES-GCM validates the appended auth tag automatically.
  // A tampered ciphertext or wrong password will throw an OperationError.
  return window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    ciphertextAndTag as any,
  );
}
