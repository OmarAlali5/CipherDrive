import { Suspense, lazy } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { Toaster } from 'sonner'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { NotFound } from '@/pages/NotFound'
import { CircleNotch } from '@phosphor-icons/react'

// Split the marketing page and the authenticated app into separate
// chunks — a visitor only ever needs one of the two on first load.
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const Dashboard = lazy(() => import('@/components/Dashboard').then((m) => ({ default: m.Dashboard })))
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })))
const TermsOfService = lazy(() => import('@/pages/TermsOfService').then((m) => ({ default: m.TermsOfService })))

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <CircleNotch weight="bold" className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading…" />
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuthStore()
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)

  return (
    <Router>
      {/* Single toaster for the whole app — mounting one per page caused
          every notification to render twice. */}
      <Toaster
        position="bottom-right"
        richColors
        theme={resolvedTheme}
        toastOptions={{
          classNames: {
            toast: 'font-sans',
          },
        }}
      />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
