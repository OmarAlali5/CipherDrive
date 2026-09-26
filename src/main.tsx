import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { applyTheme, getStoredPreference } from '@/lib/theme'

// index.html already set data-theme/color-scheme synchronously before
// paint (see the inline bootstrap script there). This call is only to
// bring the <meta name="theme-color"> tags in sync with that decision.
applyTheme(getStoredPreference())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
