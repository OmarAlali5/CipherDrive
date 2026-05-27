import { LegalLayout } from '@/components/LegalLayout'

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="text-sm text-slate-400 italic mb-8">Last Updated: 25/05/2026</p>

      <p className="text-base leading-relaxed">
        By using CipherDrive, you agree to these Terms of Service.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">1. Acceptance of Risk (The Zero-Knowledge Clause)</h2>
      <p className="text-base leading-relaxed mb-4">
        CipherDrive is a client-side encryption tool. You acknowledge and agree that <strong className="text-rose-400 font-bold uppercase">we do not store your encryption passwords.</strong>
      </p>
      <ul className="list-none space-y-2">
        <li className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-200">
          <strong className="text-rose-400 font-bold">CRITICAL:</strong> If you forget or lose the password used to encrypt a file, that file is permanently unrecoverable. There is no "Forgot Password" mechanism. You assume 100% responsibility for securely managing your passwords.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">2. Provided "As-Is"</h2>
      <p className="text-base leading-relaxed">
        CipherDrive is provided on an "as-is" and "as available" basis without any warranties, express or implied. While we utilize industry-standard AES-256-GCM cryptography, we do not guarantee that the service will be entirely error-free or uninterrupted.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">3. Limitation of Liability</h2>
      <p className="text-base leading-relaxed">
        In no event shall CipherDrive, its developers, or affiliates be liable for any data loss, file corruption, indirect, incidental, or consequential damages arising out of your use or inability to use the service. You are strongly advised to keep backups of your critical plaintext files before encrypting and uploading them.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">4. User Responsibilities</h2>
      <p className="text-base leading-relaxed">
        You agree not to use CipherDrive to encrypt or distribute illegal, malicious, or highly restricted content that violates Google Drive's terms of service.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">5. Changes to Terms</h2>
      <p className="text-base leading-relaxed">
        We reserve the right to modify these terms at any time. Continued use of the application constitutes acceptance of the new terms.
      </p>
    </LegalLayout>
  )
}
