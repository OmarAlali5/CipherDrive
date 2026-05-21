/**
 * Core cryptographic facade for CipherDrive.
 *
 * This module preserves the public API that UI components depend on,
 * while delegating all heavy logic to the Crypto Abstraction Layer:
 *   - Key derivation  → src/lib/crypto/kdf/
 *   - AES-GCM engine  → src/lib/crypto/engine.ts
 *   - Binary format   → src/lib/crypto/format.ts
 *
 * Component imports (`encryptData`, `decryptData`, `packageEncryptedFile`,
 * `unpackageEncryptedFile`) work unchanged with the same call signatures.
 */

import { deriveKey as kdfDeriveKey, getKdfConfigForVersion } from '@/lib/crypto/kdf';
import type { KdfConfig } from '@/lib/crypto/kdf';
import { packEncryptedFile, unpackEncryptedFile } from '@/lib/crypto/format';

/** The version string stamped on every newly encrypted file. */
const CURRENT_VERSION = 'CDRV2';

/**
 * Module-scoped cache that bridges unpackageEncryptedFile → decryptData.
 *
 * When unpackageEncryptedFile extracts a version header, it looks up the
 * matching KdfConfig and stores it here, keyed by the salt Uint8Array
 * reference. When decryptData receives that same salt, it retrieves the
 * config — enabling version-aware decryption without changing call
 * signatures. WeakMap ensures automatic cleanup once the salt is GC'd.
 */
const saltToKdfConfig = new WeakMap<Uint8Array, KdfConfig>();

// ─── KDF convenience re-export ──────────────────────────────────────

/**
 * Default KDF configuration for CipherDrive V2.
 * PBKDF2 with 600,000 iterations (OWASP recommendation), SHA-256, 256-bit key.
 */
const DEFAULT_KDF_CONFIG: KdfConfig = {
  algorithm: 'PBKDF2',
  iterations: 600_000,
  hash: 'SHA-256',
  keyLength: 256,
};

/**
 * Derives an AES-GCM CryptoKey from a plain-text password and a salt.
 * Delegates to the KDF Abstraction Layer.
 *
 * @param password - The user's plain-text password.
 * @param salt - A random Uint8Array salt (recommended 16 bytes).
 * @param config - Optional KDF override; defaults to PBKDF2-600K-SHA256.
 * @returns A Promise that resolves to a 256-bit AES-GCM CryptoKey.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  config: KdfConfig = DEFAULT_KDF_CONFIG,
): Promise<CryptoKey> {
  return kdfDeriveKey(password, salt, config);
}

// ─── Encryption ─────────────────────────────────────────────────────

/**
 * Encrypts an ArrayBuffer of data using AES-GCM with a key derived from
 * the password. Generates a random 16-byte salt and 12-byte IV.
 *
 * Uses the CURRENT_VERSION (CDRV2) KDF parameters for key derivation.
 * AES-GCM natively appends the Auth Tag to the returned ciphertext.
 *
 * @param data - The ArrayBuffer containing the plain-text data to encrypt.
 * @param password - The user's plain-text password.
 * @returns Salt, IV, and encrypted buffer for subsequent packaging.
 */
export async function encryptData(
  data: ArrayBuffer,
  password: string,
): Promise<{ encryptedBuffer: ArrayBuffer; salt: Uint8Array; iv: Uint8Array }> {
  // Generate a random 16-byte salt for key derivation
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  // Generate a random 12-byte IV (Initialization Vector) suitable for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive the AES-256-GCM key using the current version's KDF settings
  const kdfConfig = getKdfConfigForVersion(CURRENT_VERSION);
  const key = await kdfDeriveKey(password, salt, kdfConfig);

  // Encrypt the data — AES-GCM appends the 16-byte auth tag automatically
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    data,
  );

  return { encryptedBuffer, salt, iv };
}

// ─── Decryption (version-aware) ─────────────────────────────────────

/**
 * Decrypts AES-GCM encrypted data using the provided password, salt, and IV.
 * Throws an error if the password is wrong or if the data/Auth Tag has
 * been tampered with.
 *
 * @param encryptedData - The ciphertext+tag ArrayBuffer (or Uint8Array).
 * @param password - The user's plain-text password.
 * @param salt - The original salt used during encryption.
 * @param iv - The original initialization vector used during encryption.
 * @param kdfConfig - Optional KDF override; defaults to CDRV2 settings.
 * @returns The decrypted ArrayBuffer.
 */
export async function decryptData(
  encryptedData: ArrayBuffer | Uint8Array,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array,
  kdfConfig?: KdfConfig,
): Promise<ArrayBuffer> {
  // If no explicit config was passed, try the version-aware cache that
  // unpackageEncryptedFile populated. Fall back to CDRV2 defaults.
  const resolvedConfig =
    kdfConfig ?? saltToKdfConfig.get(salt) ?? DEFAULT_KDF_CONFIG;

  const key = await kdfDeriveKey(password, salt, resolvedConfig);

  console.log("Detected Version:", kdfConfig ? "manual" : (saltToKdfConfig.has(salt) ? "cached" : "default"));
  console.log("Salt Length:", salt.byteLength); // MUST be 16
  console.log("IV Length:", iv.byteLength); // MUST be 12

  return window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    encryptedData as any,
  );
}

// ─── Binary format: pack / unpack ───────────────────────────────────

/**
 * Packages the salt, IV, and encrypted buffer into a single Blob for
 * storage / upload. Wraps the versioned binary format packer.
 *
 * Format: [VERSION 5B] + [SALT 16B] + [IV 12B] + [CIPHERTEXT+TAG]
 *
 * @param salt - The 16-byte salt used for key derivation.
 * @param iv - The 12-byte initialization vector.
 * @param encryptedBuffer - The AES-GCM ciphertext with appended auth tag.
 * @returns A single packaged Blob.
 */
export function packageEncryptedFile(
  salt: Uint8Array,
  iv: Uint8Array,
  encryptedBuffer: ArrayBuffer,
): Blob {
  const packed = packEncryptedFile(
    CURRENT_VERSION,
    salt,
    iv,
    new Uint8Array(encryptedBuffer),
  );
  return new Blob([packed], { type: 'application/octet-stream' });
}

/**
 * Unpackages a downloaded encrypted buffer back into its version,
 * salt, IV, and ciphertext components.
 *
 * The extracted `version` is used to look up the correct KDF config
 * for decryption, enabling transparent legacy (CDRV1) support.
 *
 * @param buffer - The downloaded ArrayBuffer.
 * @returns Version, salt, IV, and the encrypted data.
 */
export function unpackageEncryptedFile(
  buffer: ArrayBuffer,
): { version: string; salt: Uint8Array; iv: Uint8Array; encryptedData: Uint8Array } {
  const { version, salt, iv, ciphertextAndTag } = unpackEncryptedFile(buffer);

  // Cache the version-specific KDF config keyed by this salt reference.
  // decryptData will pick it up automatically when the same salt is passed.
  saltToKdfConfig.set(salt, getKdfConfigForVersion(version));

  return { version, salt, iv, encryptedData: ciphertextAndTag };
}
