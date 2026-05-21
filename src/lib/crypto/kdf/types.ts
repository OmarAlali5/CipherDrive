/**
 * KDF Abstraction Layer — Type Definitions
 *
 * Provides a strategy-pattern interface for Key Derivation Functions.
 * This decouples the encryption engine from any specific KDF algorithm,
 * allowing seamless future migration to Argon2id, scrypt, or hybrid modes
 * without rewriting core encryption/decryption logic.
 */

/**
 * Supported KDF algorithm identifiers.
 * Only PBKDF2 is implemented today; others are reserved for future use.
 */
export type KdfAlgorithm = 'PBKDF2' | 'ARGON2ID' | 'SCRYPT';

/**
 * Configuration object passed to any KDF provider.
 *
 * - `algorithm` selects the provider via the router.
 * - PBKDF2-specific: `iterations`, `hash`.
 * - Argon2id / scrypt-specific: `memory`, `parallelism`.
 * - `keyLength` is shared across all algorithms (in bits).
 */
export interface KdfConfig {
  /** Which KDF algorithm to use for key derivation. */
  algorithm: KdfAlgorithm;

  /** PBKDF2 iteration count (default: 600,000). */
  iterations?: number;

  /** PBKDF2 hash function (default: 'SHA-256'). */
  hash?: string;

  /** Memory cost in KiB — used by Argon2id and scrypt. */
  memory?: number;

  /** Degree of parallelism — used by Argon2id and scrypt. */
  parallelism?: number;

  /** Derived key length in bits (default: 256 for AES-256). */
  keyLength?: number;
}

/**
 * Contract that every KDF provider must satisfy.
 *
 * Implementors receive the raw password, a cryptographic salt, and the
 * full KdfConfig so they can extract the parameters relevant to their
 * algorithm while ignoring the rest.
 */
export interface KeyDerivationProvider {
  deriveKey(
    password: string,
    salt: Uint8Array,
    config: KdfConfig,
  ): Promise<CryptoKey>;
}

/**
 * Maps a CipherDrive file-format version string to the exact KDF
 * parameters that were (or should be) used for that version.
 *
 * This is the core of the migration strategy:
 *   - CDRV1: legacy files encrypted with 100,000 PBKDF2 iterations.
 *   - CDRV2: modern files encrypted with 600,000 PBKDF2 iterations.
 *
 * @param version - The version string extracted from the file header.
 * @returns The matching {@link KdfConfig}.
 * @throws {Error} If the version is unrecognized.
 */
export function getKdfConfigForVersion(version: string): KdfConfig {
  switch (version) {
    case 'CDRV1':
      return {
        algorithm: 'PBKDF2',
        iterations: 100_000,
        hash: 'SHA-256',
        keyLength: 256,
      };

    case 'CDRV2':
      return {
        algorithm: 'PBKDF2',
        iterations: 600_000,
        hash: 'SHA-256',
        keyLength: 256,
      };

    default:
      throw new Error(
        `Unsupported CipherDrive file version: "${version}". ` +
        'The file may have been created by a newer version of the application.',
      );
  }
}
