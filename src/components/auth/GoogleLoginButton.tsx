import { useGoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { toast } from 'sonner'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/** The official Google "G" mark — required by Google's branding
 * guidelines for a "Sign in with Google" button and not decorative,
 * so it renders even for reduced-motion / high-contrast users. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.86.92 7.51 2.56 10.78z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

interface GoogleLoginButtonProps {
  className?: string
  /** "lg" is used in the hero; the header keeps the compact size. */
  size?: 'default' | 'lg'
}

export const GoogleLoginButton = ({ className, size = 'default' }: GoogleLoginButtonProps) => {
  const { login } = useAuthStore()
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        // Fetch user profile from Google's userinfo endpoint
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch user info')
        }

        const userInfo = await res.json()

        // Save token and profile to Zustand authStore
        login(
          {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
          tokenResponse.access_token
        )

        toast.success('Successfully logged in!')
      } catch (error) {
        console.error('Error fetching user info:', error)
        toast.error('Login succeeded, but failed to retrieve user profile.')
      } finally {
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('Google Login Error:', error)
      toast.error('Google Login Failed. Please try again.')
      setIsLoading(false)
    },
    onNonOAuthError: () => {
      setIsLoading(false)
    }
  })

  // Follows Google's identity branding guidelines: a neutral-fill button
  // with the official multi-color "G" mark, offered in a light and a
  // dark variant that track the app's own theme.
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => {
        setIsLoading(true)
        handleLogin()
      }}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-3 rounded-md border font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
        isDark
          ? 'border-[#8e918f] bg-[#131314] text-[#e3e3e3] hover:bg-[#1a1a1b]'
          : 'border-[#747775] bg-white text-[#1f1f1f] hover:bg-[#f8f8f8]',
        size === 'lg' ? 'h-11 px-6 text-[15px]' : 'h-9 px-4 text-sm',
        className,
      )}
    >
      <GoogleGlyph />
      {isLoading ? 'Connecting to Google…' : 'Sign in with Google'}
    </button>
  )
}
