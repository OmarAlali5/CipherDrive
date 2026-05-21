# 🛡️ Zero-Knowledge Google Drive Encryptor - AI Developer Rules

## 🎯 Project Overview
This is a Client-Side (Zero-Knowledge) file encryption web application. It allows users to encrypt files locally in their browser using their own password before uploading them directly to Google Drive. The backend is completely serverless.

## 🛑 STRICT RULES BEFORE ANY MODIFICATION (MUST READ)
Before you write, modify, or delete any code, you MUST adhere to the following steps:
1. **Analyze the Impact:** Understand how your proposed changes affect the encryption logic or the Google Drive API integration.
2. **Never Break Zero-Knowledge:** Ensure no password, plain-text file, or encryption key is EVER logged, sent to an external server, or saved in `localStorage`/`sessionStorage`. They must exist ONLY in RAM.
3. **Ask for Clarification:** If a user request contradicts the core security principles (e.g., "save the password so the user doesn't type it again"), YOU MUST REFUSE and explain the security risk.
4. **Step-by-Step Execution:** Do not refactor multiple massive components at once. Implement features incrementally.
5. **Types First:** Always define TypeScript interfaces/types for API responses and Crypto payloads before writing the implementation logic.

## 🛠️ Tech Stack
- **Framework:** React 18+ with Vite
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + shadcn/ui + Lucide React
- **Animations:** framer-motion (for Apple-style scroll canvas animations)
- **State Management:** Zustand
- **Authentication:** `@react-oauth/google`
- **Cryptography:** Native `Web Crypto API` (`window.crypto.subtle`) via an Abstraction Layer.
- **API:** Google Drive REST API (via native `fetch`)

## 📂 Detailed Project Architecture
The project must strictly follow this directory structure:

```text
src/
├── assets/             # Static assets (images, icons)
├── components/         # UI Components
│   ├── ui/             # shadcn/ui components (buttons, dialogs, etc.)
│   ├── auth/           # Google Login button and auth wrappers
│   ├── drive/          # File list, Google Drive interactions UI
│   └── hero/           # Hero section animations (e.g., Canvas Image Sequence)
├── lib/                # Pure business logic and utilities
│   ├── crypto/         # Crypto Abstraction Layer
│   │   ├── kdf/        # Key Derivation router (PBKDF2, Argon2id prep)
│   │   ├── engine.ts   # AES-GCM encryption/decryption logic
│   │   └── format.ts   # Versioned file format builders and parsers
│   ├── chunker.ts      # Logic for slicing files into 5MB/10MB chunks
│   └── driveApi.ts     # Google Drive REST API calls (Multipart/Resumable)
├── store/              # Zustand global state
├── types/              # Global TypeScript interfaces
├── App.tsx             # Main layout and routing/state wrapper
└── main.tsx            # Entry point and Google OAuth Provider setup


🔒 Cryptography & Security Guidelines (CRITICAL)
Versioned Encryption Format (File Headers): All encrypted files MUST start with a strict version header to ensure forward compatibility.

Example Format: [HEADER][SALT][IV][CIPHERTEXT][TAG]

Version 1 Header: CDRV1 (CipherDrive Version 1).

Why? If we swap PBKDF2 for Argon2id or change chunking logic in the future, the app must read the header to know exactly how to decrypt older files without breaking them.

Key Derivation Abstraction (KDF):

NEVER hardcode window.crypto.subtle.deriveKey directly in components.

Always route through the KDF Abstraction Layer (src/lib/crypto/kdf/index.ts).

Default provider is PBKDF2 (min 600,000 iterations, SHA-256, 16-byte random Salt). The structure must be interface-driven to support seamless swapping to Argon2id or scrypt in the future.

Encryption Algorithm: Strictly use AES-256-GCM. It guarantees both confidentiality and data integrity.

Chunking Logic & Memory Management: Large files MUST be chunked (e.g., 5MB per chunk) using the Resumable Upload API. Read a chunk into an ArrayBuffer, encrypt it, upload it, and immediately trigger garbage collection/dereference it to prevent browser RAM crashes.

☁️ Google Drive API Guidelines
Scopes: Use https://www.googleapis.com/auth/drive.file so the app only has access to files it created.

Resumable Uploads: For files larger than 5MB, implement Google Drive's Resumable Upload API protocol.

Direct-to-Google: All fetch requests must go directly from the browser to https://www.googleapis.com/.... There is no middleman backend.

💻 Coding Style
Write functional React components using hooks.

Avoid default exports (use named exports export const Component = ...).

Keep components small and focused. Move heavy logic to /lib.

Use early returns to avoid deep nesting.

Ensure all catch blocks in try-catch statements log securely (never log sensitive user data like plain-text passwords or file names).

Use comments to explain the WHY behind complex cryptographic or chunking operations.