import { useAuthStore } from '@/store/authStore'
import { Toaster } from 'sonner'
import { LandingPage } from '@/pages/LandingPage'
import { Dashboard } from '@/components/Dashboard'

export default function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="bottom-right" richColors />
        <LandingPage />
      </>
    )
  }

  return <Dashboard />
}
