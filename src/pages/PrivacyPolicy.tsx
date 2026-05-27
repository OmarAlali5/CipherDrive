import { LegalLayout } from '@/components/LegalLayout'

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-sm text-slate-400 italic mb-8">Last Updated: 25/05/2026</p>
      
      <p className="text-base leading-relaxed">
        CipherDrive ("we", "our", or "us") is committed to absolute data privacy. Our application is built from the ground up on a Zero-Knowledge architecture. This Privacy Policy explains how we interact with your information.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">1. Data Collection & Zero-Knowledge Architecture</h2>
      <p className="text-base leading-relaxed">
        We do not collect, transmit, or store your personal files, encryption passwords, or decrypted data on any external servers. All cryptographic operations (encryption and decryption) using <strong className="text-emerald-400 font-semibold">AES-256-GCM</strong> happen entirely locally within your browser's memory (RAM). Your encryption keys evaporate the moment you close the application.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">2. Google User Data</h2>
      <p className="text-base leading-relaxed mb-4">
        CipherDrive utilizes Google Workspace APIs to function.
      </p>
      <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500">
        <li><strong className="text-slate-200">Authentication:</strong> We use Google Identity Services to authenticate you.</li>
        <li><strong className="text-slate-200">Google Drive Integration:</strong> We request access to your Google Drive to upload your locally-encrypted ciphertext and download it for local decryption.</li>
        <li><strong className="text-slate-200">Data Privacy:</strong> We do not share your Google User Data with any third-party tools, advertisers, or analytics services. We have no access to the plaintext content of the files you upload via CipherDrive.</li>
      </ul>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">3. Local Storage</h2>
      <p className="text-base leading-relaxed">
        We may use standard browser features like <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-sm text-emerald-300">localStorage</code> or <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-sm text-emerald-300">sessionStorage</code> strictly to maintain your active authentication session tokens. We <strong className="text-rose-400 font-semibold">NEVER</strong> store your encryption passwords in cookies or local storage.
      </p>

      <h2 className="text-xl font-semibold text-slate-100 mt-10 mb-4">4. Contact</h2>
      <p className="text-base leading-relaxed">
        If you have any questions regarding this privacy policy, you can contact the developer at: <a href="mailto:omar.alali966@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 transition-colors">omar.alali966@gmail.com</a>
      </p>
    </LegalLayout>
  )
}
