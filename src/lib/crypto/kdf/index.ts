/**
 * KDF Router — Central entry point for all key derivation operations.
 *
 * Implements the Strategy pattern: callers provide a KdfConfig with an
 * `algorithm` field, and this module routes to the correct provider.
 * Adding a new KDF is as simple as:
 *   1. Implementing the KeyDerivationProvider interface.
 *   2. Adding a case to the switch statement below.
 *
 * This file is the ONLY place external code should import key derivation
 * from. Direct usage of window.crypto.subtle.deriveKey is prohibited
 * elsewhere in the codebase (see RULES.md).
 */

import type { KdfConfig } from './types';
import { pbkdf2Provider } from './pbkdf2';

/**
 * Derives an AES-GCM CryptoKey from a password and salt using the
 * algorithm specified in `config.algorithm`.
 *
 * @param password - The user's plain-text password (kept in RAM only).
 * @param salt     - A cryptographically random salt (recommended 16 bytes).
 * @param config   - KDF configuration including algorithm selection and tuning params.
 * @returns A non-extractable AES-GCM CryptoKey suitable for encrypt/decrypt.
 *
 * @throws {Error} If the requested algorithm is not yet implemented.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  config: KdfConfig,
): Promise<CryptoKey> {
  switch (config.algorithm) {
    case 'PBKDF2':
      return pbkdf2Provider.deriveKey(password, salt, config);

    case 'ARGON2ID':
      // Argon2id requires a WASM module — reserved for a future release.
      throw new Error(
        'KDF algorithm "ARGON2ID" is not implemented yet. ' +
        'See src/lib/crypto/kdf/ for the provider interface.',
      );

    case 'SCRYPT':
      // scrypt support is planned but not yet available.
      throw new Error(
        'KDF algorithm "SCRYPT" is not implemented yet. ' +
        'See src/lib/crypto/kdf/ for the provider interface.',
      );

    default: {
      // Exhaustive check — TypeScript will flag if a new KdfAlgorithm
      // variant is added but not handled here.
      const _exhaustive: never = config.algorithm;
      throw new Error(`Unknown KDF algorithm: "${_exhaustive}".`);
    }
  }
}

// Re-export all public types so consumers only need one import path.
export type { KdfAlgorithm, KdfConfig, KeyDerivationProvider } from './types';
export { getKdfConfigForVersion } from './types';
