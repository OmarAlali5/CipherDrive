import { LegalLayout } from '@/components/LegalLayout'

const LAST_UPDATED = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date('2026-05-25'))

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <p className="text-base leading-relaxed">
        By using CipherDrive, you agree to these terms.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">1. No password recovery</h2>
      <p className="mb-4 text-base leading-relaxed">
        CipherDrive is a client-side encryption tool. We do not store your
        encryption passwords, in any form, anywhere.
      </p>
      <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm leading-relaxed text-foreground">
        <strong className="text-destructive">This means:</strong> if you
        forget the password used to encrypt a file, that file cannot be
        decrypted by anyone, including us. There is no "forgot password"
        flow and no backdoor. You are responsible for storing your
        passwords securely, for example in a password manager.
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">2. Provided as-is</h2>
      <p className="text-base leading-relaxed">
        CipherDrive is provided "as is," without warranty of any kind. We use
        AES-256-GCM encryption and follow current key-derivation guidance,
        but we do not guarantee the service will be error-free or
        uninterrupted.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">3. Limitation of liability</h2>
      <p className="text-base leading-relaxed">
        CipherDrive, its developers, and affiliates are not liable for data
        loss, file corruption, or any indirect or consequential damages
        arising from your use of the service. Keep independent backups of
        files you consider critical before encrypting and uploading them.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">4. Acceptable use</h2>
      <p className="text-base leading-relaxed">
        You agree not to use CipherDrive to store or distribute illegal
        content, or content that otherwise violates Google Drive's terms of
        service.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">5. Changes to these terms</h2>
      <p className="text-base leading-relaxed">
        We may update these terms from time to time. Continuing to use
        CipherDrive after a change means you accept the updated terms.
      </p>
    </LegalLayout>
  )
}
