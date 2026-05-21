/**
 * PBKDF2 Key Derivation Provider
 *
 * Implements the KeyDerivationProvider interface using the native
 * Web Crypto API (window.crypto.subtle). This is the default and
 * currently only active provider in CipherDrive.
 *
 * Security defaults:
 *   - Iterations: 600,000 (OWASP recommendation for PBKDF2-HMAC-SHA256)
 *   - Hash: SHA-256
 *   - Key length: 256 bits (for AES-256-GCM)
 */

import type { KdfConfig, KeyDerivationProvider } from './types';

export const pbkdf2Provider: KeyDerivationProvider = {
  async deriveKey(
    password: string,
    salt: Uint8Array,
    config: KdfConfig,
  ): Promise<CryptoKey> {
    // Extract PBKDF2-relevant parameters with secure defaults
    const iterations = config.iterations || 600_000;
    const hash = config.hash || 'SHA-256';
    const keyLength = config.keyLength || 256;

    const encoder = new TextEncoder();

    // Step 1: Import the raw password as non-extractable key material.
    // Why non-extractable? The password key material should never leave
    // the Web Crypto sandbox — this is a zero-knowledge guarantee.
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false, // non-extractable
      ['deriveKey'],
    );

    // Step 2: Derive the final AES-GCM key via PBKDF2.
    // The derived key is also non-extractable and restricted to
    // encrypt/decrypt operations only.
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations,
        hash,
      },
      passwordKey,
      { name: 'AES-GCM', length: keyLength },
      false, // non-extractable
      ['encrypt', 'decrypt'],
    );
  },
};
