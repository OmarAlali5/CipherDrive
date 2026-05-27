import { useAuthStore } from '@/store/authStore'
import { Toaster } from 'sonner'
import { LandingPage } from '@/pages/LandingPage'
import { Dashboard } from '@/components/Dashboard'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { TermsOfService } from '@/pages/TermsOfService'

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<h1 className="text-white text-center mt-20 text-2xl">404 - Page Not Found by React Router</h1>} />
      </Routes>
    </Router>
  )
}