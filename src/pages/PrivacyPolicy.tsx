import { LegalLayout } from '@/components/LegalLayout'

const LAST_UPDATED = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date('2026-05-25'))

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <p className="text-base leading-relaxed">
        CipherDrive ("we", "our", or "us") is built on a zero-knowledge
        architecture. This policy explains, specifically, how we interact
        with your information.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">1. Data collection &amp; zero-knowledge architecture</h2>
      <p className="text-base leading-relaxed">
        We do not collect, transmit, or store your personal files, encryption
        passwords, or decrypted data on any external servers. Encryption and
        decryption using <strong className="font-semibold text-primary">AES-256-GCM</strong> happen
        entirely in your browser's memory. Your encryption key is discarded
        as soon as the operation completes.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">2. Google user data</h2>
      <p className="mb-4 text-base leading-relaxed">
        CipherDrive integrates with Google Identity Services and the Google
        Drive API.
      </p>
      <ul className="list-disc space-y-2 pl-6 marker:text-primary">
        <li><strong className="text-foreground">Authentication:</strong> Google Identity Services confirms who you are.</li>
        <li><strong className="text-foreground">Google Drive:</strong> we request access limited to files CipherDrive creates (the <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">drive.file</code> scope), to upload your encrypted ciphertext and download it for local decryption.</li>
        <li><strong className="text-foreground">No sharing:</strong> we do not share your Google user data with any third party, advertiser, or analytics service. We have no access to the plaintext content of files you upload through CipherDrive.</li>
      </ul>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">3. Local storage</h2>
      <p className="text-base leading-relaxed">
        Your session token and profile are kept in your browser's <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">sessionStorage</code> so
        you stay signed in during a visit; they're cleared when the tab
        closes. We never write your encryption password to storage, cookies,
        or logs.
      </p>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-foreground">4. Contact</h2>
      <p className="text-base leading-relaxed">
        Questions about this policy: <a href="mailto:omar.alali966@gmail.com" className="text-primary underline underline-offset-4 hover:text-primary/80">omar.alali966@gmail.com</a>
      </p>
    </LegalLayout>
  )
}
