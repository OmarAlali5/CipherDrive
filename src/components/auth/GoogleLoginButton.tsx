import { useGoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { SignIn } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useState } from 'react'

export const GoogleLoginButton = () => {
  const { login } = useAuthStore()
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

  return (
    <Button 
      onClick={() => {
        setIsLoading(true)
        handleLogin()
      }} 
      size="lg" 
      disabled={isLoading}
      className="w-full sm:w-auto px-8 gap-3"
    >
      <SignIn className="h-5 w-5" />
      {isLoading ? 'Connecting to Google...' : 'Login with Google'}
    </Button>
  )
}
