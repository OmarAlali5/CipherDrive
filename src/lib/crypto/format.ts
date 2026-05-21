/**
 * Versioned Binary Format — Packer & Unpacker
 *
 * Every CipherDrive encrypted file is stored in this layout:
 *
 *   ┌──────────┬──────────┬──────────┬───────────────────────┐
 *   │ VERSION  │  SALT    │   IV     │  CIPHERTEXT + TAG     │
 *   │ 5 bytes  │ 16 bytes │ 12 bytes │  variable length      │
 *   └──────────┴──────────┴──────────┴───────────────────────┘
 *
 * The 5-byte version header (e.g. "CDRV1", "CDRV2") allows the
 * decryptor to select the correct KDF parameters for that era,
 * enabling seamless migration across algorithm upgrades.
 */

/** Fixed byte lengths for each segment of the binary format. */
const MAGIC_BYTES_LENGTH = 5;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/** Minimum valid file size: header + salt + IV + at least 1 byte of ciphertext. */
const MIN_FILE_SIZE = MAGIC_BYTES_LENGTH + SALT_LENGTH + IV_LENGTH + 1;




/**
 * Result of unpacking an encrypted file buffer.
 */
export interface UnpackedFile {
  /** The version string extracted from the header (e.g. "CDRV1", "CDRV2"). */
  version: string;
  /** The 16-byte salt used for key derivation. */
  salt: Uint8Array;
  /** The 12-byte initialization vector used for AES-GCM. */
  iv: Uint8Array;
  /** The AES-GCM ciphertext with the authentication tag appended. */
  ciphertextAndTag: Uint8Array;
}

/**
 * Packs a version header, salt, IV, and ciphertext+tag into a single
 * contiguous ArrayBuffer ready for storage or upload.
 *
 * @param versionString - The 5-character version identifier (e.g. "CDRV2").
 * @param salt          - The 16-byte cryptographic salt.
 * @param iv            - The 12-byte initialization vector.
 * @param ciphertextAndTag - The AES-GCM ciphertext with appended auth tag.
 * @returns A packed ArrayBuffer in the versioned binary format.
 */
export function packEncryptedFile(
  versionString: string,
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertextAndTag: Uint8Array,
): ArrayBuffer {
  const encoder = new TextEncoder();
  const versionBytes = encoder.encode(versionString);

  if (versionBytes.byteLength !== MAGIC_BYTES_LENGTH) {
    throw new Error(`Version string must encode to exactly ${MAGIC_BYTES_LENGTH} bytes.`);
  }
  if (salt.byteLength !== SALT_LENGTH) {
    throw new Error(`Salt must be exactly ${SALT_LENGTH} bytes.`);
  }
  if (iv.byteLength !== IV_LENGTH) {
    throw new Error(`IV must be exactly ${IV_LENGTH} bytes.`);
  }

  const packed = new Uint8Array(5 + 16 + 12 + ciphertextAndTag.byteLength);

  packed.set(versionBytes, 0);
  packed.set(salt, 5);
  packed.set(iv, 21);
  packed.set(new Uint8Array(ciphertextAndTag.buffer, ciphertextAndTag.byteOffset, ciphertextAndTag.byteLength), 33);

  return packed.buffer;
}

/**
 * Unpacks a CipherDrive encrypted buffer into its constituent parts.
 *
 * Uses `slice()` instead of `subarray()` to completely isolate the resulting
 * buffers in memory. This prevents byte alignment mismatches when feeding
 * the views directly into the Web Crypto API.
 */
export function unpackEncryptedFile(arrayBuffer: ArrayBuffer): UnpackedFile {
  const data = new Uint8Array(arrayBuffer);
  
  if (data.length < MIN_FILE_SIZE) {
    throw new Error(
      `File too small to be a valid encrypted payload: expected at least ${MIN_FILE_SIZE} bytes.`
    );
  }

  const decoder = new TextDecoder();
  const versionBytes = data.slice(0, MAGIC_BYTES_LENGTH);
  const version = decoder.decode(versionBytes);

  if (!version.startsWith('CDR')) {
    // Legacy File Structure (Pre-Versioning)
    // Extract using slice to guarantee isolated memory blocks
    const legacySalt = data.slice(0, 16);
    const legacyIv = data.slice(16, 28);
    const legacyCiphertext = data.slice(28);
    
    return { 
      version: 'CDRV1',
      salt: legacySalt, 
      iv: legacyIv, 
      ciphertextAndTag: legacyCiphertext 
    };
  }

  // Versioned File Structure
  const salt = data.slice(5, 21);
  const iv = data.slice(21, 33);
  const ciphertextAndTag = data.slice(33);

  return { version, salt, iv, ciphertextAndTag };
}
